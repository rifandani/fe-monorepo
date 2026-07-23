/* oxlint-disable promise/prefer-await-to-then github/no-then promise/prefer-await-to-callbacks */
import fs from "node:fs";

import { simpleSitemapAndIndex } from "sitemap";

const OUTPUT_PATH = "./public/sitemap.xml";
const DOMAIN =
  process.env.NODE_ENV === "production"
    ? "https://spa.com"
    : "https://spa.localhost";
console.log("🚀 Generating sitemap...");
// writes sitemaps and index out to the destination you provide.
simpleSitemapAndIndex({
  destinationDir: "./public",
  gzip: false,
  hostname: DOMAIN,
  sourceData: [
    { lastmod: new Date().toISOString(), url: "/" },
    { lastmod: new Date().toISOString(), url: "/login" },
  ],
})
  .then(() => {
    console.log(`✅ Sitemap generated successfully at: ${OUTPUT_PATH}`);
    console.log(`🌐 Domain: ${DOMAIN}`);
    // rename the generated file "sitemap-0.xml" to "sitemap.xml"
    fs.renameSync("public/sitemap-0.xml", "public/sitemap.xml");
    // delete the file "sitemap-index.xml"
    fs.unlinkSync("public/sitemap-index.xml");
  })
  .catch((error) => {
    console.error("❌ Error generating sitemap:", error);
    process.exit(1);
  });
