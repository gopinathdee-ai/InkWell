import { getSiteSettings } from "@/lib/db/settings";

export async function Footer() {
  const { authorName } = await getSiteSettings();
  return (
    <footer className="mt-16 px-4 pb-6">
      <div className="glass mx-auto flex max-w-6xl items-center justify-between rounded-full px-6 py-3 text-sm text-muted">
        <span>
          © {new Date().getFullYear()} {authorName}
        </span>
        <a href="/feed.xml" className="hover:text-foreground">
          RSS
        </a>
      </div>
    </footer>
  );
}
