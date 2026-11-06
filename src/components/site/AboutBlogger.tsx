import { ExpandableBio } from "./ExpandableBio";

// Author card shown beside the featured post. The HTML was sanitized on save in Admin > Settings.
export function AboutBlogger({ name, html, long }: { name: string; html: string; long: boolean }) {
  return (
    <section className="glass flex h-full flex-col gap-4 rounded-2xl p-6">
      <div>
        <p className="label">About the blogger</p>
        <h2 className="text-gradient mt-2 text-2xl font-extrabold tracking-tight">{name}</h2>
      </div>
      <ExpandableBio html={html} long={long} />
    </section>
  );
}
