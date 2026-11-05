import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";

// Public blog shell. The Admin module has its own layout under /admin.
export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
