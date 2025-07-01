import { describe, it, expect } from "vitest";
import { formatNumber, formatDate, getLanguageColor } from "../utils/helpers";

describe("Helper Functions", () => {
  describe("formatNumber", () => {
    it("formats numbers with thousands separators", () => {
      expect(formatNumber(1000)).toBe("1,000");
      expect(formatNumber(1234567)).toBe("1,234,567");
      expect(formatNumber(42)).toBe("42");
    });
  });

  describe("formatDate", () => {
    it('returns "Today" for current date', () => {
      const today = new Date().toISOString();
      expect(formatDate(today)).toBe("Today");
    });

    it('returns "Yesterday" for yesterday', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      expect(formatDate(yesterday.toISOString())).toBe("Yesterday");
    });

    it("returns days ago for recent dates", () => {
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      expect(formatDate(threeDaysAgo.toISOString())).toBe("3 days ago");
    });
  });

  describe("getLanguageColor", () => {
    it("returns correct colors for known languages", () => {
      expect(getLanguageColor("JavaScript")).toBe("#F7DF1E");
      expect(getLanguageColor("TypeScript")).toBe("#3178C6");
      expect(getLanguageColor("Python")).toBe("#3776AB");
    });

    it("returns default color for unknown language", () => {
      expect(getLanguageColor("UnknownLang")).toBe("#8B5CF6");
    });

    it("returns default color for null language", () => {
      expect(getLanguageColor(null)).toBe("#8B5CF6");
    });
  });
});
