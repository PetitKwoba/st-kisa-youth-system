export type ContributionType =
  | "Registration fee"
  | "Welfare kitty"
  | "Table banking"
  | "Fine";

export function formatCurrency(amount: number): string {
  return `KES\u00a0${new Intl.NumberFormat("en-KE", {
    maximumFractionDigits: 0
  }).format(amount)}`;
}

export function calculateContributionMetrics(collected: number, target: number) {
  return {
    collected,
    target,
    outstanding: Math.max(target - collected, 0),
    rate: target === 0 ? 0 : Math.round((collected / target) * 100)
  };
}

export function validateContributionAmount(
  type: ContributionType,
  amount: number
): string | null {
  if (!Number.isFinite(amount) || amount <= 0) {
    return "Enter an amount greater than zero.";
  }

  if (type === "Table banking" && amount > 1000) {
    return "Table banking contributions cannot exceed KES 1,000 per month.";
  }

  return null;
}
