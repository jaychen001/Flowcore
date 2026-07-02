"use client";

import { FeedbackPanel } from "@/components/ui/feedback";

export default function ErrorPage({
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="grid min-h-screen place-items-center bg-[var(--fc-bg)] px-4">
      <div className="w-full max-w-xl">
        <FeedbackPanel
          action={
            <button
              className="rounded-md bg-[var(--fc-primary)] px-3 py-2 text-sm font-medium text-white"
              onClick={() => reset()}
              type="button"
            >
              重试
            </button>
          }
          description="系统遇到错误，已保留当前页面上下文。"
          kind="error"
          title="加载失败"
        />
      </div>
    </main>
  );
}
