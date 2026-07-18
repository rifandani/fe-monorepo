import { defineTranslation } from "@workspace/core/libs/i18n/define-translation";
import { describe, expect, it } from "vitest";

describe("defineTranslation", () => {
  it("returns the string and options tuple", () => {
    const result = defineTranslation("Hello {name}!", {});
    expect(result).toEqual(["Hello {name}!", {}]);
  });

  it("preserves typed option maps", () => {
    const result = defineTranslation("You have {count:plural} messages", {
      plural: {
        count: {
          one: "{?} message",
          other: "{?} messages",
        },
      },
    });
    expect(result[0]).toContain("{count:plural}");
    expect(result[1].plural?.count.other).toBe("{?} messages");
  });
});
