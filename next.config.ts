import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // create-next-app enables cacheComponents / partialPrefetching. They are
  // deliberately off here: this blog reads from the database on request
  // (`export const dynamic = "force-dynamic"` on DB-backed pages).
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  images: {
    remotePatterns: [
      // Vercel Blob public URLs (cover and inline images)
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
    ],
  },
};

export default nextConfig;
