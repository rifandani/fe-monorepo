import type { NextRequest } from "next/server";

export const parseOgRequest = (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  return {
    isLight: req.headers.get("Sec-CH-Prefers-Color-Scheme") === "light",
    title: searchParams.has("title")
      ? searchParams.get("title")
      : "@workspace/web",
    logo: searchParams.has("logo") ? searchParams.get("logo") : "next",
  };
};
