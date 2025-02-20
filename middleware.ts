import { NextRequest,  NextResponse,    } from "next/server";
import { getSession, updateSession } from "@/utlis/session";

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/protected")) {
    const session = await getSession();
    console.log("session", session);

    if (!session) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    return updateSession(request);
  }
}
