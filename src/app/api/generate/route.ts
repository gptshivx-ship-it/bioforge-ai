import { generateText, LlmBusy } from "@/lib/llm";
import { buildDeps, ipSalt, NotConfigured } from "@/lib/deps";
import { checkPro, consumeFree, peekFree, FREE_LIMIT } from "@/lib/entitlement";
import { acceptBios, buildPrompt } from "@/lib/prompt";
import { bumpMetric } from "@/lib/metrics";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  let deps;
  try {
    deps = buildDeps();
  } catch (e) {
    const msg = e instanceof NotConfigured ? "Service is being configured - please try again later." : "Service unavailable.";
    return NextResponse.json({ error: msg }, { status: 503 });
  }

  const { platform, role, skills, tone, extras } = await request.json();
  if (!platform || !role) {
    return NextResponse.json({ error: "Platform and role are required" }, { status: 400 });
  }

  const pro = await checkPro(request.headers.get("authorization"), deps);
  let remaining: number | null = null;
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!pro.pro) {
    // A presented-but-rejected licence is said plainly, never silently downgraded.
    if (pro.reason === "kv_unavailable") {
      return NextResponse.json({ error: "Service busy - please try again shortly." }, { status: 503 });
    }
    const free = await peekFree(ip, ipSalt(), deps);
    if (!free.allowed) {
      if (free.reason === "kv_unavailable") {
        return NextResponse.json({ error: "Service busy - please try again shortly." }, { status: 503 });
      }
      return NextResponse.json(
        {
          error: "Daily limit reached",
          message: `You've used all ${FREE_LIMIT} free generations today. Upgrade for unlimited access!`,
          remaining: 0,
          licence_problem: pro.reason === "no_licence" ? undefined : pro.reason,
        },
        { status: 429 }
      );
    }
    remaining = free.remaining;
  }

  try {
    const text = await generateText(buildPrompt({ platform, role, skills, tone, extras, options: pro.pro ? 5 : 3 }), { accept: acceptBios });
    if (!pro.pro) remaining = (await consumeFree(ip, ipSalt(), deps)).remaining; // count only a success
    await bumpMetric(deps.kv, deps.product, "gen", deps.now()); // usage counter (best effort)
    return NextResponse.json({ bios: text, remaining, pro: pro.pro });
  } catch (err) {
    console.error("Generation error:", err);
    if (err instanceof LlmBusy) {
      await bumpMetric(deps.kv, deps.product, "busy", deps.now());
      // The free AI capacity is spent or saturated right now: say so plainly (no free use was counted).
      return NextResponse.json({ error: "The AI service is busy right now - please try again in a few minutes.", busy: true }, { status: 503 });
    }
    return NextResponse.json({ error: "Failed to generate bio. Please try again." }, { status: 500 });
  }
}
