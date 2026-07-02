"use client";

import { useRouter } from "next/navigation";
import type { Route } from "next";
import { useState } from "react";

type BindState =
  | { status: "idle"; message?: string }
  | { status: "loading"; message?: string }
  | { status: "error"; message: string };

export function WecomBindForm() {
  const router = useRouter();
  const [state, setState] = useState<BindState>({ status: "idle" });

  async function handleSubmit(formData: FormData) {
    setState({ status: "loading" });

    const response = await fetch("/api/wecom/bind", {
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
        message: body.message ?? "企业微信绑定失败，请重新授权后再试。"
      });
      return;
    }

    router.replace(getSafeRoute(body.defaultRoute));
    router.refresh();
  }

  const loading = state.status === "loading";

  return (
    <form action={handleSubmit} className="mt-6 space-y-4">
      <label className="block">
        <span className="text-sm font-medium">已有系统账号</span>
        <input
          className="mt-1 h-10 w-full rounded-md border border-[var(--fc-border)] px-3 outline-none focus:border-[var(--fc-primary)]"
          maxLength={64}
          name="account"
          placeholder="请输入管理员维护的账号"
          required
          type="text"
        />
      </label>
      <label className="block">
        <span className="text-sm font-medium">账号密码</span>
        <input
          className="mt-1 h-10 w-full rounded-md border border-[var(--fc-border)] px-3 outline-none focus:border-[var(--fc-primary)]"
          minLength={8}
          name="password"
          placeholder="用于确认绑定人员身份"
          required
          type="password"
        />
      </label>
      {state.message ? (
        <div
          className="rounded-md border border-red-200 bg-red-50 p-3 text-sm leading-6 text-red-700"
          role="alert"
        >
          {state.message}
        </div>
      ) : null}
      <button
        className="h-10 w-full rounded-md bg-[var(--fc-primary)] px-4 text-sm font-medium text-white disabled:bg-slate-300 disabled:text-slate-600"
        disabled={loading}
        type="submit"
      >
        {loading ? "绑定中" : "绑定并登录"}
      </button>
    </form>
  );
}

function getSafeRoute(defaultRoute?: string): Route {
  if (defaultRoute?.startsWith("/") && !defaultRoute.startsWith("//")) {
    return defaultRoute as Route;
  }

  return "/dashboard";
}
