import { z } from "zod";
import { LEAD_SOURCES, LEAD_STATUSES, USER_ACTIVITY_TYPES } from "./constants";

// Form fields arrive as strings; treat blank input as "not provided".
const blankToUndefined = (v: unknown) =>
  typeof v === "string" && v.trim() === "" ? undefined : v;

const optionalText = (max: number) =>
  z.preprocess(blankToUndefined, z.string().trim().max(max).optional());

export const leadInputSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(200),
  company: optionalText(200),
  email: z.preprocess(
    blankToUndefined,
    z
      .string()
      .trim()
      .toLowerCase()
      .max(320)
      .pipe(z.email("Enter a valid email address"))
      .optional(),
  ),
  phone: optionalText(50),
  status: z.enum(LEAD_STATUSES).default("NEW"),
  source: z.enum(LEAD_SOURCES).default("OTHER"),
  value: z.preprocess(
    blankToUndefined,
    z.coerce
      .number({ error: "Value must be a number" })
      .int("Value must be a whole number")
      .min(0, "Value can't be negative")
      .max(1_000_000_000)
      .optional(),
  ),
  notes: optionalText(5000),
});
export type LeadInput = z.infer<typeof leadInputSchema>;

// For PATCH: every field optional, no defaults applied.
export const leadUpdateSchema = z
  .object({
    name: leadInputSchema.shape.name,
    company: leadInputSchema.shape.company,
    email: leadInputSchema.shape.email,
    phone: leadInputSchema.shape.phone,
    status: z.enum(LEAD_STATUSES),
    source: z.enum(LEAD_SOURCES),
    value: leadInputSchema.shape.value,
    notes: leadInputSchema.shape.notes,
  })
  .partial();
export type LeadUpdate = z.infer<typeof leadUpdateSchema>;

export const activityInputSchema = z.object({
  type: z.enum(USER_ACTIVITY_TYPES),
  body: z.string().trim().min(1, "Write something first").max(5000),
});
export type ActivityInput = z.infer<typeof activityInputSchema>;

export const leadFiltersSchema = z.object({
  q: z.preprocess(blankToUndefined, z.string().trim().max(200).optional()),
  status: z.preprocess(blankToUndefined, z.enum(LEAD_STATUSES).optional()).catch(undefined),
  source: z.preprocess(blankToUndefined, z.enum(LEAD_SOURCES).optional()).catch(undefined),
  sort: z
    .enum(["newest", "oldest", "value_desc", "value_asc", "name", "updated"])
    .catch("newest")
    .default("newest"),
});
export type LeadFilters = z.infer<typeof leadFiltersSchema>;

export type FieldErrors = Partial<Record<string, string[]>>;
