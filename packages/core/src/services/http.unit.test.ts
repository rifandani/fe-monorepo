import { Http } from "@workspace/core/services/http";
import { describe, expect, it } from "vitest";

describe("Http", () => {
  it("creates a ky instance from config", () => {
    const http = new Http({ prefix: "https://api.example.com" });
    expect(http.instance).toBeDefined();
    expect(typeof http.instance.get).toBe("function");
  });

  it("updateConfig replaces the instance via extend", () => {
    const http = new Http({ prefix: "https://a.example.com" });
    const before = http.instance;
    http.updateConfig({ timeout: 1000 });
    expect(http.instance).not.toBe(before);
  });

  it("resetConfig recreates the instance", () => {
    const http = new Http({ prefix: "https://a.example.com" });
    const before = http.instance;
    http.resetConfig({ prefix: "https://b.example.com" });
    expect(http.instance).not.toBe(before);
  });
});
