import * as cheerio from "cheerio";
import sanitizeHtml from "sanitize-html";
import { slugify } from "./slug";

export type TocItem = { id: string; text: string; level: 2 | 3 };

export function htmlToText(html: string) {
  return cheerio.load(html, {}, false).root().text().replace(/\s+/g, " ").trim();
}

// Words divided by 200, rounded up.
export function readingTime(html: string) {
  const words = htmlToText(html).split(" ").filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

export function excerptOf(post: { excerpt: string; contentHtml: string }) {
  const explicit = post.excerpt.trim();
  if (explicit) return explicit;
  const text = htmlToText(post.contentHtml);
  return text.length > 160 ? `${text.slice(0, 157).trimEnd()}...` : text;
}

// Adds ids to H2 and H3 headings and returns them for the table of contents.
export function withHeadings(html: string) {
  const $ = cheerio.load(html, {}, false);
  const used = new Set<string>();
  const toc: TocItem[] = [];

  $("h2, h3").each((_, el) => {
    const text = $(el).text().trim();
    const base = slugify(text) || "section";
    let id = base;
    for (let n = 2; used.has(id); n++) id = `${base}-${n}`;
    used.add(id);
    $(el).attr("id", id);
    toc.push({ id, text, level: $(el).is("h3") ? 3 : 2 });
  });

  return { html: $.html(), toc };
}

// Post HTML is sanitized on save and before rendering seeded content.
// Allows what the Tiptap editor produces: headings, lists, quotes, code, links, images.
export function sanitizePostHtml(html: string) {
  return sanitizeHtml(html, {
    allowedTags: [...sanitizeHtml.defaults.allowedTags, "img", "h2", "h3", "hr", "pre", "code"],
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      a: ["href", "name", "target", "rel"],
      img: ["src", "alt", "title", "width", "height"],
      code: ["class"],
    },
    allowedClasses: { code: [/^language-[a-z0-9+#-]+$/] },
    allowedSchemes: ["http", "https", "mailto"],
    transformTags: {
      a: (tagName, attribs) => ({
        tagName,
        attribs: { ...attribs, rel: "noopener noreferrer nofollow" },
      }),
    },
  });
}
