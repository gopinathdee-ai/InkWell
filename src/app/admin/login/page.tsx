import type { Metadata } from "next";
import { LoginForm } from "@/components/admin/LoginForm";
import { siteConfig } from "@/lib/site-config";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Admin sign in" };

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-sm rounded-2xl glass p-8 shadow-sm">
        <h1 className="mb-1 text-2xl font-extrabold tracking-tight">{siteConfig.name}</h1>
        <p className="mb-6 text-sm text-muted">Sign in to manage posts.</p>
        <LoginForm />
      </div>
    </main>
  );
}
