import { defineConfig } from "@vite-pwa/assets-generator/config";

export default defineConfig({
  headLinkOptions: {
    preset: "2023",
  },
  images: ["public/favicon.svg"],
  preset: {
    apple: {
      sizes: [180],
    },
    maskable: {
      sizes: [192, 384, 512, 1024],
    },
    transparent: {
      favicons: [[48, "favicon.ico"]],
      sizes: [64, 192, 384, 512, 1024],
    },
  },
});
