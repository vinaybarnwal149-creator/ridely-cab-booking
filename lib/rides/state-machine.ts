import { RideStatus, UserRole } from "../types";
import { AppError } from "../errors";

const ALLOWED_TRANSITIONS: Record<RideStatus, RideStatus[]> = {
  requested: ["accepted", "cancelled", "expired"],
  accepted: ["arrived", "cancelled", "requested"],
  arrived: ["in_progress", "cancelled"],
  in_progress: ["completed"],
  completed: [],
  cancelled: [],
  expired: [],
};

export function validateRideTransition(
  fromStatus: RideStatus,
  toStatus: RideStatus,
  actorRole: UserRole
): void {
  const allowed = ALLOWED_TRANSITIONS[fromStatus] || [];
  if (!allowed.includes(toStatus)) {
    throw new AppError(
      "INVALID_TRANSITION",
      409,
      `Cannot transition ride from status '${fromStatus}' to '${toStatus}'`
    );
  }

  // Validate actor permissions
  if (toStatus === "accepted" && actorRole !== "driver" && actorRole !== "admin") {
    throw new AppError("FORBIDDEN", 403, "Only drivers or admins can accept rides");
  }
  if (toStatus === "arrived" && actorRole !== "driver" && actorRole !== "admin") {
    throw new AppError("FORBIDDEN", 403, "Only drivers or admins can mark arrived");
  }
  if (toStatus === "in_progress" && actorRole !== "driver" && actorRole !== "admin") {
    throw new AppError("FORBIDDEN", 403, "Only drivers or admins can start rides");
  }
  if (toStatus === "completed" && actorRole !== "driver" && actorRole !== "admin") {
    throw new AppError("FORBIDDEN", 403, "Only drivers or admins can complete rides");
  }
}

