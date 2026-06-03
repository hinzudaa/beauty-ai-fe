import { NextRequest, NextResponse } from "next/server";

const TOKEN_KEY = "beauty_ai_token";

export function middleware(req: NextRequest) {
  const token = req.cookies.get(TOKEN_KEY)?.value;

  if (token) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/login"],
};
