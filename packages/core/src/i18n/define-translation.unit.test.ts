import { defineTranslation } from "@workspace/core/i18n/define-translation";
import { describe, expect, it } from "vitest";

describe("defineTranslation", () => {
  it("should return the message and its options as a tuple", () => {
    // Arrange
    const message = "Hello {name}!";

    // Act
    const translation = defineTranslation(message, {});

    // Assert
    expect(translation).toEqual(["Hello {name}!", {}]);
  });

  it("should keep the typed option map of a placeholder", () => {
    // Arrange
    const plural = {
      count: { one: "{?} message", other: "{?} messages" },
    };

    // Act
    const [message, options] = defineTranslation(
      "You have {count:plural} messages",
      { plural }
    );

    // Assert
    expect(message).toBe("You have {count:plural} messages");
    expect(options.plural).toBe(plural);
  });
});
