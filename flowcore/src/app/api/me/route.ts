import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getAuthenticatedUser, SESSION_COOKIE_NAME } from "@/lib/session";

export async function GET() {
  const token = (await cookies()).get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  const user = await getAuthenticatedUser(token);

  if (!user) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  return NextResponse.json({ user });
}
