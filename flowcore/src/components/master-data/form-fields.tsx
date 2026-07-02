import type { FormEvent, ReactNode } from "react";

export function Field({ children, label }: { children: ReactNode; label: string }) {
  return (
    <label className="grid gap-1 text-sm font-medium">
      {label}
      {children}
    </label>
  );
}

export const inputClass =
  "h-10 rounded-md border border-[var(--fc-border)] px-3 text-sm font-normal outline-none focus:border-[var(--fc-primary)]";

export const selectClass =
  "h-10 rounded-md border border-[var(--fc-border)] bg-white px-3 text-sm font-normal outline-none focus:border-[var(--fc-primary)]";

export const actionButtonClass =
  "inline-flex h-10 items-center justify-center whitespace-nowrap rounded-md bg-[var(--fc-primary)] px-3 text-sm font-medium text-white";

export const secondaryButtonClass =
  "inline-flex h-10 items-center justify-center whitespace-nowrap rounded-md border border-[var(--fc-border)] px-3 text-sm font-medium";

export const dangerButtonClass =
  "inline-flex h-10 items-center justify-center whitespace-nowrap rounded-md border border-red-200 px-3 text-sm font-medium text-red-700";

export function confirmDangerAction(message: string) {
  return (event: FormEvent<HTMLFormElement>) => {
    if (!window.confirm(message)) {
      event.preventDefault();
    }
  };
}
