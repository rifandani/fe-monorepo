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
  // SAFETY: a single array argument is the nested CxArgs form, which holds the same tuple as the spread form.
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion
  const flat = (
    args.length === 1 && Array.isArray(args[0]) ? args[0] : args
  ) as [...ClassNameValue[], Render<T>];

  // SAFETY: the last element of the tuple is the Render<T> slot, and Render<T> includes undefined.
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion
  const renderProp = flat.pop() as Render<T>;

  return composeRenderProps(renderProp, (resolved) => cn(flat, resolved));
};
