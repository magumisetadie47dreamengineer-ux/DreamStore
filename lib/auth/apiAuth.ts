import dbConnect from "@/lib/mongoose";
import type { UserRole } from "@/lib/roles";
import User from "@/mongo/models/User";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  branchId?: string;
};

export function getUserIdFromRequest(request: Request): string | null {
  const headerId = request.headers.get("x-user-id");
  if (headerId) return headerId;
  try {
    const url = new URL(request.url);
    return url.searchParams.get("userId");
  } catch {
    return null;
  }
}

export async function getUserFromRequest(
  request: Request
): Promise<AuthUser | null> {
  const userId = getUserIdFromRequest(request);
  if (!userId) return null;

  await dbConnect();
  const user = await User.findById(userId).lean();
  if (!user) return null;

  return {
    id: String(user._id),
    name: user.name,
    email: user.email,
    role: user.role as UserRole,
    branchId: user.branchId ? String(user.branchId) : undefined,
  };
}

export async function requireAuth(
  request: Request,
  allowedRoles?: UserRole[]
): Promise<{ user: AuthUser } | { error: Response }> {
  const user = await getUserFromRequest(request);
  if (!user) {
    return {
      error: new Response(JSON.stringify({ message: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }),
    };
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return {
      error: new Response(JSON.stringify({ message: "Forbidden" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      }),
    };
  }

  return { user };
}

export function resolveAdminEmail(): string | undefined {
  return process.env.ADMIN_EMAIL?.trim().toLowerCase();
}

export function roleForNewUser(email: string): UserRole {
  const adminEmail = resolveAdminEmail();
  if (adminEmail && email.trim().toLowerCase() === adminEmail) {
    return "admin";
  }
  return "buyer";
}
