import { cn } from "cn";
import type { ClassNameValue } from "cn";
import { isFunction } from "radashi";
import { composeRenderProps } from "react-aria-components/composeRenderProps";

type Render<T> = string | ((v: T) => string) | undefined;

type CxArgs<T> =
  | [...ClassNameValue[], Render<T>]
  | [[...ClassNameValue[], Render<T>]];

export const cx = <T = unknown>(
  ...args: CxArgs<T>
): string | ((v: T) => string) => {
  const [first] = args;
  const flat = args.length === 1 && Array.isArray(first) ? first : args;
  const last = flat.at(-1);

  if (isFunction(last)) {
    const classNames = flat.slice(0, -1);

    return composeRenderProps<string | undefined, T, string>(last, (resolved) =>
      cn(classNames, resolved)
    );
  }

  return () => cn(flat);
};
