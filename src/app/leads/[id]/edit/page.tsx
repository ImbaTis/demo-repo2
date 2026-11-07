import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { LeadForm } from "@/components/lead-form";
import { card } from "@/components/ui";
import { getLead } from "@/lib/leads";
import { updateLeadAction } from "../../actions";

export const metadata: Metadata = { title: "Edit lead" };

export default function EditLeadPage({ params }: PageProps<"/leads/[id]/edit">) {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Edit lead</h1>
      <Suspense fallback={<div className={`${card} h-96 animate-pulse`} />}>
        <EditForm params={params} />
      </Suspense>
    </div>
  );
}

async function EditForm({ params }: Pick<PageProps<"/leads/[id]/edit">, "params">) {
  await connection();
  const { id } = await params;
  const lead = await getLead(id);
  if (!lead) notFound();

  return (
    <LeadForm
      // Next keeps visited pages mounted; remount once the lead changes so stale
      // form state (e.g. an earlier validation error) doesn't reappear.
      key={`${lead.id}:${lead.updatedAt.getTime()}`}
      action={updateLeadAction.bind(null, lead.id)}
      defaults={{
        name: lead.name,
        company: lead.company ?? "",
        email: lead.email ?? "",
        phone: lead.phone ?? "",
        status: lead.status,
        source: lead.source,
        value: lead.value?.toString() ?? "",
        notes: lead.notes ?? "",
      }}
      submitLabel="Save changes"
      cancelHref={`/leads/${lead.id}`}
    />
  );
}
