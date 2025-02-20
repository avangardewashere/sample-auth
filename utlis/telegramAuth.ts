interface User {
  id?: String;
  username?: string;
  [key: string]: any;
}

interface ValidatedData {
  [key: string]: String;
}

interface ValidationResult {
  validatedData: ValidatedData | null;
  user: User;
  message: string;
}

export async function validateTelegramWebAppData(
  telegramInitData: string
): Promise<ValidationResult> {
  const BOT_TOKEN = process.env.BOT_TOKEN;
  let validatedData: ValidatedData | null = null;
  let user: User = {};
  let message = "";

  if (!BOT_TOKEN) {
    return { message: `BOT_TOKEN is not set`, validatedData: null, user: {} };
  }

  const initData = new URLSearchParams(telegramInitData);
  const hash = initData.get("hash");

  if (!hash) {
    return {
      message: `Hash is missing from initData`,
      validatedData: null,
      user: {},
    };
  }

  initData.delete("hash");

  const authDate = initData.get("auth_date");
  if (!authDate) {
    return {
      message: `auth_date is missing from initData`,
      validatedData: null,
      user: {},
    };
  }

  const authTimestamp = parseInt(authDate, 10);
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const timeDifference = currentTimestamp - authTimestamp;
  const fiveMinutesInSeconds = 5 * 60;

  if (timeDifference > fiveMinutesInSeconds) {
    return {
      message: `Telegran data is older than 5 minutes`,
      validatedData: null,
      user: {},
    };
  }

  // Fix: Use '\n' instead of '/n'
  const dataCheckString = Array.from(initData.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join("\n"); // Corrected newline character
  try {
    const encoder = new TextEncoder();

    // Step 1: Create secret key using WebAppData + BOT_TOKEN
    const secretKey = await crypto.subtle.importKey(
      "raw",
      encoder.encode("WebAppData"),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );

    const secret = await crypto.subtle.sign(
      "HMAC",
      secretKey,
      encoder.encode(BOT_TOKEN)
    );

    // Step 2: Create HMAC with the derived secret key
    const signingKey = await crypto.subtle.importKey(
      "raw",
      secret,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );

    const signature = await crypto.subtle.sign(
      "HMAC",
      signingKey,
      encoder.encode(dataCheckString)
    );

    // Convert signature to hex string
    const calculatedHash = Array.from(new Uint8Array(signature))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    if (calculatedHash === hash) {
      validatedData = Object.fromEntries(initData.entries());
      message = "Validation successful";
      const userString = validatedData["user"];
      if (userString) {
        try {
          user = JSON.parse(userString as string);
        } catch (error) {
          console.log("Error parsing user data:", error);
          message = "Error parsing user data";
          validatedData = null;
        }
      } else {
        message = "User data is missing";
        validatedData = null;
      }
    } else {
      message = "Hash validation failed";
    }
  } catch (error) {
    console.error("Crypto error:", error);
    message = `Crypto operation failed: ${
      error instanceof Error ? error.message : String(error)
    }`;
  }

  return { validatedData, user, message };
}
