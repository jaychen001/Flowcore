import type { ReactNode } from "react";
import { AlertCircle, CheckCircle2, CircleDot, CircleOff, Inbox, LoaderCircle } from "lucide-react";

export type FeedbackKind = "default" | "loading" | "empty" | "error" | "success" | "no-access";

type FeedbackPanelProps = {
  kind: FeedbackKind;
  title: string;
  description: string;
  action?: ReactNode;
};

const feedbackIcon = {
  default: CircleDot,
  loading: LoaderCircle,
  empty: Inbox,
  error: AlertCircle,
  success: CheckCircle2,
  "no-access": CircleOff
} satisfies Record<FeedbackKind, typeof LoaderCircle>;

const feedbackTone = {
  default: "text-[var(--fc-info)]",
  loading: "text-[var(--fc-primary)]",
  empty: "text-[var(--fc-text-muted)]",
  error: "text-[var(--fc-danger)]",
  success: "text-[var(--fc-success)]",
  "no-access": "text-[var(--fc-warning)]"
} satisfies Record<FeedbackKind, string>;

export function FeedbackPanel({ kind, title, description, action }: FeedbackPanelProps) {
  const Icon = feedbackIcon[kind];
  const spin = kind === "loading" ? "animate-spin" : "";

  return (
    <div className="rounded-md border border-[var(--fc-border)] bg-white p-6 text-center shadow-[var(--fc-shadow-sm)]">
      <Icon className={`mx-auto size-8 ${feedbackTone[kind]} ${spin}`} />
      <h2 className="mt-3 text-base font-semibold text-[var(--fc-text)]">{title}</h2>
      <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-[var(--fc-text-secondary)]">
        {description}
      </p>
      {action ? <div className="mt-4 flex justify-center">{action}</div> : null}
    </div>
  );
}

export function SkeletonBlock() {
  return (
    <div className="animate-pulse rounded-md border border-[var(--fc-border)] bg-white p-5">
      <div className="h-4 w-36 rounded bg-slate-200" />
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div className="h-20 rounded bg-slate-100" />
        <div className="h-20 rounded bg-slate-100" />
        <div className="h-20 rounded bg-slate-100" />
      </div>
    </div>
  );
}
