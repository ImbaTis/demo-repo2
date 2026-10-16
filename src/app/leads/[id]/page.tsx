import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense, type ReactNode } from "react";
import { ActivityForm, DeleteLeadButton, StatusChanger } from "@/components/lead-actions";
import { StatusBadge } from "@/components/status-badge";
import { buttonSecondary, card } from "@/components/ui";
import { activityLabel, sourceLabel } from "@/lib/constants";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/format";
import { getLead } from "@/lib/leads";

export const metadata: Metadata = { title: "Lead" };

export default function LeadPage({ params }: PageProps<"/leads/[id]">) {
  return (
    <div className="space-y-6">
      <Link href="/leads" className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100">
        ← All leads
      </Link>
      <Suspense fallback={<LeadSkeleton />}>
        <LeadDetail params={params} />
      </Suspense>
    </div>
  );
}

async function LeadDetail({ params }: Pick<PageProps<"/leads/[id]">, "params">) {
  await connection();
  const { id } = await params;
  const lead = await getLead(id);
  if (!lead) notFound();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight break-words">{lead.name}</h1>
            <StatusBadge status={lead.status} />
          </div>
          {lead.company && <p className="mt-1 text-zinc-600 dark:text-zinc-400">{lead.company}</p>}
        </div>
        <div className="flex shrink-0 gap-2">
          <Link href={`/leads/${lead.id}/edit`} className={buttonSecondary}>Edit</Link>
          <DeleteLeadButton leadId={lead.id} name={lead.name} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className={`${card} p-5`}>
            <h2 className="mb-3 font-semibold">Log activity</h2>
            <ActivityForm leadId={lead.id} />
          </section>

          <section className={`${card} p-5`}>
            <h2 className="mb-4 font-semibold">Timeline</h2>
            <ol className="relative space-y-5 border-l border-zinc-200 pl-5 dark:border-zinc-800">
              {lead.activities.map((a) => (
                <li key={a.id} className="relative">
                  <span
                    aria-hidden
                    className={`absolute -left-[1.6rem] top-1.5 h-2.5 w-2.5 rounded-full ring-4 ring-white dark:ring-zinc-900 ${
                      a.type === "STATUS_CHANGE" ? "bg-indigo-500" : "bg-zinc-400 dark:bg-zinc-500"
                    }`}
                  />
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    <span className="font-medium text-zinc-700 dark:text-zinc-300">{activityLabel(a.type)}</span>
                    {" · "}
                    <time dateTime={a.createdAt.toISOString()}>{formatDateTime(a.createdAt)}</time>
                  </p>
                  <p className="mt-0.5 whitespace-pre-wrap break-words text-sm">{a.body}</p>
                </li>
              ))}
            </ol>
          </section>
        </div>

        <aside className="space-y-6">
          <section className={`${card} p-5`}>
            <h2 className="mb-3 font-semibold">Move lead</h2>
            <StatusChanger leadId={lead.id} status={lead.status} />
          </section>

          <section className={`${card} p-5`}>
            <h2 className="mb-3 font-semibold">Details</h2>
            <dl className="space-y-3 text-sm">
              <Detail label="Email">
                {lead.email ? <a href={`mailto:${lead.email}`} className="text-indigo-600 hover:underline break-all dark:text-indigo-400">{lead.email}</a> : "—"}
              </Detail>
              <Detail label="Phone">
                {lead.phone ? <a href={`tel:${lead.phone}`} className="text-indigo-600 hover:underline dark:text-indigo-400">{lead.phone}</a> : "—"}
              </Detail>
              <Detail label="Source">{sourceLabel(lead.source)}</Detail>
              <Detail label="Estimated value"><span className="tabular-nums">{formatCurrency(lead.value)}</span></Detail>
              <Detail label="Created">{formatDate(lead.createdAt)}</Detail>
              <Detail label="Last updated">{formatDate(lead.updatedAt)}</Detail>
            </dl>
          </section>

          {lead.notes && (
            <section className={`${card} p-5`}>
              <h2 className="mb-2 font-semibold">Notes</h2>
              <p className="whitespace-pre-wrap break-words text-sm text-zinc-700 dark:text-zinc-300">{lead.notes}</p>
            </section>
          )}
        </aside>
      </div>
    </div>
  );
}

function Detail({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{label}</dt>
      <dd className="mt-0.5">{children}</dd>
    </div>
  );
}

function LeadSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading lead">
      <div className="h-8 w-64 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className={`${card} h-80 animate-pulse lg:col-span-2`} />
        <div className={`${card} h-80 animate-pulse`} />
      </div>
    </div>
  );
}
