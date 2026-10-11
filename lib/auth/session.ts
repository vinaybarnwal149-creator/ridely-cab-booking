import { cookies } from "next/headers";
import { Profile, UserRole } from "../types";
import { db } from "../db/mock-db";
import { AppError } from "../errors";

export async function getCurrentUser(): Promise<Profile | null> {
  let activeUserId = "user_rider_1";
  try {
    const cookieStore = await cookies();
    activeUserId = cookieStore.get("ridely_user_id")?.value || "user_rider_1";
  } catch (err) {
    // Fallback during static generation / prerendering
  }

  const user = db.profiles.get(activeUserId);
  return user || null;
}

export async function requireUser(): Promise<Profile> {
  const user = await getCurrentUser();
  if (!user) {
    throw new AppError("UNAUTHENTICATED", 401, "You must be signed in to perform this action");
  }
  if (user.isSuspended) {
    throw new AppError("ACCOUNT_SUSPENDED", 403, "Your account has been suspended by an administrator");
  }
  return user;
}

export async function requireRole(role: UserRole): Promise<Profile> {
  const user = await requireUser();
  if (user.role !== role && user.role !== "admin") {
    throw new AppError(
      "FORBIDDEN",
      403,
      `Access denied. Requires '${role}' role, but current role is '${user.role}'`
    );
  }
  return user;
}
