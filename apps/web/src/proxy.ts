import { NextResponse, type NextRequest } from "next/server";

/**
 * Next 16 "proxy" (formerly middleware). Cheap gate only: real authorization happens
 * in the services. Supabase stores the session in sb-*-auth-token cookies.
 *
 * TODO: refresh the Supabase session here with createServerClient (see @supabase/ssr docs).
 */
const PUBLIC = ["/login", "/onboarding", "/_next", "/favicon.ico"];

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (PUBLIC.some((p) => pathname.startsWith(p))) return NextResponse.next();

  const authRequired = process.env.AUTH_REQUIRED === "true";
  const hasSession = req.cookies
    .getAll()
    .some((c) => c.name.startsWith("sb-") && c.name.endsWith("-auth-token"));
  if (authRequired && !hasSession) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\..*).*)"],
};
