/* oxlint-disable eslint/func-style -- function declarations */
import type { MetadataRoute } from "next";
// change production url when you know
const url = new URL(
  process.env.NODE_ENV === "production"
    ? "https://web.com"
    : "https://web.localhost"
);
export function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // disallow: '/private-page',
    },
    sitemap: `${url}sitemap.xml`,
  };
}
