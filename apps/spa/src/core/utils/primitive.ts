import { composeRenderProps } from "react-aria-components/composeRenderProps";
import type { ClassNameValue } from "tailwind-merge";
import { twMerge } from "tailwind-merge";

type Render<T> = string | ((v: T) => string) | undefined;
type CxArgs<T> =
  | [...ClassNameValue[], Render<T>]
  | [[...ClassNameValue[], Render<T>]];
export const cx = <T = unknown>(
  ...args: CxArgs<T>
): string | ((v: T) => string) => {
  // SAFETY: the single-array overload of `CxArgs` wraps exactly the variadic form,
  // so unwrapping it yields the same tuple.
  const flat = (
    args.length === 1 && Array.isArray(args[0]) ? args[0] : args
  ) as [...ClassNameValue[], Render<T>];
  // SAFETY: `CxArgs` puts the render prop last, so everything before it is a
  // class-name value and the last element is the render prop itself.
  const fixed = twMerge(...(flat.slice(0, -1) as ClassNameValue[]));
  // SAFETY: as above - the last element of `CxArgs` is the render prop.
  return composeRenderProps(flat.at(-1) as Render<T>, (cn) =>
    twMerge(fixed, cn)
  );
};
