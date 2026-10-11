import { Resend } from "resend";
import { env } from "@/lib/env";

export const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;

export interface SendReceiptEmailParams {
  to: string;
  rideId: string;
  totalPaise: number;
  pickupAddress: string;
  dropoffAddress: string;
  driverName?: string;
}

export async function sendReceiptEmail({
  to,
  rideId,
  totalPaise,
  pickupAddress,
  dropoffAddress,
  driverName = "Verified Driver",
}: SendReceiptEmailParams) {
  if (!resend) {
    console.log(`[Resend Mock] Receipt email for ride ${rideId} simulated to ${to}`);
    return { success: true, simulated: true };
  }

  try {
    const formattedFare = `₹${(totalPaise / 100).toFixed(2)}`;
    const data = await resend.emails.send({
      from: env.EMAIL_FROM || "Ridely <onboarding@resend.dev>",
      to: [to],
      subject: `Your Ridely Trip Receipt — ${rideId}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e5e5e5; border-radius: 8px;">
          <h1 style="font-size: 24px; font-weight: bold; margin-bottom: 8px;">Ridely Trip Receipt</h1>
          <p style="color: #666; font-size: 14px; margin-top: 0;">Ride ID: ${rideId}</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
          <div style="margin-bottom: 20px;">
            <p style="margin: 4px 0; font-size: 14px;"><strong>Pickup:</strong> ${pickupAddress}</p>
            <p style="margin: 4px 0; font-size: 14px;"><strong>Drop-off:</strong> ${dropoffAddress}</p>
            <p style="margin: 4px 0; font-size: 14px;"><strong>Driver:</strong> ${driverName}</p>
          </div>
          <div style="background-color: #f6f6f6; padding: 16px; border-radius: 6px; margin-bottom: 20px;">
            <p style="margin: 0; font-size: 18px; font-weight: bold;">Total Paid: ${formattedFare}</p>
          </div>
          <p style="color: #888; font-size: 12px; margin: 0;">Thank you for riding with Ridely Technologies Inc.</p>
        </div>
      `,
    });
    return { success: true, data };
  } catch (error) {
    console.error("Error sending receipt email with Resend:", error);
    return { success: false, error };
  }
}

