import { auth } from "./auth";
import { redirect } from "next/navigation";

/**
 * Get the current session on the server
 */
export async function getSession() {
  const session = await auth.api.getSession({
    headers: await import("next/headers").then((m) => m.headers()),
  });
  return session;
}

/**
 * Require authentication - redirects to sign-in if not authenticated
 */
export async function requireAuth() {
  const session = await getSession();
  if (!session) {
    redirect("/sign-in");
  }
  return session;
}
