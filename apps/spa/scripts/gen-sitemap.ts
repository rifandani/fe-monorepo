import fs from "node:fs";

import { simpleSitemapAndIndex } from "sitemap";

const OUTPUT_PATH = "./public/sitemap.xml";

const DOMAIN =
  process.env.NODE_ENV === "production"
    ? "https://spa.com"
    : "https://spa.fe-monorepo.localhost";

console.log("🚀 Generating sitemap...");

try {
  // writes sitemaps and index out to the destination you provide.
  await simpleSitemapAndIndex({
    destinationDir: "./public",
    gzip: false,
    hostname: DOMAIN,
    sourceData: [
      { lastmod: new Date().toISOString(), url: "/" },
      { lastmod: new Date().toISOString(), url: "/login" },
    ],
  });
  // rename the generated file "sitemap-0.xml" to "sitemap.xml"
  fs.renameSync("public/sitemap-0.xml", "public/sitemap.xml");
  // delete the file "sitemap-index.xml"
  fs.unlinkSync("public/sitemap-index.xml");
  console.log(`✅ Sitemap generated successfully at: ${OUTPUT_PATH}`);
  console.log(`🌐 Domain: ${DOMAIN}`);
} catch (error) {
  console.error("❌ Error generating sitemap:", error);
  process.exit(1);
}
