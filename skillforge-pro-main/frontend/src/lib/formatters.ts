export function formatInrRange(min?: number | null, max?: number | null) {
  if (typeof min !== "number" || typeof max !== "number") return "";
  const nf = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
  return `₹${nf.format(min)} - ₹${nf.format(max)}`;
}
