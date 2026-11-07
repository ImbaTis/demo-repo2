import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { FilterBar } from "@/components/filter-bar";
import { StatusBadge } from "@/components/status-badge";
import { buttonPrimary, card } from "@/components/ui";
import { sourceLabel } from "@/lib/constants";
import { formatCurrency, formatDate } from "@/lib/format";
import { listLeads } from "@/lib/leads";
import { leadFiltersSchema } from "@/lib/validation";

export const metadata: Metadata = { title: "Leads" };

export default function LeadsPage({ searchParams }: PageProps<"/leads">) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">Leads</h1>
        <Link href="/leads/new" className={buttonPrimary}>
          + New lead
        </Link>
      </div>
      <Suspense fallback={<LeadsSkeleton />}>
        <LeadsResults searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function LeadsResults({ searchParams }: Pick<PageProps<"/leads">, "searchParams">) {
  await connection();
  const raw = await searchParams;
  const filters = leadFiltersSchema.parse(
    Object.fromEntries(Object.entries(raw).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v])),
  );
  const leads = await listLeads(filters);
  const pipelineValue = leads
    .filter((l) => l.status !== "LOST" && l.status !== "WON")
    .reduce((sum, l) => sum + (l.value ?? 0), 0);
  const filtered = Boolean(filters.q || filters.status || filters.source);

  return (
    <div className="space-y-4">
      <FilterBar filters={filters} />

      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        {leads.length} {leads.length === 1 ? "lead" : "leads"}
        {leads.length > 0 && <> · {formatCurrency(pipelineValue)} open pipeline</>}
      </p>

      {leads.length === 0 ? (
        <div className={`${card} px-6 py-12 text-center`}>
          <p className="font-medium">{filtered ? "No leads match these filters." : "No leads yet."}</p>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            {filtered ? "Try a different search or clear the filters." : "Add your first lead to start tracking it."}
          </p>
          {!filtered && (
            <Link href="/leads/new" className={`${buttonPrimary} mt-4`}>
              + New lead
            </Link>
          )}
        </div>
      ) : (
        <>
          {/* Phone: stacked cards */}
          <ul className={`${card} divide-y divide-zinc-200 md:hidden dark:divide-zinc-800`}>
            {leads.map((lead) => (
              <li key={lead.id}>
                <Link href={`/leads/${lead.id}`} className="block px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-medium">{lead.name}</p>
                      <p className="truncate text-sm text-zinc-600 dark:text-zinc-400">
                        {lead.company ?? lead.email ?? sourceLabel(lead.source)}
                      </p>
                    </div>
                    <StatusBadge status={lead.status} />
                  </div>
                  <p className="mt-1 text-sm text-zinc-600 tabular-nums dark:text-zinc-400">
                    {formatCurrency(lead.value)} · {sourceLabel(lead.source)}
                  </p>
                </Link>
              </li>
            ))}
          </ul>

          {/* Tablet and up: table */}
          <div className={`${card} hidden overflow-hidden md:block`}>
            <table className="w-full text-left text-sm">
              <thead className="border-b border-zinc-200 bg-zinc-50 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-400">
                <tr>
                  <th className="px-4 py-3">Lead</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Source</th>
                  <th className="px-4 py-3 text-right">Value</th>
                  <th className="hidden px-4 py-3 lg:table-cell">Contact</th>
                  <th className="px-4 py-3">Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                    <td className="px-4 py-3">
                      <Link href={`/leads/${lead.id}`} className="font-medium hover:text-indigo-600 hover:underline dark:hover:text-indigo-400">
                        {lead.name}
                      </Link>
                      {lead.company && <p className="text-zinc-600 dark:text-zinc-400">{lead.company}</p>}
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={lead.status} /></td>
                    <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">{sourceLabel(lead.source)}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{formatCurrency(lead.value)}</td>
                    <td className="hidden px-4 py-3 text-zinc-600 lg:table-cell dark:text-zinc-400">
                      {lead.email && <p>{lead.email}</p>}
                      {lead.phone && <p>{lead.phone}</p>}
                      {!lead.email && !lead.phone && "—"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-zinc-600 dark:text-zinc-400">{formatDate(lead.updatedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

function LeadsSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Loading leads">
      <div className="h-10 animate-pulse rounded-md bg-zinc-200 dark:bg-zinc-800" />
      <div className={`${card} space-y-3 p-4`}>
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="h-8 animate-pulse rounded bg-zinc-100 dark:bg-zinc-800" />
        ))}
      </div>
    </div>
  );
}
