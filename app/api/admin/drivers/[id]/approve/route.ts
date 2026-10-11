import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db/mock-db";
import { successResponse, errorResponse, handleApiError } from "@/lib/api/with-api";

export async function POST(
  _req: NextRequest,
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

    driverProf.status = "approved";
    driverProf.approvedAt = new Date().toISOString();
    driverProf.approvedBy = user.id;
    driverProf.rejectionReason = undefined;
    db.driverProfiles.set(id, driverProf);

    // Notify driver
    const notifId = `notif_${Date.now()}`;
    db.notifications.set(notifId, {
      id: notifId,
      userId: id,
      type: "driver_approved",
      title: "Driver Application Approved! 🎉",
      body: "Congratulations! Your driver account has been approved. You can now go online to accept rides.",
      data: { driverId: id },
      createdAt: new Date().toISOString(),
    });

    return successResponse(driverProf);
  } catch (error) {
    return handleApiError(error);
  }
}

