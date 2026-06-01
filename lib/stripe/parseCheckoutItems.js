/**
 * Resolve cart line items from a Stripe Checkout Session.
 * Metadata cart is primary; line_items + expanded product is fallback.
 */
export function parseCheckoutItems(session, lineItems = []) {
  const fromMeta = session.metadata?.cartItems;
  if (fromMeta) {
    try {
      const parsed = JSON.parse(fromMeta);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed
          .map((item) => ({
            productId: String(item.productId),
            quantity: Math.max(1, Number(item.quantity) || 1),
          }))
          .filter((item) => item.productId);
      }
    } catch {
      /* use line items fallback */
    }
  }

  return lineItems
    .map((line) => {
      const product = line.price?.product;
      const productId =
        (typeof product === "object" && product?.metadata?.productId) ||
        line.price?.product_data?.metadata?.productId;

      if (!productId) return null;

      const label =
        (typeof product === "object" && product?.name) || line.description;
      if (label === "Shipping") return null;

      return {
        productId: String(productId),
        quantity: line.quantity || 1,
      };
    })
    .filter(Boolean);
}
