import { encrypt, SESSION_DURATION } from "@/utlis/session";
import { validateTelegramWebAppData } from "@/utlis/telegramAuth";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { initData } = await request.json();

  // Await the promise right away to get the ValidationResult object.
  const validationResult = await validateTelegramWebAppData(initData);

  if (validationResult.validatedData) {
    console.log('validation result', validationResult);
    const user = { telegramId: validationResult.user.id };

    // Create a new session
    const expires = new Date(Date.now() + SESSION_DURATION);
    const session = await encrypt({ user, expires });

    // Save the session in a cookie
    (await cookies()).set("session", session, { expires, httpOnly: true });

    return NextResponse.json({ message: "Session created" });
  } else {
    return NextResponse.json({ message: validationResult.message }, { status: 401 });
  }
}
