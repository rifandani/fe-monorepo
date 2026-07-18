import { beforeEach, describe, expect, it, vi } from "vitest";

import { DbStore } from "./store";

vi.mock("server-only", () => ({}));

const log = vi.hoisted(() => ({
  error: vi.fn(),
  info: vi.fn(),
}));

vi.mock("@/core/utils/evlog", () => ({ log }));

interface Chain {
  from: ReturnType<typeof vi.fn>;
  where: ReturnType<typeof vi.fn>;
  limit: ReturnType<typeof vi.fn>;
  set: ReturnType<typeof vi.fn>;
  values: ReturnType<typeof vi.fn>;
  returning: ReturnType<typeof vi.fn>;
}

const db = vi.hoisted(() => {
  const makeChain = (result: unknown = []): Chain => {
    const chain = {} as Chain;
    chain.from = vi.fn(() => chain);
    chain.where = vi.fn(() => chain);
    chain.limit = vi.fn(() => result);
    chain.set = vi.fn(() => chain);
    chain.values = vi.fn(() => chain);
    chain.returning = vi.fn(() => result);
    return chain;
  };

  return {
    makeChain,
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  };
});

vi.mock("@/db/index", () => ({ db }));
vi.mock("@/db/schema", () => ({
  rateLimitTable: {
    key: "key",
    count: "count",
    lastRequest: "lastRequest",
  },
}));

describe("DbStore", () => {
  let store: DbStore;

  beforeEach(() => {
    vi.clearAllMocks();
    store = new DbStore();
    store.init({
      windowMs: 60_000,
      limit: 5,
      message: "x",
      statusCode: 429,
      standardHeaders: "draft-6",
      requestPropertyName: "rateLimit",
      requestStorePropertyName: "rateLimitStore",
      keyGenerator: () => "k",
      handler: () => {},
      store,
    });
  });

  describe("get", () => {
    it("returns undefined when no record exists", async () => {
      db.select.mockReturnValue(db.makeChain([]));
      expect(await store.get("missing")).toBeUndefined();
    });

    it("returns hits for an active window", async () => {
      const now = Date.now();
      vi.spyOn(Date, "now").mockReturnValue(now);
      db.select.mockReturnValue(
        db.makeChain([{ key: "k", count: 3, lastRequest: now - 1000 }])
      );

      const result = await store.get("k");
      expect(result?.totalHits).toBe(3);
      expect(result?.resetTime).toBeInstanceOf(Date);
    });

    it("deletes expired records", async () => {
      const now = Date.now();
      vi.spyOn(Date, "now").mockReturnValue(now);
      db.select.mockReturnValue(
        db.makeChain([{ key: "k", count: 3, lastRequest: now - 120_000 }])
      );
      const deleteChain = db.makeChain();
      db.delete.mockReturnValue(deleteChain);

      expect(await store.get("k")).toBeUndefined();
      expect(db.delete).toHaveBeenCalled();
    });

    it("logs and fails open on db errors", async () => {
      db.select.mockImplementation(() => {
        throw new Error("db down");
      });
      expect(await store.get("k")).toBeUndefined();
      expect(log.error).toHaveBeenCalledWith(
        expect.objectContaining({
          area: "rateLimit.dbStore",
          operation: "get",
          failOpen: true,
        })
      );
    });
  });

  describe("increment", () => {
    it("inserts a new record when missing", async () => {
      db.select.mockReturnValue(db.makeChain([]));
      db.insert.mockReturnValue(db.makeChain([{ count: 1 }]));

      const result = await store.increment("new");
      expect(result.totalHits).toBe(1);
      expect(db.insert).toHaveBeenCalled();
    });

    it("increments an existing active record", async () => {
      const now = Date.now();
      vi.spyOn(Date, "now").mockReturnValue(now);
      db.select.mockReturnValue(
        db.makeChain([{ key: "k", count: 2, lastRequest: now - 100 }])
      );
      db.update.mockReturnValue(db.makeChain([{ count: 3 }]));

      const result = await store.increment("k");
      expect(result.totalHits).toBe(3);
    });

    it("resets count when window expired", async () => {
      const now = Date.now();
      vi.spyOn(Date, "now").mockReturnValue(now);
      db.select.mockReturnValue(
        db.makeChain([{ key: "k", count: 9, lastRequest: now - 120_000 }])
      );
      db.update.mockReturnValue(db.makeChain([{ count: 1 }]));

      const result = await store.increment("k");
      expect(result.totalHits).toBe(1);
    });

    it("returns fail-open estimate on error", async () => {
      db.select.mockImplementation(() => {
        throw new Error("write fail");
      });
      const result = await store.increment("k");
      expect(result.totalHits).toBe(1);
      expect(log.error).toHaveBeenCalledWith(
        expect.objectContaining({
          operation: "increment",
          failOpen: true,
        })
      );
    });
  });

  describe("decrement / resetKey / resetAll / shutdown", () => {
    it("decrements via update", async () => {
      db.update.mockReturnValue(db.makeChain());
      await store.decrement("k");
      expect(db.update).toHaveBeenCalled();
    });

    it("resetKey deletes one key", async () => {
      db.delete.mockReturnValue(db.makeChain());
      await store.resetKey("k");
      expect(db.delete).toHaveBeenCalled();
    });

    it("resetAll deletes all rows", async () => {
      db.delete.mockReturnValue(db.makeChain());
      await store.resetAll();
      expect(db.delete).toHaveBeenCalled();
    });

    it("shutdown is a no-op", () => {
      expect(() => store.shutdown()).not.toThrow();
    });

    it("logs decrement errors", async () => {
      db.update.mockImplementation(() => {
        throw new Error("dec fail");
      });
      await store.decrement("k");
      expect(log.error).toHaveBeenCalledWith(
        expect.objectContaining({ operation: "decrement" })
      );
    });
  });
});
