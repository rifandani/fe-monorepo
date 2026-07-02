import type { MetadataRoute } from "next";
// change production url when you know
const url = new URL(
  process.env.NODE_ENV === "production"
    ? "https://web.com"
    : "https://web.localhost"
);
const robots = (): MetadataRoute.Robots => ({
  rules: {
    allow: "/",
    userAgent: "*",
  },
  sitemap: `${url}sitemap.xml`,
});
export default robots;
