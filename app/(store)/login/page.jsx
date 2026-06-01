import { Suspense } from "react";
import LoginForm from "@/components/LoginForm";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="grid min-h-[60vh] place-items-center text-base-content/50">
          Loading…
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
