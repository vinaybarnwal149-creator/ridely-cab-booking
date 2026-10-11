import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db/mock-db";
import { successResponse, errorResponse, handleApiError } from "@/lib/api/with-api";
import { z } from "zod";

const rejectSchema = z.object({
  reason: z.string().min(3),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return errorResponse(403, "FORBIDDEN", "Admin privileges required");
    }

    const { id } = await params;
    const driverProf = db.driverProfiles.get(id);
    if (!driverProf) return errorResponse(404, "NOT_FOUND", "Driver profile not found");

    const body = await req.json();
    const { reason } = rejectSchema.parse(body);

    driverProf.status = "rejected";
    driverProf.rejectionReason = reason;
    db.driverProfiles.set(id, driverProf);

    // Notify driver
    const notifId = `notif_${Date.now()}`;
    db.notifications.set(notifId, {
      id: notifId,
      userId: id,
      type: "driver_rejected",
      title: "Driver Application Update",
      body: `Your application could not be approved: ${reason}. Please update your details and resubmit.`,
      data: { driverId: id, reason },
      createdAt: new Date().toISOString(),
    });

    return successResponse(driverProf);
  } catch (error) {
    return handleApiError(error);
  }
}

