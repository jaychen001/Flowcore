"use client";

import { useRouter } from "next/navigation";
import type { Route } from "next";
import { useState } from "react";

type LoginFormProps = {
  nextPath: string;
  reason?: string;
};

type LoginState =
  | { status: "idle"; message?: string }
  | { status: "loading"; message?: string }
  | { status: "error"; message: string };

export function LoginForm({ nextPath, reason }: LoginFormProps) {
  const router = useRouter();
  const [state, setState] = useState<LoginState>({
    status: "idle",
    message: reason ? getReasonMessage(reason) : undefined
  });

  async function handleSubmit(formData: FormData) {
    setState({ status: "loading" });

    const response = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        account: formData.get("account"),
        password: formData.get("password")
      })
    });

    const body = (await response.json()) as { message?: string; defaultRoute?: string };

    if (!response.ok) {
      setState({
        status: "error",
        message: body.message ?? "登录失败，请检查账号状态。"
      });
      return;
    }

    router.replace(getSafeRoute(nextPath, body.defaultRoute));
    router.refresh();
  }

  const loading = state.status === "loading";

  return (
    <form action={handleSubmit} className="mt-6 space-y-4">
      <label className="block">
        <span className="text-sm font-medium">账号</span>
        <input
          className="mt-1 h-10 w-full rounded-md border border-[var(--fc-border)] px-3 outline-none focus:border-[var(--fc-primary)]"
          maxLength={64}
          name="account"
          placeholder="例如 admin 或 pm001"
          required
          type="text"
        />
      </label>
      <label className="block">
        <span className="text-sm font-medium">密码</span>
        <input
          className="mt-1 h-10 w-full rounded-md border border-[var(--fc-border)] px-3 outline-none focus:border-[var(--fc-primary)]"
          minLength={8}
          name="password"
          placeholder="不少于 8 位"
          required
          type="password"
        />
      </label>
      {state.message ? (
        <div
          className={[
            "rounded-md border p-3 text-sm leading-6",
            state.status === "error"
              ? "border-red-200 bg-red-50 text-red-700"
              : "border-amber-200 bg-amber-50 text-amber-800"
          ].join(" ")}
          role={state.status === "error" ? "alert" : "status"}
        >
          {state.message}
        </div>
      ) : null}
      <button
        className="h-10 w-full rounded-md bg-[var(--fc-primary)] px-4 text-sm font-medium text-white disabled:bg-slate-300 disabled:text-slate-600"
        disabled={loading}
        type="submit"
      >
        {loading ? "登录中" : "登录"}
      </button>
      <a
        className="grid h-10 w-full place-items-center rounded-md border border-[var(--fc-border)] bg-white px-4 text-sm font-medium text-[var(--fc-text)]"
        href="/api/wecom/start"
      >
        企业微信登录
      </a>
      <p className="text-xs leading-5 text-[var(--fc-text-muted)]">
        使用管理员分配的本地账号登录；企业微信首次登录需要绑定已有系统人员。
      </p>
    </form>
  );
}

function getReasonMessage(reason: string): string {
  if (reason === "session_required") {
    return "请先登录后再访问系统页面。";
  }

  if (reason === "account_disabled") {
    return "账号已停用，请联系管理员。";
  }

  return "登录状态已过期，请重新登录。";
}

function getSafeRoute(nextPath: string, defaultRoute?: string): Route {
  const route = nextPath || defaultRoute || "/dashboard";

  if (route.startsWith("/") && !route.startsWith("//")) {
    return route as Route;
  }

  return "/dashboard";
}
