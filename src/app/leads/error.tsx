"use client";

import { buttonSecondary, card } from "@/components/ui";

export default function LeadsError({ retry }: { error: Error; retry: () => void }) {
  return (
    <div className={`${card} mx-auto max-w-md px-6 py-12 text-center`} role="alert">
      <h1 className="text-lg font-semibold">Something went wrong</h1>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">The change may not have been saved.</p>
      <button type="button" onClick={() => retry()} className={`${buttonSecondary} mt-4`}>Try again</button>
    </div>
  );
}
