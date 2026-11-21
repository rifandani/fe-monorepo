import { defineTranslation } from "@workspace/core/i18n/define-translation";
import { describe, expect, it } from "vitest";

describe("defineTranslation", () => {
  it("should return the message and its options as a tuple", () => {
    const message = "Hello {name}!";

    const translation = defineTranslation(message, {});

    expect(translation).toEqual(["Hello {name}!", {}]);
  });

  it("should keep the typed option map of a placeholder", () => {
    const plural = {
      count: { one: "{?} message", other: "{?} messages" },
    };

    const [message, options] = defineTranslation(
      "You have {count:plural} messages",
      { plural }
    );

    expect(message).toBe("You have {count:plural} messages");
    expect(options.plural).toBe(plural);
  });
});
