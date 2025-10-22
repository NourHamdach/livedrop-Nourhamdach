// /apps/storefront/src/lib/format.ts
export function formatCurrency(n?: number | null) {
  if (typeof n !== "number" || isNaN(n)) return "—";
  return n.toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  });
}

export function formatNumber(n?: number | null) {
  if (typeof n !== "number" || isNaN(n)) return "—";
  return n.toLocaleString();
}
