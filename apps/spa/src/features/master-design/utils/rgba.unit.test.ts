import { fc, test } from "@fast-check/vitest";
import { describe, expect, it } from "vitest";

import { pixelToRgba } from "@/features/master-design/utils/rgba";

const byteArb = fc.integer({ min: 0, max: 255 });

describe("pixelToRgba", () => {
  it("should read the four channels of a pixel", () => {
    const pixel = new Uint8ClampedArray([255, 128, 0, 255]);

    const rgba = pixelToRgba(pixel);

    expect(rgba).toEqual({ r: 255, g: 128, b: 0, a: 1 });
  });

  it("should scale the alpha channel to the range 0 to 1", () => {
    const pixel = new Uint8ClampedArray([0, 0, 0, 51]);

    const rgba = pixelToRgba(pixel);

    expect(rgba?.a).toBeCloseTo(0.2);
  });

  it("should return null when the pixel has fewer than four channels", () => {
    const pixel = new Uint8ClampedArray([255, 128, 0]);

    const rgba = pixelToRgba(pixel);

    expect(rgba).toBeNull();
  });

  test.prop([fc.array(byteArb, { maxLength: 3 })])(
    "should never give a color for short pixel data",
    (channels) => {
      const rgba = pixelToRgba(new Uint8ClampedArray(channels));

      expect(rgba).toBeNull();
    }
  );

  test.prop([byteArb, byteArb, byteArb, byteArb])(
    "should always keep the red, green and blue channels as they are",
    (r, g, b, a) => {
      const rgba = pixelToRgba(new Uint8ClampedArray([r, g, b, a]));

      expect(rgba).toMatchObject({ r, g, b });
    }
  );
});
