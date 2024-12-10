import { NextRequest, NextResponse } from "next/server";
import { updateSession } from "./lib/auth";
import { Routes } from "./utils/routes";

export async function middleware(request: NextRequest) {
  try {
    const response = await updateSession(request);
    
    if (!response)
      console.log(`No session found`)
      return NextResponse.redirect(new URL(Routes.LOGIN, request.url))
    
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