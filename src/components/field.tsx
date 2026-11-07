import type { ReactNode } from "react";

export function Field({
  id,
  label,
  errors,
  hint,
  className = "",
  children,
}: {
  id: string;
  label: string;
  errors?: string[];
  hint?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
        {label}
      </label>
      {children}
      {errors?.length ? (
        <p id={`${id}-error`} className="mt-1 text-sm text-red-600 dark:text-red-400">
          {errors[0]}
        </p>
      ) : hint ? (
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{hint}</p>
      ) : null}
    </div>
  );
}

/** aria props wiring an input to its Field error message. */
export function errorProps(id: string, errors?: string[]) {
  return errors?.length ? { "aria-invalid": true, "aria-describedby": `${id}-error` } : {};
}
