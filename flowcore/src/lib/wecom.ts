import { createHmac, timingSafeEqual } from "node:crypto";

export const WECOM_PENDING_COOKIE_NAME = "flowcore_wecom_pending";

const requiredWecomEnv = [
  "WECOM_CORP_ID",
  "WECOM_AGENT_ID",
  "WECOM_SECRET",
  "WECOM_CALLBACK_URL"
] as const;
const PENDING_BINDING_MAX_AGE_SECONDS = 10 * 60;
const WECOM_API_BASE_URL = "https://qyapi.weixin.qq.com/cgi-bin";

type WecomEnvKey = (typeof requiredWecomEnv)[number];

export type WecomIdentity = {
  corpId: string;
  wecomUserid: string;
};

type PendingBindingPayload = WecomIdentity & {
  expiresAt: number;
};

type WecomTokenResponse = {
  errcode?: number;
  errmsg?: string;
  access_token?: string;
};

type WecomUserInfoResponse = {
  errcode?: number;
  errmsg?: string;
  UserId?: string;
  OpenId?: string;
};

export class WecomAuthError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status = 400
  ) {
    super(message);
  }
}

export function getMissingWecomEnv(): WecomEnvKey[] {
  return requiredWecomEnv.filter((key) => !process.env[key]);
}

export function getWecomAuthorizeUrl(): string {
  const callbackUrl = getRequiredWecomEnv("WECOM_CALLBACK_URL");
  const corpId = getRequiredWecomEnv("WECOM_CORP_ID");
  const url = new URL("https://open.weixin.qq.com/connect/oauth2/authorize");

  url.searchParams.set("appid", corpId);
  url.searchParams.set("redirect_uri", callbackUrl);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "snsapi_base");
  url.searchParams.set("state", "flowcore");

  return `${url.toString()}#wechat_redirect`;
}

export async function resolveWecomIdentity(code: string): Promise<WecomIdentity> {
  const token = await fetchWecomAccessToken();
  const userInfoUrl = new URL(`${WECOM_API_BASE_URL}/auth/getuserinfo`);
  userInfoUrl.searchParams.set("access_token", token);
  userInfoUrl.searchParams.set("code", code);

  const userInfo = await fetchWecomJson<WecomUserInfoResponse>(userInfoUrl);

  if (userInfo.errcode && userInfo.errcode !== 0) {
    throw new WecomAuthError(
      "wecom_authorization_failed",
      userInfo.errmsg ?? "企业微信授权失败。",
      502
    );
  }

  if (!userInfo.UserId) {
    throw new WecomAuthError(
      "wecom_user_not_member",
      userInfo.OpenId
        ? "当前企业微信身份不是企业成员，无法绑定系统人员。"
        : "企业微信授权未返回成员身份。",
      403
    );
  }

  return {
    corpId: getRequiredWecomEnv("WECOM_CORP_ID"),
    wecomUserid: userInfo.UserId
  };
}

export function createPendingWecomBinding(identity: WecomIdentity): {
  value: string;
  maxAge: number;
} {
  const payload: PendingBindingPayload = {
    ...identity,
    expiresAt: Date.now() + PENDING_BINDING_MAX_AGE_SECONDS * 1000
  };

  return {
    value: signPayload(payload),
    maxAge: PENDING_BINDING_MAX_AGE_SECONDS
  };
}

export function readPendingWecomBinding(cookieValue?: string): WecomIdentity | null {
  if (!cookieValue) {
    return null;
  }

  const [payloadText, signature] = cookieValue.split(".");

  if (!payloadText || !signature || !signatureMatches(payloadText, signature)) {
    return null;
  }

  const payload = parsePendingPayload(payloadText);

  if (!payload || payload.expiresAt < Date.now()) {
    return null;
  }

  return {
    corpId: payload.corpId,
    wecomUserid: payload.wecomUserid
  };
}

function getRequiredWecomEnv(key: WecomEnvKey): string {
  const value = process.env[key];

  if (!value) {
    throw new WecomAuthError("wecom_not_configured", `缺少企业微信配置：${key}`, 503);
  }

  return value;
}

async function fetchWecomAccessToken(): Promise<string> {
  const tokenUrl = new URL(`${WECOM_API_BASE_URL}/gettoken`);
  tokenUrl.searchParams.set("corpid", getRequiredWecomEnv("WECOM_CORP_ID"));
  tokenUrl.searchParams.set("corpsecret", getRequiredWecomEnv("WECOM_SECRET"));

  const tokenResponse = await fetchWecomJson<WecomTokenResponse>(tokenUrl);

  if (tokenResponse.errcode && tokenResponse.errcode !== 0) {
    throw new WecomAuthError(
      "wecom_token_failed",
      tokenResponse.errmsg ?? "企业微信 access_token 获取失败。",
      502
    );
  }

  if (!tokenResponse.access_token) {
    throw new WecomAuthError("wecom_token_failed", "企业微信未返回 access_token。", 502);
  }

  return tokenResponse.access_token;
}

async function fetchWecomJson<T>(url: URL): Promise<T> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new WecomAuthError("wecom_network_failed", "企业微信服务暂时不可用。", 502);
  }

  return (await response.json()) as T;
}

function signPayload(payload: PendingBindingPayload): string {
  const payloadText = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  const signature = createHmac("sha256", getSigningSecret())
    .update(payloadText)
    .digest("base64url");

  return `${payloadText}.${signature}`;
}

function signatureMatches(payloadText: string, signature: string): boolean {
  const expected = createHmac("sha256", getSigningSecret()).update(payloadText).digest("base64url");
  const expectedBuffer = Buffer.from(expected);
  const actualBuffer = Buffer.from(signature);

  if (expectedBuffer.length !== actualBuffer.length) {
    return false;
  }

  return timingSafeEqual(expectedBuffer, actualBuffer);
}

function parsePendingPayload(payloadText: string): PendingBindingPayload | null {
  try {
    const payload = JSON.parse(Buffer.from(payloadText, "base64url").toString("utf8")) as unknown;

    if (
      isRecord(payload) &&
      typeof payload.corpId === "string" &&
      typeof payload.wecomUserid === "string" &&
      typeof payload.expiresAt === "number"
    ) {
      return {
        corpId: payload.corpId,
        wecomUserid: payload.wecomUserid,
        expiresAt: payload.expiresAt
      };
    }
  } catch {
    return null;
  }

  return null;
}

function getSigningSecret(): string {
  const secret = process.env.BETTER_AUTH_SECRET;

  if (!secret) {
    throw new WecomAuthError("auth_not_configured", "缺少会话签名密钥。", 500);
  }

  return secret;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
