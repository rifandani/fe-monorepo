import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it, vi } from "vitest";

import sitemap, { collectPageRoutes } from "./sitemap";

describe("collectPageRoutes", () => {
  let tmp: string;

  afterEach(() => {
    fs.rmSync(tmp, { force: true, recursive: true });
  });

  it("collects pages and skips private, group, and api dirs", () => {
    tmp = fs.mkdtempSync(path.join(os.tmpdir(), "sitemap-"));
    fs.writeFileSync(path.join(tmp, "page.tsx"), "");
    fs.mkdirSync(path.join(tmp, "login"));
    fs.writeFileSync(path.join(tmp, "login", "page.tsx"), "");
    fs.mkdirSync(path.join(tmp, "_private"));
    fs.writeFileSync(path.join(tmp, "_private", "page.tsx"), "");
    fs.mkdirSync(path.join(tmp, "(group)"));
    fs.writeFileSync(path.join(tmp, "(group)", "page.tsx"), "");
    fs.mkdirSync(path.join(tmp, "api"));
    fs.writeFileSync(path.join(tmp, "api", "page.tsx"), "");

    expect(collectPageRoutes(tmp).toSorted()).toEqual(["/", "/login"]);
  });

  it("ignores non-page files", () => {
    tmp = fs.mkdtempSync(path.join(os.tmpdir(), "sitemap-"));
    fs.writeFileSync(path.join(tmp, "layout.tsx"), "");
    fs.writeFileSync(path.join(tmp, "page.ts"), "");

    expect(collectPageRoutes(tmp)).toEqual(["/"]);
  });
});

const dirent = (name: string, isDirectory = false) =>
  ({ name, isDirectory: () => isDirectory }) as fs.Dirent;

describe("sitemap", () => {
  it("maps collected routes to absolute URLs", () => {
    // the app dir is resolved from `process.cwd()` at import time, so stub the
    // reads instead of depending on the real tree
    vi.spyOn(fs, "readdirSync").mockImplementation(((dir: string) =>
      dir.endsWith("login")
        ? [dirent("page.tsx")]
        : [dirent("page.tsx"), dirent("login", true)]) as never);

    expect(sitemap()).toEqual([
      { lastModified: expect.any(Date), url: "https://web.localhost/" },
      { lastModified: expect.any(Date), url: "https://web.localhost/login" },
    ]);
  });
});
