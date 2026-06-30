import { describe, expect, it } from "vitest";
import {
  calculateContributionMetrics,
  formatCurrency,
  validateContributionAmount
} from "./finance";

describe("finance helpers", () => {
  it("formats whole Kenya shillings consistently", () => {
    expect(formatCurrency(212500)).toBe("KES 212,500");
  });

  it("calculates collection rate and outstanding amount", () => {
    expect(calculateContributionMetrics(18250, 21250)).toEqual({
      collected: 18250,
      target: 21250,
      outstanding: 3000,
      rate: 86
    });
  });

  it("rejects table banking contributions above the approved limit", () => {
    expect(validateContributionAmount("Table banking", 1001)).toBe(
      "Table banking contributions cannot exceed KES 1,000 per month."
    );
  });

  it("accepts valid welfare contributions", () => {
    expect(validateContributionAmount("Welfare kitty", 250)).toBeNull();
  });
});
