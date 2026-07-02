import type { ReactNode } from "react";

type PageShellProps = {
  title: string;
  eyebrow?: string;
  description: string;
  actions?: ReactNode;
  children: ReactNode;
};

export function PageShell({ title, eyebrow, description, actions, children }: PageShellProps) {
  return (
    <section className="mx-auto flex max-w-7xl flex-col gap-5">
      <header className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          {eyebrow ? (
            <p className="mb-1 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--fc-primary)]">
              {eyebrow}
            </p>
          ) : null}
          <h1 className="text-xl font-semibold leading-8 text-[var(--fc-text)]">{title}</h1>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-[var(--fc-text-secondary)]">
            {description}
          </p>
        </div>
        {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
      </header>
      {children}
    </section>
  );
}
