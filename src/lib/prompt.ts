export interface BioRequest {
  platform: string;
  role: string;
  skills?: string;
  tone?: string;
  extras?: string;
  options: 3 | 5; // free = 3, Pro = 5
}

export function buildPrompt(r: BioRequest): string {
  const format = Array.from({ length: r.options }, (_, i) => `OPTION ${i + 1}:\n[bio text]`).join("\n\n");
  return `Generate a compelling, scroll-stopping social media bio for ${r.platform}.

ABOUT THE PERSON:
- Role/Title: ${r.role}
- Key Skills/Expertise: ${r.skills || "not specified"}
- Desired Tone: ${r.tone || "professional yet approachable"}
- Extra Details: ${r.extras || "none"}

REQUIREMENTS:
- Optimized specifically for ${r.platform}'s format and character limits
- Include relevant emojis if appropriate for the platform
- Make it memorable and unique — avoid generic phrases like "passionate about"
- Include a subtle call-to-action if appropriate
- For LinkedIn: professional, keyword-rich, 200-300 chars
- For Twitter/X: witty, concise, under 160 chars
- For Instagram: personality-driven, with line breaks and emojis, under 150 chars
- For TikTok: casual, trend-aware, under 80 chars
- For GitHub: technical, concise, under 160 chars
- For personal website: longer, story-driven, 2-3 sentences

Generate exactly ${r.options} different bio options, from most professional to most creative.
Format as:
${format}`;
}

// Output check for generateText: the bios from the first "OPTION 1" on (a preamble or leaked model thinking is cut),
// or null when there is no OPTION 1 at all - the chain then tries the next model.
export function acceptBios(text: string): string | null {
  const m = /(\*\*)?OPTION 1\b/i.exec(text);
  return m ? text.slice(m.index).trim() : null;
}
