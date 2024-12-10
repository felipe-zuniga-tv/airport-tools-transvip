import { NextRequest, NextResponse } from "next/server";
import { updateSession } from "./lib/auth";
import { Routes } from "./utils/routes";

export async function middleware(request: NextRequest) {
  try {
    const response = await updateSession(request);
    console.log(`Middleware: ${response}`)
    
    // Add redirect if no response
    if (!response) {
      return NextResponse.redirect(new URL(Routes.LOGIN, request.url));
    }
    
    return response;
  } catch (error) {
    console.error('Middleware session update error:', error);
    return NextResponse.redirect(new URL(Routes.LOGIN, request.url));
  }
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}