import { cn } from "cn";
import type { ClassNameValue } from "cn";
import { composeRenderProps } from "react-aria-components/composeRenderProps";

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
  // SAFETY: `CxArgs` puts the render prop last, so the last element is the render prop.
  const renderProp = flat.pop() as Render<T>;

  return composeRenderProps(renderProp, (resolved) => cn(flat, resolved));
};
