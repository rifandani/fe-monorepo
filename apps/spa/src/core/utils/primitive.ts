/* oxlint-disable eslint/func-style -- function declarations */
import { composeRenderProps } from "react-aria-components/composeRenderProps";
import type { ClassNameValue } from "tailwind-merge";
import { twMerge } from "tailwind-merge";

type Render<T> = string | ((v: T) => string) | undefined;
type CxArgs<T> =
  | [...ClassNameValue[], Render<T>]
  | [[...ClassNameValue[], Render<T>]];
export function cx<T = unknown>(
  ...args: CxArgs<T>
): string | ((v: T) => string) {
  const flat = (
    args.length === 1 && Array.isArray(args[0]) ? args[0] : args
  ) as [...ClassNameValue[], Render<T>];
  const fixed = twMerge(...(flat.slice(0, -1) as ClassNameValue[]));
  return composeRenderProps(flat.at(-1) as Render<T>, (cn) =>
    twMerge(fixed, cn)
  );
}
