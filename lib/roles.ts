export const ROLES = ["admin", "accounts", "buyer"] as const;
export type UserRole = (typeof ROLES)[number];

export function isStaffRole(role: string): role is "admin" | "accounts" {
  return role === "admin" || role === "accounts";
}

export function canManageUsers(role: string) {
  return role === "admin";
}

export function canManageBranches(role: string) {
  return role === "admin";
}

export function canProcessOrders(role: string) {
  return role === "admin";
}

export function canManageInventory(role: string) {
  return role === "admin" || role === "accounts";
}

export function canViewPnL(role: string) {
  return role === "admin" || role === "accounts";
}
