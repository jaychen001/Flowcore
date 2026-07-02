import Link from "next/link";
import { FeedbackPanel } from "@/components/ui/feedback";

export default function NotFoundPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-[var(--fc-bg)] px-4">
      <div className="w-full max-w-xl">
        <FeedbackPanel
          action={
            <Link
              className="rounded-md bg-[var(--fc-primary)] px-3 py-2 text-sm font-medium text-white"
              href="/dashboard"
            >
              返回项目看板
            </Link>
          }
          description="请检查链接是否正确，或回到项目看板继续操作。"
          kind="error"
          title="页面不存在"
        />
      </div>
    </main>
  );
}
