import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { collectPageRoutes } from "./sitemap";

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
});
