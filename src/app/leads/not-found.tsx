import Link from "next/link";
import { buttonSecondary, card } from "@/components/ui";

export default function LeadNotFound() {
  return (
    <div className={`${card} mx-auto max-w-md px-6 py-12 text-center`}>
      <h1 className="text-lg font-semibold">Lead not found</h1>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">It may have been deleted.</p>
      <Link href="/leads" className={`${buttonSecondary} mt-4`}>Back to leads</Link>
    </div>
  );
}
