import { NextResponse } from "next/server";
import { getMissingWecomEnv, getWecomAuthorizeUrl } from "@/lib/wecom";

export async function GET() {
  const missing = getMissingWecomEnv();

  if (missing.length > 0) {
    return NextResponse.json(
      {
        code: "wecom_not_configured",
        message: "企业微信登录尚未配置，请联系管理员配置自建应用和可信回调域名。",
        missing
      },
      { status: 503 }
    );
  }

  return NextResponse.redirect(getWecomAuthorizeUrl());
}
