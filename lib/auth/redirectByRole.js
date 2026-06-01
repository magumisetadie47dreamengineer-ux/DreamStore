export function dashboardPathForRole(role) {
  if (role === "admin") return "/dashboard/admin";
  if (role === "accounts") return "/dashboard/accounts";
  return "/account";
}

export function homePathAfterLogin(role, redirect) {
  if (role === "admin") return "/dashboard/admin";
  if (role === "accounts") return "/dashboard/accounts";
  if (redirect && redirect.startsWith("/") && !redirect.startsWith("//")) {
    return redirect;
  }
  return "/";
}
