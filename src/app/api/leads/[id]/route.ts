import type { NextRequest } from "next/server";
import { z } from "zod";
import { deleteLead, getLead, updateLead } from "@/lib/leads";
import { leadUpdateSchema } from "@/lib/validation";
import { handleServiceError, invalidJson, notFound, readJson, validationError } from "@/lib/api";

// GET /api/leads/:id — includes the activity timeline
export async function GET(_request: NextRequest, ctx: RouteContext<"/api/leads/[id]">) {
  const { id } = await ctx.params;
  const lead = await getLead(id);
  return lead ? Response.json({ lead }) : notFound();
}

const patchSchema = leadUpdateSchema.extend({
  // Optional context recorded alongside a status change.
  statusNote: z.string().max(1000).optional(),
});

// PATCH /api/leads/:id — send only the fields to change; "" clears an optional field
export async function PATCH(request: NextRequest, ctx: RouteContext<"/api/leads/[id]">) {
  const { id } = await ctx.params;
  const body = await readJson(request);
  if (!body || typeof body !== "object") return invalidJson();

  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) return validationError(parsed.error);

  const { statusNote, ...update } = parsed.data;
  try {
    return Response.json({ lead: await updateLead(id, update, statusNote) });
  } catch (e) {
    return handleServiceError(e);
  }
}

// DELETE /api/leads/:id
export async function DELETE(_request: NextRequest, ctx: RouteContext<"/api/leads/[id]">) {
  const { id } = await ctx.params;
  try {
    await deleteLead(id);
    return new Response(null, { status: 204 });
  } catch (e) {
    return handleServiceError(e);
  }
}
