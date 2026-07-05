import "react";

declare module "react" {
  type CSSProperties = Record<`--${string}`, string | number>;
}

declare global {
  // oxlint-disable-next-line typescript/no-empty-interface typescript/no-empty-object-type
  interface Window {}
}
