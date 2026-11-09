/* oxlint-disable typescript/no-empty-interface typescript/no-empty-object-type */
import "react";

declare module "react" {
  type CSSProperties = Record<`--${string}`, string | number>;
}

declare global {
  interface Window {}
}
