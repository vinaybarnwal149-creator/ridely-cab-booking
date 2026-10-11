import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db/mock-db";
import { successResponse, errorResponse, handleApiError } from "@/lib/api/with-api";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().min(2),
  phone: z.string().min(10),
  email: z.string().email().optional(),
});

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return errorResponse(401, "UNAUTHENTICATED", "Not signed in");

    const contacts = Array.from(db.emergencyContacts.values()).filter(
      (c) => c.userId === user.id
    );

    return successResponse(contacts);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return errorResponse(401, "UNAUTHENTICATED", "Not signed in");

    const userContacts = Array.from(db.emergencyContacts.values()).filter(
      (c) => c.userId === user.id
    );
    if (userContacts.length >= 5) {
      return errorResponse(422, "CONTACT_LIMIT_REACHED", "Maximum 5 emergency contacts allowed");
    }

    const body = await req.json();
    const data = contactSchema.parse(body);

    const newContact = {
      id: `em_${Date.now()}`,
      userId: user.id,
      name: data.name,
      phone: data.phone,
      email: data.email,
      createdAt: new Date().toISOString(),
    };

    db.emergencyContacts.set(newContact.id, newContact);

    return successResponse(newContact);
  } catch (error) {
    return handleApiError(error);
  }
}

