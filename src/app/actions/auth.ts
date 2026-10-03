"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { loginSchema, registrationSchema } from "@/lib/validation";
import { authenticateCustomer, registerCustomer } from "@/modules/auth/auth.service";
import { createSession, destroySession } from "@/modules/auth/session";
import { GUEST_CART_COOKIE } from "@/modules/cart/current-cart";
import { mergeGuestCartIntoUser } from "@/modules/cart/cart.service";

export type AuthActionState = { error?: string } | undefined;

export async function registerAction(_previous: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const parsed = registrationSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Please check the form." };

  try {
    const user = await registerCustomer(parsed.data);
    const cookieStore = await cookies();
    await mergeGuestCartIntoUser(user.id, cookieStore.get(GUEST_CART_COOKIE)?.value);
    cookieStore.delete(GUEST_CART_COOKIE);
    await createSession(user.id);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Unable to create your account." };
  }

  redirect("/account");
}

export async function loginAction(_previous: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Enter your email and password." };

  const user = await authenticateCustomer(parsed.data.email, parsed.data.password);
  if (!user) return { error: "Invalid email or password." };

  const cookieStore = await cookies();
  await mergeGuestCartIntoUser(user.id, cookieStore.get(GUEST_CART_COOKIE)?.value);
  cookieStore.delete(GUEST_CART_COOKIE);
  await createSession(user.id);
  redirect(user.role === "ADMIN" ? "/admin" : "/account");
}

export async function logoutAction() {
  await destroySession();
  redirect("/");
}
