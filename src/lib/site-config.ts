// Single place for placeholder branding. Change these later.
export const siteConfig = {
  name: "InkWell",
  tagline: "A short line about what this blog is about.",
  description: "Personal blog.",
  authorName: "Author Name",
  // Set NEXT_PUBLIC_SITE_URL once the domain is known.
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  nav: [
    { label: "Latest", href: "/" },
  ],
  postsPerPage: 12,
} as const;
