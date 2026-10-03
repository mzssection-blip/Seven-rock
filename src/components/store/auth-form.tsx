"use client";

import Link from "next/link";
import { useActionState } from "react";
import { loginAction, registerAction, type AuthActionState } from "@/app/actions/auth";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const register = mode === "register";
  const [state, action, pending] = useActionState<AuthActionState, FormData>(register ? registerAction : loginAction, undefined);
  return (
    <form action={action} className="mx-auto max-w-md border border-white/10 bg-charcoal/60 p-6 sm:p-8">
      <p className="meta !text-mist">SEVEN ROCK account</p>
      <h1 className="display-title mt-3 text-4xl">{register ? "Create account." : "Welcome back."}</h1>
      <p className="mt-3 text-sm text-mist">{register ? "Save your details, wishlist and order history." : "Sign in to your SEVEN ROCK account."}</p>
      <div className="mt-8 space-y-4">
        {register && <label className="block"><span className="meta">Name</span><input className="field mt-2" name="name" required /></label>}
        <label className="block"><span className="meta">Email</span><input className="field mt-2" name="email" required type="email" /></label>
        {register && <label className="block"><span className="meta">Bangladeshi phone (optional)</span><input className="field mt-2" name="phone" placeholder="01XXXXXXXXX" /></label>}
        <label className="block"><span className="meta">Password</span><input className="field mt-2" name="password" required type="password" />{register && <span className="mt-2 block text-xs text-mist">At least 10 characters with uppercase, lowercase and a number.</span>}</label>
      </div>
      {state?.error && <p aria-live="polite" className="mt-5 text-sm font-medium text-rust">{state.error}</p>}
      <button className="btn-solid mt-7 w-full" disabled={pending} type="submit">{pending ? "Please wait…" : register ? "Create account" : "Sign in"}</button>
      <p className="mt-6 text-center text-sm text-mist">
        {register ? "Already a member?" : "New to SEVEN ROCK?"} <Link className="link-line text-paper" href={register ? "/login" : "/register"}>{register ? "Sign in" : "Create account"}</Link>
      </p>
    </form>
  );
}
