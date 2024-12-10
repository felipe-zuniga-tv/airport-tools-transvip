import { NextRequest, NextResponse } from "next/server";
import { updateSession } from "./lib/auth";

export async function middleware(request: NextRequest) {
  try {
    const response = await updateSession(request);
    console.log(`Middleware: ${response}`)
    return response
  } catch (error) {
    console.error('Middleware session update error:', error);
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}