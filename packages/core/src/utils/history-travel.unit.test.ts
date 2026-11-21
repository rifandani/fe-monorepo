import { fc, test } from "@fast-check/vitest";
import {
  pushValue,
  split,
  travelBackward,
  travelForward,
} from "@workspace/core/utils/history-travel";
import type { History } from "@workspace/core/utils/history-travel";
import { describe, expect, it } from "vitest";

const historyArb = fc.record({
  future: fc.array(fc.integer()),
  past: fc.array(fc.integer()),
  present: fc.integer(),
});

const historyWithPastArb = fc
  .tuple(historyArb, fc.integer())
  .map(([history, first]) => ({ ...history, past: [first, ...history.past] }));

const historyWithFutureArb = fc
  .tuple(historyArb, fc.integer())
  .map(([history, first]) => ({
    ...history,
    future: [first, ...history.future],
  }));

const nonEmptyArb = fc
  .tuple(fc.integer(), fc.array(fc.integer()))
  .map(([head, tail]): [number, ...number[]] => [head, ...tail]);

const timeline = (history: History<number>) => [
  ...history.past,
  history.present,
  ...history.future,
];

describe("split", () => {
  it("should pick the item at a positive step from the start", () => {
    const items: [string, ...string[]] = ["a", "b", "c", "d"];

    const result = split(2, items);

    expect(result).toEqual({
      _after: ["c", "d"],
      _before: ["a"],
      _current: "b",
    });
  });

  it("should pick the item at a negative step from the end", () => {
    const items: [string, ...string[]] = ["a", "b", "c", "d"];

    const result = split(-1, items);

    expect(result).toEqual({
      _after: [],
      _before: ["a", "b", "c"],
      _current: "d",
    });
  });

  it("should clamp a step that is larger than the list to the last item", () => {
    const items: [string, ...string[]] = ["a", "b"];

    const result = split(10, items);

    expect(result).toEqual({ _after: [], _before: ["a"], _current: "b" });
  });

  it("should clamp a negative step that is larger than the list to the first item", () => {
    const items: [string, ...string[]] = ["a", "b"];

    const result = split(-10, items);

    expect(result).toEqual({ _after: ["b"], _before: [], _current: "a" });
  });

  it("should pick an undefined item as the current one", () => {
    const items: [string | undefined, ...(string | undefined)[]] = [
      "a",
      undefined,
      "c",
    ];

    const result = split(2, items);

    expect(result).toEqual({
      _after: ["c"],
      _before: ["a"],
      _current: undefined,
    });
  });

  test.prop([nonEmptyArb, fc.integer()])(
    "should always keep every item around the current one",
    (items, step) => {
      const { _before, _current, _after } = split(step, items);

      expect([..._before, _current, ..._after]).toEqual(items);
    }
  );
});

describe("pushValue", () => {
  it("should move the present into the past and clear the future", () => {
    const history: History<string> = {
      future: ["c"],
      past: ["a"],
      present: "b",
    };

    const result = pushValue(history, "d", 0);

    expect(result).toEqual({ future: [], past: ["a", "b"], present: "d" });
  });

  it("should drop the oldest past value when the past is longer than maxLength", () => {
    const history: History<string> = {
      future: [],
      past: ["a", "b"],
      present: "c",
    };

    const result = pushValue(history, "d", 2);

    expect(result).toEqual({ future: [], past: ["b", "c"], present: "d" });
  });

  it("should keep undefined as a present value", () => {
    const history: History<string | undefined> = {
      future: [],
      past: [],
      present: undefined,
    };

    const result = pushValue(history, "a", 0);

    expect(result).toEqual({ future: [], past: [undefined], present: "a" });
  });

  test.prop([
    fc.integer({ min: 1 }).chain((maxLength) =>
      fc.tuple(
        historyArb.chain((history) =>
          fc
            .array(fc.integer(), { maxLength })
            .map((past) => ({ ...history, past }))
        ),
        fc.constant(maxLength)
      )
    ),
    fc.integer(),
  ])(
    "should never let a past within maxLength grow longer than maxLength",
    ([history, maxLength], value) => {
      const result = pushValue(history, value, maxLength);

      expect(result.past.length).toBeLessThanOrEqual(maxLength);
    }
  );

  test.prop([historyArb, fc.integer()])(
    "should always keep the whole past when maxLength is 0",
    (history, value) => {
      const result = pushValue(history, value, 0);

      expect(result.past).toEqual([...history.past, history.present]);
    }
  );
});

describe("travelBackward", () => {
  it("should make the previous value the present", () => {
    const history: History<string> = {
      future: ["d"],
      past: ["a", "b"],
      present: "c",
    };

    const result = travelBackward(history, -1);

    expect(result).toEqual({ future: ["c", "d"], past: ["a"], present: "b" });
  });

  test.prop([historyWithPastArb, fc.integer({ max: -1 })])(
    "should always keep the timeline when going back",
    (history, step) => {
      const result = travelBackward(history, step);

      expect(timeline(result)).toEqual(timeline(history));
    }
  );
});

describe("travelForward", () => {
  it("should make the next value the present", () => {
    const history: History<string> = {
      future: ["c", "d"],
      past: ["a"],
      present: "b",
    };

    const result = travelForward(history, 1);

    expect(result).toEqual({ future: ["d"], past: ["a", "b"], present: "c" });
  });

  test.prop([historyWithFutureArb, fc.integer({ min: 1 })])(
    "should always keep the timeline when going forward",
    (history, step) => {
      const result = travelForward(history, step);

      expect(timeline(result)).toEqual(timeline(history));
    }
  );

  test.prop([
    historyWithPastArb.chain((history) =>
      fc.tuple(
        fc.constant(history),
        fc.integer({ max: history.past.length, min: 1 })
      )
    ),
  ])(
    "should always restore the present when going back N steps and then forward N steps",
    ([history, steps]) => {
      const result = travelForward(travelBackward(history, -steps), steps);

      expect(result).toEqual(history);
    }
  );
});
