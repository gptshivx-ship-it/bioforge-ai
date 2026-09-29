// FROZEN spec (ShivX lane 96, 2026-09-29): a customer sees the bios, never the model's thinking. Measured leak shapes
// ("We need to produce 5...", "Here's a thinking process:") are rejected or cut, never shown.
import { describe, expect, it } from "vitest";
import { acceptBios } from "../src/lib/prompt";

describe("acceptBios", () => {
  it("keeps a clean answer from OPTION 1 on", () => {
    expect(acceptBios("OPTION 1:\nA\n\nOPTION 2:\nB")).toBe("OPTION 1:\nA\n\nOPTION 2:\nB");
  });
  it("cuts a preamble or leaked thinking before OPTION 1 (markdown bold allowed)", () => {
    expect(acceptBios("Here's a thinking process:\n1. analyse\n\n**OPTION 1:**\nA")).toBe("**OPTION 1:**\nA");
  });
  it("rejects an answer with no OPTION 1 at all (all thinking, or truncated)", () => {
    expect(acceptBios("We need to produce 5 different bio options for LinkedIn...")).toBeNull();
  });
});
