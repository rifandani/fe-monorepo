import { composeRenderProps } from "react-aria-components/composeRenderProps";
import type { ClassNameValue } from "tailwind-merge";
import { twMerge } from "tailwind-merge";

export const composeTailwindRenderProps = <T>(
  className: string | ((v: T) => string) | undefined,
  tailwind: ClassNameValue
): string | ((v: T) => string) =>
  composeRenderProps(className, (_className) => twMerge(tailwind, _className));
type Render<T> = string | ((v: T) => string) | undefined;
type CxArgs<T> =
  | [...ClassNameValue[], Render<T>]
  | [[...ClassNameValue[], Render<T>]];
export const cx = <T = unknown>(
  ...args: CxArgs<T>
): string | ((v: T) => string) => {
  let resolvedArgs = args;
  if (args.length === 1 && Array.isArray(args[0])) {
    // SAFETY: the single-array overload of `CxArgs` wraps exactly the variadic
    // form, so unwrapping it yields the same tuple.
    resolvedArgs = args[0] as [...ClassNameValue[], Render<T>];
  }
  // SAFETY: `CxArgs` puts the render prop last, so this pop is that element.
  const className = resolvedArgs.pop() as Render<T>;
  // SAFETY: with the render prop popped, only class-name values remain.
  const tailwinds = resolvedArgs as ClassNameValue[];
  const fixed = twMerge(...tailwinds);
  return composeRenderProps(className, (cn) => twMerge(fixed, cn));
};
