import { fc, test } from "@fast-check/vitest";
import {
  createKeyList,
  getIndex,
  getKey,
  insertKeys,
  moveKey,
  popKey,
  removeKey,
  resetKeys,
  shiftKey,
} from "@workspace/core/utils/key-list";
import type { KeyList } from "@workspace/core/utils/key-list";
import { describe, expect, it } from "vitest";

type KeyOp =
  | { kind: "insert"; at: number; count: number }
  | { kind: "remove"; at: number }
  | { kind: "move"; from: number; to: number }
  | { kind: "pop" }
  | { kind: "shift" }
  | { kind: "reset"; count: number };

const countArb = fc.array(fc.constant(null)).map((items) => items.length);

const keyOpArb: fc.Arbitrary<KeyOp> = fc.oneof(
  fc.record({ kind: fc.constant("insert"), at: fc.nat(), count: countArb }),
  fc.record({ kind: fc.constant("remove"), at: fc.nat() }),
  fc.record({ kind: fc.constant("move"), from: fc.nat(), to: fc.nat() }),
  fc.record({ kind: fc.constant("pop") }),
  fc.record({ kind: fc.constant("shift") }),
  fc.record({ kind: fc.constant("reset"), count: countArb })
);

const applyOp = (keyList: KeyList, op: KeyOp): KeyList => {
  const { length } = keyList.keys;

  if (op.kind === "insert") {
    return insertKeys(keyList, op.at % (length + 1), op.count);
  }

  if (op.kind === "reset") {
    return resetKeys(keyList, op.count);
  }

  if (length === 0) {
    return keyList;
  }

  if (op.kind === "remove") {
    return removeKey(keyList, op.at % length);
  }

  if (op.kind === "move") {
    return moveKey(keyList, op.from % length, op.to % length);
  }

  return op.kind === "pop" ? popKey(keyList) : shiftKey(keyList);
};

const runOps = (count: number, ops: KeyOp[]) =>
  ops.reduce(applyOp, createKeyList(count));

describe("createKeyList", () => {
  it("should start with the keys 0 to count - 1", () => {
    const keyList = createKeyList(3);

    expect(keyList.keys).toEqual([0, 1, 2]);
  });

  it("should give the same keys each time it is called", () => {
    const first = createKeyList(3);

    const second = createKeyList(3);

    expect(second).toEqual(first);
  });
});

describe("getKey", () => {
  it("should give the key at an index", () => {
    const keyList = moveKey(createKeyList(3), 0, 2);

    const key = getKey(keyList, 2);

    expect(key).toBe(0);
  });
});

describe("getIndex", () => {
  it("should find the index of a key", () => {
    const keyList = moveKey(createKeyList(3), 0, 2);

    const index = getIndex(keyList, 0);

    expect(index).toBe(2);
  });
});

describe("insertKeys", () => {
  it("should give inserted items new keys and keep the others", () => {
    const keyList = createKeyList(3);

    const inserted = insertKeys(keyList, 1, 2);

    expect(inserted.keys).toEqual([0, 3, 4, 1, 2]);
  });

  test.prop([countArb, fc.nat(), countArb])(
    "should never change the key list it is given",
    (count, at, insertCount) => {
      const keyList = createKeyList(count);

      insertKeys(keyList, at, insertCount);

      expect(keyList).toEqual(createKeyList(count));
    }
  );
});

describe("removeKey", () => {
  it("should keep the keys of the other items", () => {
    const keyList = createKeyList(3);

    const removed = removeKey(keyList, 1);

    expect(removed.keys).toEqual([0, 2]);
  });
});

describe("moveKey", () => {
  it("should move a key with its item", () => {
    const keyList = createKeyList(3);

    const moved = moveKey(keyList, 0, 2);

    expect(moved.keys).toEqual([1, 2, 0]);
  });
});

describe("popKey", () => {
  it("should drop the last key", () => {
    const keyList = createKeyList(3);

    const popped = popKey(keyList);

    expect(popped.keys).toEqual([0, 1]);
  });
});

describe("shiftKey", () => {
  it("should drop the first key", () => {
    const keyList = createKeyList(3);

    const shifted = shiftKey(keyList);

    expect(shifted.keys).toEqual([1, 2]);
  });
});

describe("resetKeys", () => {
  it("should give every item a key that was not used before", () => {
    const keyList = createKeyList(2);

    const reset = resetKeys(keyList, 2);

    expect(reset.keys).toEqual([2, 3]);
  });
});

describe("key list operations", () => {
  test.prop([countArb, fc.array(keyOpArb)])(
    "should always keep every key unique",
    (count, ops) => {
      const keyList = runOps(count, ops);

      expect(new Set(keyList.keys).size).toBe(keyList.keys.length);
    }
  );

  test.prop([countArb, fc.array(keyOpArb)])(
    "should always find each key at its own index",
    (count, ops) => {
      const keyList = runOps(count, ops);

      const indexes = keyList.keys.map((key) => getIndex(keyList, key));

      expect(indexes).toEqual(keyList.keys.map((_, index) => index));
    }
  );
});
