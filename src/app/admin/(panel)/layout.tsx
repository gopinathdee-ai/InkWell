import Link from "next/link";
import { logout } from "@/app/admin/actions";
import { ThemeToggle } from "@/components/site/ThemeToggle";
import { requireAdmin } from "@/lib/auth";
import { siteConfig } from "@/lib/site-config";

export const dynamic = "force-dynamic";

const navLinkClass = "hover:text-foreground";

// Shell for every signed-in Admin screen. Blocks the page until the session is verified.
export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  await requireAdmin();
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-4 z-20 mx-4 mt-4 sm:mx-6">
        <div className="glass-bar mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 rounded-2xl px-5 py-3">
          <div className="flex items-center gap-6">
            <Link href="/admin" className="font-extrabold tracking-tight">
              {siteConfig.name} <span className="font-medium text-muted">Admin</span>
            </Link>
            <nav className="flex items-center gap-4 text-sm font-medium text-muted">
              <Link href="/admin" className={navLinkClass}>Posts</Link>
              <Link href="/admin/tags" className={navLinkClass}>Tags</Link>
              <Link href="/admin/settings" className={navLinkClass}>Settings</Link>
              <Link href="/" className={navLinkClass}>View site</Link>
            </nav>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <ThemeToggle />
            <form action={logout}>
              <button type="submit" className="font-medium text-muted hover:text-foreground">
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-8">{children}</main>
    </div>
  );
}
