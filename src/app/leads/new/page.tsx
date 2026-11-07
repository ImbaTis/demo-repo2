import type { Metadata } from "next";
import { LeadForm } from "@/components/lead-form";
import { createLeadAction } from "../actions";

export const metadata: Metadata = { title: "New lead" };

export default function NewLeadPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">New lead</h1>
      <LeadForm action={createLeadAction} submitLabel="Create lead" cancelHref="/leads" />
    </div>
  );
}
