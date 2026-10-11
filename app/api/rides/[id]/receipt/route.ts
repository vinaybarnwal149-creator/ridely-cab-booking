import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db/mock-db";
import { formatPaise, formatDistance, formatDuration, formatDateTime } from "@/lib/utils";
import { errorResponse, handleApiError } from "@/lib/api/with-api";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return errorResponse(401, "UNAUTHENTICATED", "Not signed in");

    const { id } = await params;
    const ride = db.rides.get(id);
    if (!ride) return errorResponse(404, "NOT_FOUND", "Ride not found");

    const payment = Array.from(db.payments.values()).find((p) => p.rideId === id);
    const driver = ride.driverId ? db.profiles.get(ride.driverId) : undefined;
    const driverProf = ride.driverId ? db.driverProfiles.get(ride.driverId) : undefined;

    const receiptHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <title>Receipt - ${payment?.receiptNumber || id}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; color: #0f172a; max-width: 650px; margin: auto; }
          .header { border-bottom: 2px solid #10b981; padding-bottom: 20px; display: flex; justify-content: space-between; align-items: center; }
          .logo { font-size: 24px; font-weight: 800; color: #10b981; }
          .meta { font-size: 13px; color: #64748b; margin-top: 15px; }
          .section { margin-top: 25px; border-bottom: 1px solid #e2e8f0; padding-bottom: 15px; }
          .section h3 { margin: 0 0 10px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; color: #475569; }
          .row { display: flex; justify-content: space-between; margin: 8px 0; font-size: 14px; }
          .total { font-size: 18px; font-weight: 800; color: #0f172a; margin-top: 15px; border-top: 2px solid #0f172a; padding-top: 12px; }
          .badge { background: #dcfce7; color: #15803d; padding: 4px 10px; border-radius: 9999px; font-size: 12px; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="logo">Ridely</div>
            <div style="font-size: 12px; color: #64748b;">Ride-Hailing Tax Invoice</div>
          </div>
          <div>
            <span class="badge">PAID</span>
          </div>
        </div>

        <div class="meta">
          <div><strong>Receipt #:</strong> ${payment?.receiptNumber || "RCP-" + id}</div>
          <div><strong>Date:</strong> ${formatDateTime(ride.completedAt || ride.createdAt)}</div>
          <div><strong>Rider:</strong> ${user.fullName} (${user.email})</div>
          ${driver ? `<div><strong>Driver:</strong> ${driver.fullName} (${driverProf?.vehicleMake} ${driverProf?.vehicleModel} - ${driverProf?.vehiclePlate})</div>` : ""}
        </div>

        <div class="section">
          <h3>Trip Details</h3>
          <div class="row">
            <span>Pickup</span>
            <span><strong>${ride.pickupAddress}</strong></span>
          </div>
          <div class="row">
            <span>Dropoff</span>
            <span><strong>${ride.dropoffAddress}</strong></span>
          </div>
          <div class="row">
            <span>Distance</span>
            <span>${formatDistance(ride.quotedDistanceM)}</span>
          </div>
          <div class="row">
            <span>Duration</span>
            <span>${formatDuration(ride.quotedDurationS)}</span>
          </div>
        </div>

        <div class="section">
          <h3>Fare Breakdown</h3>
          <div class="row">
            <span>Base Fare</span>
            <span>${formatPaise(ride.baseFarePaise)}</span>
          </div>
          <div class="row">
            <span>Distance Fare</span>
            <span>${formatPaise(ride.distanceFarePaise)}</span>
          </div>
          <div class="row">
            <span>Time Fare</span>
            <span>${formatPaise(ride.timeFarePaise)}</span>
          </div>
          ${ride.surgeAmountPaise > 0 ? `<div class="row"><span>Surge Pricing</span><span>${formatPaise(ride.surgeAmountPaise)}</span></div>` : ""}
          <div class="row">
            <span>Booking Fee</span>
            <span>${formatPaise(ride.bookingFeePaise)}</span>
          </div>
          ${ride.discountPaise > 0 ? `<div class="row" style="color: #10b981;"><span>Promotion Discount</span><span>-${formatPaise(ride.discountPaise)}</span></div>` : ""}

          <div class="row total">
            <span>Total Paid (${ride.paymentMethod.toUpperCase()})</span>
            <span>${formatPaise(ride.totalFarePaise)}</span>
          </div>
        </div>

        <div style="margin-top: 30px; font-size: 11px; color: #94a3b8; text-align: center;">
          Thank you for riding with Ridely! For help or inquiries, visit help.ridely.in or support@ridely.in.
        </div>
      </body>
      </html>
    `;

    return new NextResponse(receiptHtml, {
      headers: {
        "Content-Type": "text/html",
        "Content-Disposition": `inline; filename="receipt-${id}.html"`,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

