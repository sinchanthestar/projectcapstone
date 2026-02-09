import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip proxy for setup, API, and static routes
  if (
  pathname.startsWith("/api") ||
  pathname.startsWith("/_next") ||
  pathname.startsWith("/public") ||
  pathname === "/setup" ||
  pathname === "/login" ||
  pathname === "/register" ||
  pathname === "/favicon.ico"
) {
  return NextResponse.next();
}


  try {
    // Check if setup is complete
    const setupResponse = await fetch(
      new URL("/api/setup/status", request.url).toString(),
      { headers: request.headers }
    );

    if (setupResponse.ok) {
      const setupData = await setupResponse.json();

      // If not initialized and not on setup page, redirect to setup
      if (!setupData.isInitialized && pathname !== "/setup") {
        return NextResponse.redirect(new URL("/setup", request.url));
      }

      // If initialized and on setup page, redirect to home
      if (setupData.isInitialized && pathname === "/setup") {
        return NextResponse.redirect(new URL("/", request.url));
      }
    }
  } catch (error) {
    // If setup check fails, allow request to continue
    console.error("[Proxy] Setup check error:", error);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|public).*)",
  ],
};
