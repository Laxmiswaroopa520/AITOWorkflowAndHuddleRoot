import { describe, expect, it } from "vitest";
import { createPowerPointFileName, isSupportedHyperlink, paginateSections } from "./powerPointHelpers";

describe("PowerPoint helpers", () => {
  it("creates a safe stable file name", () => {
    expect(createPowerPointFileName('Plan: A/B?')).toBe("Plan- A-B- - Huddle.pptx");
  });

  it("accepts only web hyperlinks", () => {
    expect(isSupportedHyperlink("https://example.com/resource")).toBe(true);
    expect(isSupportedHyperlink("javascript:alert(1)")).toBe(false);
    expect(isSupportedHyperlink(null)).toBe(false);
  });

  it("paginates long text without losing its content", () => {
    const source = "word ".repeat(500).trim();
    const pages = paginateSections([{ title: "Prompt", value: source }], 200);
    expect(pages.length).toBeGreaterThan(1);
    expect(pages.flatMap((page) => page).map((section) => section.value).join(" ")).toBe(source);
  });

  it("omits empty semantic sections", () => {
    expect(paginateSections([{ title: "Objective", value: "" }])).toEqual([]);
  });
});
