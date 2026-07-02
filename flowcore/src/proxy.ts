import { NextResponse, type NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-flowcore-pathname", request.nextUrl.pathname);

  return NextResponse.next({
    request: {
      headers: requestHeaders
    }
  });
}

export const config = {
  matcher: [
    "/ai/:path*",
    "/base-data/:path*",
    "/dashboard/:path*",
    "/import-jobs/:path*",
    "/issues/:path*",
    "/projects/:path*",
    "/submit/:path*",
    "/todos/:path*"
  ]
};
