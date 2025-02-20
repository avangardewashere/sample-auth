import { jwtVerify, SignJWT } from "jose";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const key = new TextEncoder().encode(process.env.JWT_SECRET);

export const SESSION_DURATION = 60 * 60 * 1000; // 1 hour

// returns a predefined jwt token
export async function encrypt(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1 hour")
    .sign(key);
}
//uses jwt verify function jose library to verifies hs 256
// retruns the preload create async function

export async function decrypt(input: string): Promise<any> {
  const { payload } = await jwtVerify(input, key, {
    algorithms: ["HS256"],
  });

  return payload;
}

//retrives the session cookie
export async function getSession() {
  const session = (await cookies()).get("session")?.value;
  console.log("Session value in getSession", session);
  if (!session) return null;
  return await decrypt(session);
}

export async function updateSession(request: NextRequest) {
  const session = request.cookies.get("session");
  if (!session) return;

  //refresh the session so it doesn't expire

  const parsed = await decrypt(session as any);
  parsed.expire = new Date(Date.now() + SESSION_DURATION);

  const res = NextResponse.next();
  res.cookies.set({
    name: "session",
    value: await encrypt(parsed),
    httpOnly: true,
    expires: parsed.expires,
  });

  return res;
}
