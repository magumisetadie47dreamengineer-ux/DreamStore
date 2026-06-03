export const FREE_SHIPPING_MIN = 75;

export function getShippingCost(subtotal: number): number {
  return subtotal >= FREE_SHIPPING_MIN || subtotal === 0 ? 0 : 5;
}

export function getOrderTotal(subtotal: number): number {
  return subtotal + getShippingCost(subtotal);
}
