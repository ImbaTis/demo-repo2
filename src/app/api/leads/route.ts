import type { NextRequest } from "next/server";
import { connection } from "next/server";
import { createLead, listLeads } from "@/lib/leads";
import { leadFiltersSchema, leadInputSchema } from "@/lib/validation";
import { handleServiceError, invalidJson, readJson, validationError } from "@/lib/api";

// GET /api/leads?q=&status=&source=&sort=
export async function GET(request: NextRequest) {
  await connection();
  const filters = leadFiltersSchema.parse(Object.fromEntries(request.nextUrl.searchParams));
  return Response.json({ leads: await listLeads(filters) });
}

// POST /api/leads
export async function POST(request: NextRequest) {
  const body = await readJson(request);
  if (!body || typeof body !== "object") return invalidJson();

  const parsed = leadInputSchema.safeParse(body);
  if (!parsed.success) return validationError(parsed.error);

  try {
    const lead = await createLead(parsed.data);
    return Response.json({ lead }, { status: 201 });
  } catch (e) {
    return handleServiceError(e);
  }
}
