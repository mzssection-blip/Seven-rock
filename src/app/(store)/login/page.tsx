import { AuthForm } from "@/components/store/auth-form";

export default function LoginPage() {
  return <div className="page-shell py-12 sm:py-20"><AuthForm mode="login" /></div>;
}
