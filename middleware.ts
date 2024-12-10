import { NextRequest, NextResponse } from "next/server";
import { 
//  updateSession, 
  updateSessionB
} from "./lib/auth";
// import { Routes } from "./utils/routes"

export async function middleware(request: NextRequest) {
  try {
    return await updateSessionB(request);
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