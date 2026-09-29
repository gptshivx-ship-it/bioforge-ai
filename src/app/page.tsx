"use client";

import { useState } from "react";

const PLATFORMS = [
  { value: "linkedin", label: "LinkedIn", icon: "in" },
  { value: "twitter", label: "Twitter / X", icon: "𝕏" },
  { value: "instagram", label: "Instagram", icon: "📸" },
  { value: "tiktok", label: "TikTok", icon: "🎵" },
  { value: "github", label: "GitHub", icon: "💻" },
  { value: "website", label: "Personal Website", icon: "🌐" },
];

const TONES = [
  "Professional",
  "Witty & Clever",
  "Casual & Friendly",
  "Bold & Confident",
  "Minimalist",
  "Creative & Quirky",
];

export default function Home() {
  const [platform, setPlatform] = useState("");
  const [role, setRole] = useState("");
  const [skills, setSkills] = useState("");
  const [tone, setTone] = useState("Professional");
  const [extras, setExtras] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [copied, setCopied] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [buying, setBuying] = useState(false);

  async function startCheckout() {
    setBuying(true);
    setError("");
    try {
      const res = await fetch("/api/checkout", { method: "POST" });
      const data = await res.json();
      if (res.ok && data.url) {
        window.location.href = data.url;
        return;
      }
      setError(data.error || "Checkout is unavailable right now.");
    } catch {
      setError("Checkout is unavailable right now.");
    } finally {
      setBuying(false);
    }
  }

  async function handleGenerate() {
    if (!platform || !role) return;
    setLoading(true);
    setError("");
    setResult("");

    try {
      let licence = "";
      try {
        licence = localStorage.getItem("bioforge_licence") || "";
      } catch {}
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(licence ? { Authorization: `Licence ${licence}` } : {}),
        },
        body: JSON.stringify({ platform, role, skills, tone, extras }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || data.error);
        return;
      }

      setResult(data.bios);
      setRemaining(data.remaining);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function parseBios(text: string): string[] {
    const options = text.split(/OPTION \d+:\s*/i).filter((s) => s.trim());
    return options.map((b) => b.trim());
  }

  function copyBio(bio: string, index: number) {
    navigator.clipboard.writeText(bio);
    setCopied(index);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="max-w-4xl mx-auto px-4 pt-16 pb-8 text-center">
        <div className="inline-block mb-4 px-4 py-1.5 rounded-full text-sm"
          style={{ background: "rgba(109,40,217,0.15)", color: "#a78bfa", border: "1px solid rgba(109,40,217,0.3)" }}>
          Free — No signup required
        </div>
        <h1 className="text-5xl md:text-6xl font-bold mb-4 leading-tight">
          Generate Your Perfect <br />
          <span className="gradient-text">Social Media Bio</span>
        </h1>
        <p className="text-lg md:text-xl mb-8" style={{ color: "var(--muted)" }}>
          Stand out on LinkedIn, Twitter/X, Instagram, TikTok & more.
          <br />
          AI-crafted bios in seconds — 5 free per day.
        </p>
      </section>

      {/* Generator */}
      <section className="max-w-2xl mx-auto px-4 pb-8">
        <div className="card p-6 md:p-8 space-y-5">
          {/* Platform selector */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: "var(--muted)" }}>
              Platform
            </label>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
              {PLATFORMS.map((p) => (
                <button
                  key={p.value}
                  onClick={() => setPlatform(p.value)}
                  className="p-3 rounded-lg text-center transition-all text-sm"
                  style={{
                    background: platform === p.value ? "rgba(109,40,217,0.3)" : "var(--bg)",
                    border: `1px solid ${platform === p.value ? "rgba(139,92,246,0.5)" : "var(--border)"}`,
                    color: platform === p.value ? "#a78bfa" : "var(--muted)",
                  }}
                >
                  <div className="text-lg mb-1">{p.icon}</div>
                  <div className="text-xs">{p.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: "var(--muted)" }}>
              Your Role / Title *
            </label>
            <input
              type="text"
              placeholder="e.g., Full-Stack Developer, Marketing Manager, Freelance Designer"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            />
          </div>

          {/* Skills */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: "var(--muted)" }}>
              Key Skills / What You Do
            </label>
            <input
              type="text"
              placeholder="e.g., React, AI/ML, Brand Strategy, UX Design"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
            />
          </div>

          {/* Tone */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: "var(--muted)" }}>
              Tone
            </label>
            <div className="flex flex-wrap gap-2">
              {TONES.map((t) => (
                <button
                  key={t}
                  onClick={() => setTone(t)}
                  className="px-3 py-1.5 rounded-full text-sm transition-all"
                  style={{
                    background: tone === t ? "rgba(109,40,217,0.3)" : "transparent",
                    border: `1px solid ${tone === t ? "rgba(139,92,246,0.5)" : "var(--border)"}`,
                    color: tone === t ? "#a78bfa" : "var(--muted)",
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Extras */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: "var(--muted)" }}>
              Anything else? (optional)
            </label>
            <textarea
              rows={2}
              placeholder="e.g., Include that I'm based in NYC, mention my podcast, add humor"
              value={extras}
              onChange={(e) => setExtras(e.target.value)}
            />
          </div>

          {/* Generate button */}
          <button
            onClick={handleGenerate}
            disabled={loading || !platform || !role}
            className="btn-primary w-full text-center text-lg"
          >
            {loading ? (
              <span>
                Crafting your bio<span className="loading-dots"></span>
              </span>
            ) : (
              "Generate My Bio"
            )}
          </button>

          {remaining !== null && (
            <p className="text-center text-sm" style={{ color: "var(--muted)" }}>
              {remaining} free generation{remaining !== 1 ? "s" : ""} remaining today
            </p>
          )}
        </div>
      </section>

      {/* Error */}
      {error && (
        <section className="max-w-2xl mx-auto px-4 pb-4">
          <div className="rounded-lg p-4" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)" }}>
            <p className="text-red-400">{error}</p>
            {error.includes("limit") && (
              <a href="#pricing" className="text-purple-400 underline mt-2 inline-block">
                Get unlimited access &rarr;
              </a>
            )}
          </div>
        </section>
      )}

      {/* Results */}
      {result && (
        <section className="max-w-2xl mx-auto px-4 pb-12 fade-in">
          <h2 className="text-xl font-semibold mb-4">Your Bios</h2>
          <div className="space-y-4">
            {parseBios(result).map((bio, i) => (
              <div key={i} className="bio-result">
                <button
                  className="copy-btn"
                  onClick={() => copyBio(bio, i)}
                >
                  {copied === i ? "Copied!" : "Copy"}
                </button>
                <p className="text-sm font-medium mb-1" style={{ color: "var(--accent-light)" }}>
                  Option {i + 1}
                </p>
                <p className="whitespace-pre-wrap leading-relaxed">{bio}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Features */}
      <section className="max-w-4xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">
          Why <span className="gradient-text">BioForge</span>?
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              title: "Platform-Optimized",
              desc: "Each bio is tailored to the specific platform's format, character limits, and culture.",
              icon: "🎯",
            },
            {
              title: "3 Options Every Time",
              desc: "Get professional, balanced, and creative variations — pick the one that fits your vibe.",
              icon: "✨",
            },
            {
              title: "Instant & Free",
              desc: "No signup, no credit card. Generate 5 bios per day completely free.",
              icon: "⚡",
            },
          ].map((f) => (
            <div key={f.title} className="card p-6 text-center">
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="font-semibold mb-2">{f.title}</h3>
              <p className="text-sm" style={{ color: "var(--muted)" }}>
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="max-w-4xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-4">
          Go <span className="gradient-text">Unlimited</span>
        </h2>
        <p className="text-center mb-12" style={{ color: "var(--muted)" }}>
          Remove limits and unlock premium features.
        </p>
        <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          <div className="card p-6">
            <h3 className="font-semibold text-lg mb-1">Free</h3>
            <p className="text-3xl font-bold mb-4">$0</p>
            <ul className="space-y-2 text-sm mb-6" style={{ color: "var(--muted)" }}>
              <li>&#10003; 5 generations / day</li>
              <li>&#10003; All platforms</li>
              <li>&#10003; 3 bio options per generation</li>
              <li>&#10003; Copy to clipboard</li>
            </ul>
            <button className="w-full py-2 rounded-lg font-medium" style={{ border: "1px solid var(--border)", color: "var(--muted)" }}>
              Current Plan
            </button>
          </div>
          <div className="card p-6" style={{ border: "1px solid rgba(139,92,246,0.5)" }}>
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-semibold text-lg">Pro</h3>
            </div>
            <p className="text-3xl font-bold mb-4">
              $19 <span className="text-sm font-normal" style={{ color: "var(--muted)" }}>one-time</span>
            </p>
            <ul className="space-y-2 text-sm mb-6" style={{ color: "var(--muted)" }}>
              <li>&#10003; Unlimited generations</li>
              <li>&#10003; All platforms</li>
              <li>&#10003; 5 bio options per generation</li>
              <li>&#10003; Copy to clipboard</li>
            </ul>
            <button onClick={startCheckout} disabled={buying} className="btn-primary block w-full text-center">
              {buying ? "Opening checkout…" : "Get Pro Access"}
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-4xl mx-auto px-4 py-8 text-center text-sm" style={{ color: "var(--muted)", borderTop: "1px solid var(--border)" }}>
        <p>BioForge &mdash; AI-powered bio generator by ShivX Labs.</p>
        <p className="mt-1">
          Support: <a href="mailto:gptshivx@gmail.com">gptshivx@gmail.com</a> &middot; Card statements show SHIVX LABS.
        </p>
      </footer>
    </main>
  );
}
