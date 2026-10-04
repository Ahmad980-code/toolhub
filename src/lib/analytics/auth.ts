import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const SESSION_COOKIE = "th_dev_session";

/** Whether a dashboard password is set (DEVELOPER_PASSWORD). Without one, only local dev is open. */
export function passwordConfigured() {
  return Boolean(process.env.DEVELOPER_PASSWORD);
}

function sessionToken(password: string) {
  return createHmac("sha256", password).update("toolhub-developer-session-v1").digest("hex");
}

function safeEqual(a: string, b: string) {
  const x = createHash("sha256").update(a).digest();
  const y = createHash("sha256").update(b).digest();
  return timingSafeEqual(x, y);
}

export function checkPassword(input: unknown) {
  const pw = process.env.DEVELOPER_PASSWORD;
  return Boolean(pw) && typeof input === "string" && safeEqual(input, pw!);
}

export function newSessionValue() {
  return sessionToken(process.env.DEVELOPER_PASSWORD!);
}

/** True when the visitor may see the developer dashboard. */
export async function isDeveloper() {
  const pw = process.env.DEVELOPER_PASSWORD;
  if (!pw) return process.env.NODE_ENV !== "production";
  const value = (await cookies()).get(SESSION_COOKIE)?.value;
  return Boolean(value) && safeEqual(value!, sessionToken(pw));
}
