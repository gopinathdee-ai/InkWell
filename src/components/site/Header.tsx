import Link from "next/link";
import { siteConfig } from "@/lib/site-config";
import { ThemeToggle } from "./ThemeToggle";

// A floating glass bar that stays at the top while the page scrolls.
export function Header() {
  return (
    <header className="sticky top-0 z-20 px-4 pt-4">
      <div className="glass-bar mx-auto flex max-w-6xl items-center justify-between gap-6 rounded-full px-5 py-2.5">
        <Link href="/" className="text-gradient text-lg font-extrabold tracking-tight">
          {siteConfig.name}
        </Link>
        <nav className="flex items-center gap-5 text-sm font-medium text-muted">
          <form action="/search" role="search" className="hidden md:block">
            <label htmlFor="header-search" className="sr-only">
              Search posts
            </label>
            <input
              id="header-search"
              name="q"
              type="search"
              placeholder="Search"
              className="field w-40 rounded-full px-3 py-1.5 text-sm"
            />
          </form>
          {siteConfig.nav.map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-foreground">
              {item.label}
            </Link>
          ))}
          <Link href="/search" className="hover:text-foreground md:hidden">
            Search
          </Link>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
