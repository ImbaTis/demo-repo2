import { statusLabel, type LeadStatus } from "@/lib/constants";

const STYLES: Record<LeadStatus, string> = {
  NEW: "bg-sky-100 text-sky-800 ring-sky-600/20 dark:bg-sky-400/10 dark:text-sky-300 dark:ring-sky-400/30",
  CONTACTED: "bg-indigo-100 text-indigo-800 ring-indigo-600/20 dark:bg-indigo-400/10 dark:text-indigo-300 dark:ring-indigo-400/30",
  QUALIFIED: "bg-amber-100 text-amber-800 ring-amber-600/20 dark:bg-amber-400/10 dark:text-amber-300 dark:ring-amber-400/30",
  PROPOSAL: "bg-violet-100 text-violet-800 ring-violet-600/20 dark:bg-violet-400/10 dark:text-violet-300 dark:ring-violet-400/30",
  WON: "bg-emerald-100 text-emerald-800 ring-emerald-600/20 dark:bg-emerald-400/10 dark:text-emerald-300 dark:ring-emerald-400/30",
  LOST: "bg-zinc-100 text-zinc-700 ring-zinc-500/20 dark:bg-zinc-400/10 dark:text-zinc-300 dark:ring-zinc-400/30",
};

export function StatusBadge({ status }: { status: string }) {
  const style = STYLES[status as LeadStatus] ?? STYLES.LOST;
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${style}`}
    >
      {statusLabel(status)}
    </span>
  );
}
