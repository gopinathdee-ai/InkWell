// Fonts for the blog name only (header, admin header and login page).
// Each one is bundled through @fontsource, so the list is kept short on purpose.
export const BRAND_FONT_KEY = "brand_font";

export const BRAND_FONTS = [
  { key: "montserrat", label: "Montserrat", css: '"Montserrat Variable", ui-sans-serif, system-ui, sans-serif' },
  { key: "dancing-script", label: "Dancing Script", css: '"Dancing Script Variable", cursive' },
  { key: "playfair-display", label: "Playfair Display", css: '"Playfair Display Variable", Georgia, serif' },
  { key: "space-mono", label: "Space Mono", css: '"Space Mono", ui-monospace, monospace' },
  { key: "bebas-neue", label: "Bebas Neue", css: '"Bebas Neue", Impact, sans-serif' },
] as const;

export type BrandFontKey = (typeof BRAND_FONTS)[number]["key"];

export function normalizeBrandFont(value: string | undefined | null): BrandFontKey {
  const found = BRAND_FONTS.find((font) => font.key === value);
  return found ? found.key : "montserrat";
}

export function brandFontCss(key: string) {
  return BRAND_FONTS.find((font) => font.key === key)?.css ?? BRAND_FONTS[0].css;
}
