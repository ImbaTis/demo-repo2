"use client";

import { useActionState, useId, useTransition } from "react";
import { addActivityAction, changeStatusAction, deleteLeadAction, type FormState } from "@/app/leads/actions";
import { LEAD_STATUSES, STATUS_LABELS, USER_ACTIVITY_TYPES, ACTIVITY_LABELS } from "@/lib/constants";
import { Field, errorProps } from "./field";
import { buttonDanger, buttonPrimary, inputClass } from "./ui";

export function StatusChanger({ leadId, status }: { leadId: string; status: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(
    changeStatusAction.bind(null, leadId),
    {},
  );
  const uid = useId();
  return (
    // Keyed on status so the select picks up the new value after a change.
    <form key={status} action={action} className="space-y-3">
      <Field id={`${uid}-status-select`} label="Status" errors={state.fieldErrors?.status}>
        <select id={`${uid}-status-select`} name="status" defaultValue={status} className={inputClass}>
          {LEAD_STATUSES.map((s) => (
            <option key={s} value={s}>{STATUS_LABELS[s]}</option>
          ))}
        </select>
      </Field>
      <Field id={`${uid}-status-note`} label="Note (optional)" errors={state.fieldErrors?.note}>
        <input id={`${uid}-status-note`} name="note" placeholder="Why is it moving?" className={inputClass} {...errorProps(`${uid}-status-note`, state.fieldErrors?.note)} />
      </Field>
      {state.formError && <p role="alert" className="text-sm text-red-600 dark:text-red-400">{state.formError}</p>}
      <button type="submit" disabled={pending} className={`${buttonPrimary} w-full`}>
        {pending ? "Updating…" : "Update status"}
      </button>
    </form>
  );
}

export function ActivityForm({ leadId }: { leadId: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(
    addActivityAction.bind(null, leadId),
    {},
  );
  const errors = state.fieldErrors ?? {};
  const uid = useId();
  return (
    <form action={action} className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-[10rem_minmax(0,1fr)]">
        <Field id={`${uid}-activity-type`} label="Type">
          <select id={`${uid}-activity-type`} name="type" defaultValue={state.values?.type ?? "NOTE"} className={inputClass}>
            {USER_ACTIVITY_TYPES.map((t) => (
              <option key={t} value={t}>{ACTIVITY_LABELS[t]}</option>
            ))}
          </select>
        </Field>
        <Field id={`${uid}-activity-body`} label="What happened?" errors={errors.body}>
          <textarea
            id={`${uid}-activity-body`}
            name="body"
            rows={2}
            placeholder="Called to discuss pricing…"
            defaultValue={state.values?.body ?? ""}
            className={inputClass}
            {...errorProps(`${uid}-activity-body`, errors.body)}
          />
        </Field>
      </div>
      {state.formError && <p role="alert" className="text-sm text-red-600 dark:text-red-400">{state.formError}</p>}
      <div className="flex justify-end">
        <button type="submit" disabled={pending} className={buttonPrimary}>
          {pending ? "Adding…" : "Add to timeline"}
        </button>
      </div>
    </form>
  );
}

export function DeleteLeadButton({ leadId, name }: { leadId: string; name: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      className={buttonDanger}
      onClick={() => {
        if (!confirm(`Delete ${name} and their activity history? This can't be undone.`)) return;
        startTransition(() => deleteLeadAction(leadId));
      }}
    >
      {pending ? "Deleting…" : "Delete"}
    </button>
  );
}
