import fs from "node:fs";

import { simpleSitemapAndIndex } from "sitemap";

const OUTPUT_PATH = "./public/sitemap.xml";

const DOMAIN =
  process.env.NODE_ENV === "production"
    ? "https://spa.com"
    : "https://spa.fe-monorepo.localhost";

console.log("🚀 Generating sitemap...");

try {
  await simpleSitemapAndIndex({
    destinationDir: "./public",
    gzip: false,
    hostname: DOMAIN,
    sourceData: [
      { lastmod: new Date().toISOString(), url: "/" },
      { lastmod: new Date().toISOString(), url: "/login" },
    ],
  });
  fs.renameSync("public/sitemap-0.xml", "public/sitemap.xml");
  fs.unlinkSync("public/sitemap-index.xml");
  console.log(`✅ Sitemap generated successfully at: ${OUTPUT_PATH}`);
  console.log(`🌐 Domain: ${DOMAIN}`);
} catch (error) {
  console.error("❌ Error generating sitemap:", error);
  process.exit(1);
}
