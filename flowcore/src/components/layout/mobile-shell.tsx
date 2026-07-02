import type { ReactNode } from "react";

type MobileShellProps = {
  children: ReactNode;
};

export function MobileShell({ children }: MobileShellProps) {
  return (
    <main className="min-h-screen bg-[var(--fc-bg)] px-4 py-5 text-[var(--fc-text)]">
      <div className="mx-auto flex w-full max-w-md flex-col gap-5">{children}</div>
    </main>
  );
}
