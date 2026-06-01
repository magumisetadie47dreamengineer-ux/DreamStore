export const FREE_SHIPPING_MIN = 100;

export function getShippingCost(subtotal: number): number {
  return subtotal >= FREE_SHIPPING_MIN || subtotal === 0 ? 0 : 9.99;
}

export function getOrderTotal(subtotal: number): number {
  return subtotal + getShippingCost(subtotal);
}
