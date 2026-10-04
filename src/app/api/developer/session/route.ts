import { cookies } from "next/headers";
import { SESSION_COOKIE, checkPassword, newSessionValue, passwordConfigured } from "@/lib/analytics/auth";

export const dynamic = "force-dynamic";

/** Log in to the developer dashboard. */
export async function POST(request: Request) {
  if (!passwordConfigured()) return new Response("Set DEVELOPER_PASSWORD to enable login", { status: 503 });
  let password: unknown;
  try {
    ({ password } = await request.json());
  } catch {
    return new Response("Bad request", { status: 400 });
  }
  if (!checkPassword(password)) {
    await new Promise((r) => setTimeout(r, 700)); // slow down guessing
    return new Response("Wrong password", { status: 401 });
  }
  (await cookies()).set(SESSION_COOKIE, newSessionValue(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return new Response(null, { status: 204 });
}

/** Log out. */
export async function DELETE() {
  (await cookies()).delete(SESSION_COOKIE);
  return new Response(null, { status: 204 });
}
