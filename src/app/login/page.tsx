import { GuestGuard } from "@/components/auth/guest-guard";
import { BrandPanel } from "@/components/login/brand-panel";
import { LoginForm } from "@/components/login/login-form";

export default function LoginPage() {
  return (
    <GuestGuard>
      <div className="flex min-h-screen">
        <section className="flex flex-1 flex-col bg-white">
          <div className="flex flex-1 items-center justify-center px-8 py-12 lg:px-16 xl:px-24">
            <LoginForm />
          </div>
          <footer className="px-8 pb-8 lg:px-16 xl:px-24">
            <p className="text-xs text-neutral-400">
              © 2024 Starbucks Coffee Company. All rights reserved.
            </p>
          </footer>
        </section>

        <BrandPanel />
      </div>
    </GuestGuard>
  );
}
