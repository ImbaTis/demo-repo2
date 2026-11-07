import { z } from "zod";
import { DuplicateEmailError, LeadNotFoundError } from "./leads";

export function validationError(error: z.ZodError) {
  return Response.json(
    { error: "Validation failed", fieldErrors: z.flattenError(error).fieldErrors },
    { status: 400 },
  );
}

export async function readJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return undefined;
  }
}

export const invalidJson = () =>
  Response.json({ error: "Request body must be a JSON object" }, { status: 400 });

export const notFound = () => Response.json({ error: "Lead not found" }, { status: 404 });

/** Maps service errors to HTTP responses; rethrows anything unexpected. */
export function handleServiceError(e: unknown) {
  if (e instanceof LeadNotFoundError) return notFound();
  if (e instanceof DuplicateEmailError) {
    return Response.json(
      { error: e.message, fieldErrors: { email: [e.message] } },
      { status: 409 },
    );
  }
  throw e;
}
