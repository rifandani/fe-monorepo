export interface Rgba {
  r: number;
  g: number;
  b: number;
  a: number;
}

export const pixelToRgba = (pixel: Iterable<number>): Rgba | null => {
  const [r, g, b, a] = [...pixel];

  if (
    r === undefined ||
    g === undefined ||
    b === undefined ||
    a === undefined
  ) {
    return null;
  }

  return { r, g, b, a: a / 255 };
};
