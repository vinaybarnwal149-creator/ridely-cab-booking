import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db/mock-db";
import { successResponse, errorResponse, handleApiError } from "@/lib/api/with-api";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return errorResponse(403, "FORBIDDEN", "Admin privileges required");
    }

    const totalRides = db.rides.size;
    let activeRides = 0;
    for (const [, r] of db.rides) {
      if (["requested", "accepted", "arrived", "in_progress"].includes(r.status)) {
        activeRides++;
      }
    }

    let onlineDrivers = 0;
    let pendingDrivers = 0;
    for (const [, dp] of db.driverProfiles) {
      if (dp.isOnline) onlineDrivers++;
      if (dp.status === "pending") pendingDrivers++;
    }

    let totalRevenuePaise = 0;
    for (const [, pay] of db.payments) {
      if (pay.status === "succeeded") {
        totalRevenuePaise += pay.amountPaise;
      }
    }

    let activeSosCount = 0;
    for (const [, s] of db.sosEvents) {
      if (s.status === "active") activeSosCount++;
    }

    let openTicketsCount = 0;
    for (const [, t] of db.supportTickets) {
      if (t.status === "open" || t.status === "in_progress") openTicketsCount++;
    }

    return successResponse({
      kpis: {
        totalRides,
        activeRides,
        onlineDrivers,
        pendingDrivers,
        totalRevenuePaise,
        activeSosCount,
        openTicketsCount,
      },
      recentRides: Array.from(db.rides.values())
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5),
    });
  } catch (error) {
    return handleApiError(error);
  }
}

