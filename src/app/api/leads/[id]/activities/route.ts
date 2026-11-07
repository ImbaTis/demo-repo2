import type { NextRequest } from "next/server";
import { addActivity } from "@/lib/leads";
import { activityInputSchema } from "@/lib/validation";
import { handleServiceError, invalidJson, readJson, validationError } from "@/lib/api";

// POST /api/leads/:id/activities — { type: NOTE|CALL|EMAIL|MEETING, body }
export async function POST(request: NextRequest, ctx: RouteContext<"/api/leads/[id]/activities">) {
  const { id } = await ctx.params;
  const body = await readJson(request);
  if (!body || typeof body !== "object") return invalidJson();

  const parsed = activityInputSchema.safeParse(body);
  if (!parsed.success) return validationError(parsed.error);

  try {
    return Response.json({ activity: await addActivity(id, parsed.data) }, { status: 201 });
  } catch (e) {
    return handleServiceError(e);
  }
}
