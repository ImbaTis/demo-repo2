"use client";

import Link from "next/link";
import { useActionState, useId } from "react";
import type { FormState } from "@/app/leads/actions";
import { LEAD_SOURCES, LEAD_STATUSES, SOURCE_LABELS, STATUS_LABELS } from "@/lib/constants";
import { Field, errorProps } from "./field";
import { buttonPrimary, buttonSecondary, card, inputClass } from "./ui";

export type LeadFormValues = Partial<
  Record<"name" | "company" | "email" | "phone" | "status" | "source" | "value" | "notes", string>
>;

export function LeadForm({
  action,
  defaults = {},
  submitLabel,
  cancelHref,
}: {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  defaults?: LeadFormValues;
  submitLabel: string;
  cancelHref: string;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  const value = (key: keyof LeadFormValues) => state.values?.[key] ?? defaults[key] ?? "";
  const errors = state.fieldErrors ?? {};
  // Hidden, still-mounted pages can hold another copy of this form, so ids must be unique.
  const uid = useId();
  const fid = (name: string) => `${uid}-${name}`;

  return (
    <form action={formAction} noValidate className={`${card} space-y-5 p-5 sm:p-6`}>
      {state.formError && (
        <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-400">
          {state.formError}
        </p>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field id={fid("name")} label="Name *" errors={errors.name}>
          <input id={fid("name")} name="name" required autoComplete="off" defaultValue={value("name")} className={inputClass} {...errorProps(fid("name"), errors.name)} />
        </Field>
        <Field id={fid("company")} label="Company" errors={errors.company}>
          <input id={fid("company")} name="company" autoComplete="off" defaultValue={value("company")} className={inputClass} {...errorProps(fid("company"), errors.company)} />
        </Field>
        <Field id={fid("email")} label="Email" errors={errors.email}>
          <input id={fid("email")} name="email" type="email" autoComplete="off" defaultValue={value("email")} className={inputClass} {...errorProps(fid("email"), errors.email)} />
        </Field>
        <Field id={fid("phone")} label="Phone" errors={errors.phone}>
          <input id={fid("phone")} name="phone" type="tel" autoComplete="off" defaultValue={value("phone")} className={inputClass} {...errorProps(fid("phone"), errors.phone)} />
        </Field>
        <Field id={fid("status")} label="Status" errors={errors.status}>
          <select id={fid("status")} name="status" defaultValue={value("status") || "NEW"} className={inputClass}>
            {LEAD_STATUSES.map((s) => (
              <option key={s} value={s}>{STATUS_LABELS[s]}</option>
            ))}
          </select>
        </Field>
        <Field id={fid("source")} label="Source" errors={errors.source}>
          <select id={fid("source")} name="source" defaultValue={value("source") || "OTHER"} className={inputClass}>
            {LEAD_SOURCES.map((s) => (
              <option key={s} value={s}>{SOURCE_LABELS[s]}</option>
            ))}
          </select>
        </Field>
        <Field id={fid("value")} label="Estimated value (USD)" errors={errors.value} hint="Whole dollars, e.g. 12000">
          <input id={fid("value")} name="value" inputMode="numeric" autoComplete="off" defaultValue={value("value")} className={inputClass} {...errorProps(fid("value"), errors.value)} />
        </Field>
      </div>

      <Field id={fid("notes")} label="Notes" errors={errors.notes}>
        <textarea id={fid("notes")} name="notes" rows={4} defaultValue={value("notes")} className={inputClass} {...errorProps(fid("notes"), errors.notes)} />
      </Field>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Link href={cancelHref} className={buttonSecondary}>Cancel</Link>
        <button type="submit" disabled={pending} className={buttonPrimary}>
          {pending ? "Saving…" : submitLabel}
        </button>
      </div>
    </form>
  );
}
