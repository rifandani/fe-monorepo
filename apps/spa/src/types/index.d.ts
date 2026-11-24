/* oxlint-disable typescript/no-empty-interface typescript/no-empty-object-type -- module augmentation needs an empty interface */
import "react";

declare module "react" {
  type CSSProperties = Record<`--${string}`, string | number>;
}

declare global {
  interface Window {}
}
