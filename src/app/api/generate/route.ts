import { generateText } from "@/lib/llm";
import { NextRequest, NextResponse } from "next/server";

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

const FREE_LIMIT = 5;
const WINDOW_MS = 24 * 60 * 60 * 1000; // 24 hours

function getRateLimit(ip: string) {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 0, resetAt: now + WINDOW_MS });
    return { count: 0, limited: false };
  }
  return { count: entry.count, limited: entry.count >= FREE_LIMIT };
}

function incrementRate(ip: string) {
  const entry = rateLimitMap.get(ip);
  if (entry) entry.count++;
}

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown";
  const { limited, count } = getRateLimit(ip);

  if (limited) {
    return NextResponse.json(
      {
        error: "Daily limit reached",
        message:
          "You've used all 5 free generations today. Upgrade for unlimited access!",
        remaining: 0,
      },
      { status: 429 }
    );
  }

  const { platform, role, skills, tone, extras } = await request.json();

  if (!platform || !role) {
    return NextResponse.json(
      { error: "Platform and role are required" },
      { status: 400 }
    );
  }

  const prompt = `Generate a compelling, scroll-stopping social media bio for ${platform}.

ABOUT THE PERSON:
- Role/Title: ${role}
- Key Skills/Expertise: ${skills || "not specified"}
- Desired Tone: ${tone || "professional yet approachable"}
- Extra Details: ${extras || "none"}

REQUIREMENTS:
- Optimized specifically for ${platform}'s format and character limits
- Include relevant emojis if appropriate for the platform
- Make it memorable and unique — avoid generic phrases like "passionate about"
- Include a subtle call-to-action if appropriate
- For LinkedIn: professional, keyword-rich, 200-300 chars
- For Twitter/X: witty, concise, under 160 chars
- For Instagram: personality-driven, with line breaks and emojis, under 150 chars
- For TikTok: casual, trend-aware, under 80 chars
- For GitHub: technical, concise, under 160 chars
- For personal website: longer, story-driven, 2-3 sentences

Generate exactly 3 different bio options, from most professional to most creative.
Format as:
OPTION 1:
[bio text]

OPTION 2:
[bio text]

OPTION 3:
[bio text]`;

  try {
    const text = await generateText(prompt);
    incrementRate(ip);
    return NextResponse.json({ bios: text, remaining: FREE_LIMIT - count - 1 });
  } catch (err) {
    console.error("Generation error:", err);
    return NextResponse.json({ error: "Failed to generate bio. Please try again." }, { status: 500 });
  }
}
