import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { getCurrentUser } from "@/modules/auth/session";

export const GUEST_CART_COOKIE = "seven_rock_cart";

export async function cartIdentityFromRequest() {
  const user = await getCurrentUser();
  if (user) return { userId: user.id, user };
  const guestToken = (await cookies()).get(GUEST_CART_COOKIE)?.value;
  return { guestToken, user: null };
}

export async function ensureCartIdentity() {
  const identity = await cartIdentityFromRequest();
  if (identity.userId || identity.guestToken) return identity;

  const guestToken = randomBytes(24).toString("base64url");
  (await cookies()).set(GUEST_CART_COOKIE, guestToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
    priority: "high",
  });
  return { guestToken, user: null };
}
