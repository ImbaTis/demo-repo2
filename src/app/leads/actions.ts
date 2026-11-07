"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { DuplicateEmailError, LeadNotFoundError, addActivity, createLead, deleteLead, updateLead } from "@/lib/leads";
import { activityInputSchema, leadInputSchema, type FieldErrors } from "@/lib/validation";
import { LEAD_STATUSES } from "@/lib/constants";

export type FormState = {
  fieldErrors?: FieldErrors;
  formError?: string;
  // Echoed back so the form can repopulate after React resets it.
  values?: Record<string, string>;
  // Bumped on success so client forms know to clear themselves.
  savedAt?: number;
};

function formValues(formData: FormData) {
  const values: Record<string, string> = {};
  for (const [key, value] of formData) {
    if (typeof value === "string" && !key.startsWith("$")) values[key] = value;
  }
  return values;
}

function failure(formData: FormData, error: unknown): FormState {
  const values = formValues(formData);
  if (error instanceof z.ZodError) return { values, fieldErrors: z.flattenError(error).fieldErrors };
  if (error instanceof DuplicateEmailError) return { values, fieldErrors: { email: [error.message] } };
  if (error instanceof LeadNotFoundError) return { values, formError: "This lead no longer exists." };
  throw error;
}

const refreshLeads = () => revalidatePath("/leads", "layout");

export async function createLeadAction(_prev: FormState, formData: FormData): Promise<FormState> {
  let id: string;
  try {
    const lead = await createLead(leadInputSchema.parse(formValues(formData)));
    id = lead.id;
  } catch (e) {
    return failure(formData, e);
  }
  refreshLeads();
  redirect(`/leads/${id}`);
}

export async function updateLeadAction(
  id: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  try {
    await updateLead(id, leadInputSchema.parse(formValues(formData)));
  } catch (e) {
    return failure(formData, e);
  }
  refreshLeads();
  redirect(`/leads/${id}`);
}

export async function deleteLeadAction(id: string): Promise<void> {
  try {
    await deleteLead(id);
  } catch (e) {
    // Already gone is fine: the goal state is reached.
    if (!(e instanceof LeadNotFoundError)) throw e;
  }
  refreshLeads();
  redirect("/leads");
}

const statusChangeSchema = z.object({
  status: z.enum(LEAD_STATUSES),
  note: z.string().max(1000).optional(),
});

export async function changeStatusAction(
  id: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  try {
    const { status, note } = statusChangeSchema.parse(formValues(formData));
    await updateLead(id, { status }, note);
  } catch (e) {
    return failure(formData, e);
  }
  refreshLeads();
  return { savedAt: Date.now() };
}

export async function addActivityAction(
  id: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  try {
    await addActivity(id, activityInputSchema.parse(formValues(formData)));
  } catch (e) {
    return failure(formData, e);
  }
  refreshLeads();
  return { savedAt: Date.now() };
}
