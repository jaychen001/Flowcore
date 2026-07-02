import { AlertTriangle, CheckCircle2, Clock3, CircleDot, ShieldAlert } from "lucide-react";
import type { ComponentType } from "react";

export type RiskLevel = "normal" | "watch" | "high" | "blocked";
export type WorkStatus = "open" | "in-progress" | "done" | "overdue";

type BadgeProps = {
  label: string;
  className: string;
  icon: ComponentType<{ className?: string }>;
};

function Badge({ label, className, icon: Icon }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded px-2 py-1 text-xs font-medium ${className}`}
    >
      <Icon className="size-3.5" />
      {label}
    </span>
  );
}

export function RiskBadge({ level }: { level: RiskLevel }) {
  const map = {
    normal: {
      label: "风险正常",
      className: "bg-emerald-50 text-emerald-700",
      icon: CheckCircle2
    },
    watch: {
      label: "临期关注",
      className: "bg-amber-50 text-amber-700",
      icon: Clock3
    },
    high: {
      label: "高风险",
      className: "bg-red-50 text-red-700",
      icon: ShieldAlert
    },
    blocked: {
      label: "问题阻塞",
      className: "bg-orange-50 text-orange-700",
      icon: AlertTriangle
    }
  } satisfies Record<RiskLevel, BadgeProps>;

  return <Badge {...map[level]} />;
}

export function StatusBadge({ status }: { status: WorkStatus }) {
  const map = {
    open: {
      label: "待处理",
      className: "bg-blue-50 text-blue-700",
      icon: CircleDot
    },
    "in-progress": {
      label: "处理中",
      className: "bg-cyan-50 text-cyan-700",
      icon: Clock3
    },
    done: {
      label: "已完成",
      className: "bg-emerald-50 text-emerald-700",
      icon: CheckCircle2
    },
    overdue: {
      label: "已逾期",
      className: "bg-red-50 text-red-700",
      icon: AlertTriangle
    }
  } satisfies Record<WorkStatus, BadgeProps>;

  return <Badge {...map[status]} />;
}
