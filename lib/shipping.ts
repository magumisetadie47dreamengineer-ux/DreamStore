export const FREE_SHIPPING_MIN = 150;

export function getShippingCost(subtotal: number): number {
  return subtotal >= FREE_SHIPPING_MIN || subtotal === 0 ? 0 : 12;
}

export function getOrderTotal(subtotal: number): number {
  return subtotal + getShippingCost(subtotal);
}
