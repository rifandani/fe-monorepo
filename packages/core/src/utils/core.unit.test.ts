import {
  clamp,
  deepReadObject,
  indonesianPhoneNumberFormat,
  objectToFormData,
  objectToFormDataArrayWithComma,
  removeLeadingWhitespace,
  removeLeadingZeros,
  toBase64,
  toCamelCase,
  toSnakeCase,
} from "@workspace/core/utils/core";
import { describe, expect, it, vi } from "vitest";

describe("clamp", () => {
  it("clamps above max", () => {
    expect(clamp({ value: 12, min: 0, max: 10 })).toBe(10);
  });

  it("clamps below min", () => {
    expect(clamp({ value: -5, min: 0, max: 10 })).toBe(0);
  });

  it("returns value in range", () => {
    expect(clamp({ value: 5, min: 0, max: 10 })).toBe(5);
  });
});

describe("indonesianPhoneNumberFormat", () => {
  it("formats +62 numbers", () => {
    expect(indonesianPhoneNumberFormat("+6281273636365")).toBe(
      "+62-812-7363-6365"
    );
  });
});

describe("toCamelCase / toSnakeCase", () => {
  it("converts nested snake_case keys to camelCase", () => {
    expect(
      toCamelCase({ first_name: "Ada", nested: { last_name: "Lovelace" } })
    ).toEqual({
      firstName: "Ada",
      nested: { lastName: "Lovelace" },
    });
  });

  it("converts nested camelCase keys to snake_case", () => {
    expect(
      toSnakeCase({ firstName: "Ada", nested: { lastName: "Lovelace" } })
    ).toEqual({
      first_name: "Ada",
      nested: { last_name: "Lovelace" },
    });
  });

  it("maps arrays", () => {
    expect(toCamelCase([{ user_id: 1 }])).toEqual([{ userId: 1 }]);
    expect(toSnakeCase([{ userId: 1 }])).toEqual([{ user_id: 1 }]);
  });
});

describe("removeLeadingZeros", () => {
  it("strips a single leading zero before a non-zero digit", () => {
    expect(removeLeadingZeros("0123")).toBe("123");
  });

  it("collapses multiple leading zeros to one", () => {
    expect(removeLeadingZeros("000")).toBe("0");
  });
});

describe("removeLeadingWhitespace", () => {
  it("returns empty string for undefined", () => {
    expect(removeLeadingWhitespace()).toBe("");
  });

  it("strips whitespace-only strings", () => {
    expect(removeLeadingWhitespace("   ")).toBe("");
  });

  it("leaves mixed strings unchanged", () => {
    expect(removeLeadingWhitespace("  hi")).toBe("  hi");
  });
});

describe("objectToFormData", () => {
  it("flattens nested objects and arrays", () => {
    const formData = objectToFormData({
      num: 1,
      name: "str",
      nested: { key: "v" },
      array: [{ nested_key1: { name: "key1" } }],
    });
    expect(formData.get("num")).toBe("1");
    expect(formData.get("name")).toBe("str");
    expect(formData.get("nested.key")).toBe("v");
    expect(formData.get("array[0].nested_key1.name")).toBe("key1");
  });

  it("ignores listed keys", () => {
    const formData = objectToFormData(
      { keep: "a", drop: "b" },
      { ignoreList: ["drop"] }
    );
    expect(formData.get("keep")).toBe("a");
    expect(formData.get("drop")).toBeNull();
  });
});

describe("objectToFormDataArrayWithComma", () => {
  it("joins string arrays with commas", () => {
    const formData = objectToFormDataArrayWithComma({
      filters: ["model", "category"],
    });
    expect(formData.get("filters")).toBe("model,category");
  });
});

describe("deepReadObject", () => {
  const obj = { a: { b: { c: "hello" } } };

  it("reads nested paths", () => {
    expect(deepReadObject(obj, "a.b.c")).toBe("hello");
  });

  it("returns default when missing", () => {
    expect(deepReadObject(obj, "a.b.d", "not found")).toBe("not found");
  });
});

const createFileReaderMock = (mode: "ok" | "error") =>
  function FileReaderMock(this: {
    result: string | null;
    onload: ((ev: ProgressEvent<FileReader>) => void) | null;
    onerror: ((ev: ProgressEvent<FileReader>) => void) | null;
    readAsDataURL: () => void;
  }) {
    this.result = null;
    this.readAsDataURL = () => {
      if (mode === "ok") {
        this.result = "data:text/plain;base64,Zm9v";
        queueMicrotask(() => {
          this.onload?.(new Event("load") as ProgressEvent<FileReader>);
        });
        return;
      }
      queueMicrotask(() => {
        this.onerror?.(new Event("error") as ProgressEvent<FileReader>);
      });
    };
  };

describe("toBase64", () => {
  it("reads a File as a data URL", async () => {
    vi.stubGlobal("FileReader", createFileReaderMock("ok"));
    const file = new File(["foo"], "foo.txt", { type: "text/plain" });
    await expect(toBase64(file)).resolves.toBe("data:text/plain;base64,Zm9v");
  });

  it("rejects when FileReader errors", async () => {
    vi.stubGlobal("FileReader", createFileReaderMock("error"));
    const file = new File(["foo"], "foo.txt", { type: "text/plain" });
    await expect(toBase64(file)).rejects.toBeTruthy();
  });
});
