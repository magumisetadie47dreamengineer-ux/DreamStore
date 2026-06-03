export function formatPrice(amount) {
  return new Intl.NumberFormat("en-ZW", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}
