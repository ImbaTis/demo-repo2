"use client";

import { usePathname, useRouter } from "next/navigation";
import { useRef, useTransition } from "react";
import { LEAD_SOURCES, LEAD_STATUSES, SOURCE_LABELS, STATUS_LABELS } from "@/lib/constants";
import type { LeadFilters } from "@/lib/validation";
import { inputClass } from "./ui";

const SORTS: { value: LeadFilters["sort"]; label: string }[] = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "updated", label: "Recently updated" },
  { value: "value_desc", label: "Value: high to low" },
  { value: "value_asc", label: "Value: low to high" },
  { value: "name", label: "Name A–Z" },
];

export function FilterBar({ filters }: { filters: LeadFilters }) {
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const debounce = useRef<ReturnType<typeof setTimeout>>(undefined);

  function apply() {
    clearTimeout(debounce.current);
    const params = new URLSearchParams();
    for (const [key, value] of new FormData(formRef.current!)) {
      if (typeof value !== "string" || !value.trim()) continue;
      if (key === "sort" && value === "newest") continue;
      params.set(key, value.trim());
    }
    const qs = params.toString();
    startTransition(() => router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false }));
  }

  const active = Boolean(filters.q || filters.status || filters.source || filters.sort !== "newest");

  return (
    <form
      ref={formRef}
      role="search"
      aria-busy={pending}
      onSubmit={(e) => {
        e.preventDefault();
        apply();
      }}
      onChange={(e) => {
        if ((e.target as HTMLElement).getAttribute("name") === "q") {
          clearTimeout(debounce.current);
          debounce.current = setTimeout(apply, 300);
        } else {
          apply();
        }
      }}
      className="grid grid-cols-2 gap-2 sm:grid-cols-[minmax(0,1fr)_auto_auto_auto]"
    >
      <div className="col-span-2 sm:col-span-1">
        <input name="q" aria-label="Search leads" type="search" placeholder="Search name, company, email, phone…" defaultValue={filters.q ?? ""} className={inputClass} />
      </div>
      <div>
        <select name="status" aria-label="Filter by status" defaultValue={filters.status ?? ""} className={inputClass}>
          <option value="">All statuses</option>
          {LEAD_STATUSES.map((s) => (
            <option key={s} value={s}>{STATUS_LABELS[s]}</option>
          ))}
        </select>
      </div>
      <div>
        <select name="source" aria-label="Filter by source" defaultValue={filters.source ?? ""} className={inputClass}>
          <option value="">All sources</option>
          {LEAD_SOURCES.map((s) => (
            <option key={s} value={s}>{SOURCE_LABELS[s]}</option>
          ))}
        </select>
      </div>
      <div className="col-span-2 sm:col-span-1">
        <select name="sort" aria-label="Sort leads" defaultValue={filters.sort} className={inputClass}>
          {SORTS.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>
      {active && (
        <button
          type="button"
          onClick={() => {
            // form.reset() would restore the active filters (the defaultValues), so clear by hand.
            for (const el of Array.from(formRef.current!.elements)) {
              if (el instanceof HTMLInputElement) el.value = "";
              if (el instanceof HTMLSelectElement) el.selectedIndex = 0;
            }
            apply();
          }}
          className="col-span-2 justify-self-start text-sm font-medium text-indigo-600 hover:underline sm:col-span-4 dark:text-indigo-400"
        >
          Clear filters
        </button>
      )}
    </form>
  );
}
