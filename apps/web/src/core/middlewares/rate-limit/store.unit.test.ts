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
      // Exact value, not `instanceOf(Date)`: resetTime is
      // `now + windowMs - (now - lastRequest)`, i.e. the window end measured from the
      // *first* request in it. Asserting only the type cannot tell that subtraction
      // from an addition, which is precisely the off-by-a-window error that matters
      // for a rate limiter.
      expect(result?.resetTime?.getTime()).toBe(now + 60_000 - 1000);
    });

    // Boundary: `lastRequest < windowStart` expires, so a record sitting exactly on
    // windowStart is still inside the window. `<=` would evict it a tick early.
    it("keeps a record whose lastRequest sits exactly on the window start", async () => {
      const now = Date.now();
      vi.spyOn(Date, "now").mockReturnValue(now);
      db.select.mockReturnValue(
        db.makeChain([{ key: "k", count: 4, lastRequest: now - 60_000 }])
      );

      const result = await store.get("k");
      expect(result?.totalHits).toBe(4);
      expect(db.delete).not.toHaveBeenCalled();
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

    it("returns undefined when the row is empty", async () => {
      db.select.mockReturnValue(db.makeChain([undefined]));
      expect(await store.get("k")).toBeUndefined();
      // The `!record` guard must *return*, not fall through into `record.lastRequest`
      // and get rescued by the catch. Both paths yield `undefined`, so asserting the
      // return value alone cannot tell them apart — only the absence of a logged
      // error can.
      expect(log.error).not.toHaveBeenCalled();
    });

    it("treats a null lastRequest and count as an active zero-hit window", async () => {
      const now = Date.now();
      vi.spyOn(Date, "now").mockReturnValue(now);
      db.select.mockReturnValue(
        db.makeChain([{ key: "k", count: null, lastRequest: null }])
      );

      const result = await store.get("k");
      expect(result?.totalHits).toBe(0);
      expect(result?.resetTime?.getTime()).toBe(now + 60_000);
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

    // `totalHits` is read back from the *mocked* update result, so asserting it only
    // proves the mock. The count the store actually computes is the one it writes,
    // so these assert the `set()` payload — without that, every arithmetic and
    // boundary mutant in the counting logic is invisible.
    it("increments an existing active record", async () => {
      const now = Date.now();
      vi.spyOn(Date, "now").mockReturnValue(now);
      db.select.mockReturnValue(
        db.makeChain([{ key: "k", count: 2, lastRequest: now - 100 }])
      );
      const updateChain = db.makeChain([{ count: 3 }]);
      db.update.mockReturnValue(updateChain);

      const result = await store.increment("k");
      expect(result.totalHits).toBe(3);
      expect(updateChain.set).toHaveBeenCalledWith({
        count: 3,
        lastRequest: now,
      });
      expect(result.resetTime?.getTime()).toBe(now + 60_000);
    });

    it("resets count when window expired", async () => {
      const now = Date.now();
      vi.spyOn(Date, "now").mockReturnValue(now);
      db.select.mockReturnValue(
        db.makeChain([{ key: "k", count: 9, lastRequest: now - 120_000 }])
      );
      const updateChain = db.makeChain([{ count: 1 }]);
      db.update.mockReturnValue(updateChain);

      const result = await store.increment("k");
      expect(result.totalHits).toBe(1);
      // Written count is 1, not 10 — the expired window restarts rather than adding.
      expect(updateChain.set).toHaveBeenCalledWith({
        count: 1,
        lastRequest: now,
      });
    });

    // Boundary twin of the `get` case: `lastRequest < windowStart` resets, so a
    // record exactly on windowStart must still increment.
    it("increments rather than resets exactly on the window start", async () => {
      const now = Date.now();
      vi.spyOn(Date, "now").mockReturnValue(now);
      db.select.mockReturnValue(
        db.makeChain([{ key: "k", count: 7, lastRequest: now - 60_000 }])
      );
      const updateChain = db.makeChain([{ count: 8 }]);
      db.update.mockReturnValue(updateChain);

      await store.increment("k");
      expect(updateChain.set).toHaveBeenCalledWith({
        count: 8,
        lastRequest: now,
      });
    });

    it("treats a null count on an active record as zero before incrementing", async () => {
      const now = Date.now();
      vi.spyOn(Date, "now").mockReturnValue(now);
      db.select.mockReturnValue(
        db.makeChain([{ key: "k", count: null, lastRequest: now - 100 }])
      );
      const updateChain = db.makeChain([{ count: 1 }]);
      db.update.mockReturnValue(updateChain);

      await store.increment("k");
      expect(updateChain.set).toHaveBeenCalledWith({
        count: 1,
        lastRequest: now,
      });
    });

    it("falls back to one hit when the insert returns no row", async () => {
      db.select.mockReturnValue(db.makeChain([]));
      db.insert.mockReturnValue(db.makeChain([]));

      const inserted = await store.increment("new");
      expect(inserted.totalHits).toBe(1);
      // The `?.` on `inserted[0]` must do the work. Without it this throws and the
      // catch returns the same `totalHits: 1` fail-open value, so only the absence of
      // a logged error distinguishes the intended path from the rescued one.
      expect(log.error).not.toHaveBeenCalled();
    });

    it("falls back to one hit when the update returns no row", async () => {
      const now = Date.now();
      vi.spyOn(Date, "now").mockReturnValue(now);
      db.select.mockReturnValue(
        db.makeChain([{ key: "k", count: null, lastRequest: now - 100 }])
      );
      db.update.mockReturnValue(db.makeChain([]));

      const updated = await store.increment("k");
      expect(updated.totalHits).toBe(1);
      expect(log.error).not.toHaveBeenCalled();
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

    it("logs resetKey errors", async () => {
      db.delete.mockImplementation(() => {
        throw new Error("reset fail");
      });
      await store.resetKey("k");
      expect(log.error).toHaveBeenCalledWith(
        expect.objectContaining({ operation: "resetKey" })
      );
    });

    it("logs resetAll errors", async () => {
      db.delete.mockImplementation(() => {
        throw new Error("reset all fail");
      });
      await store.resetAll();
      expect(log.error).toHaveBeenCalledWith(
        expect.objectContaining({ operation: "resetAll" })
      );
    });
  });
});
