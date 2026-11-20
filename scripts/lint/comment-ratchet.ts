export interface CommentBaseline {
  readonly [file: string]: number;
}

export interface SourceComment {
  readonly type: "Line" | "Block" | "Shebang";
  readonly value: string;
}

export type FileVerdict =
  | { readonly kind: "within" }
  | { readonly kind: "over"; readonly count: number; readonly allowed: number }
  | {
      readonly kind: "stale";
      readonly count: number;
      readonly allowed: number;
    };

const DIRECTIVE_PATTERN =
  /^[\s*]*(?:oxlint-(?:disable|enable)|eslint-(?:disable|enable)|@ts-(?:expect-error|ignore|nocheck|check)|fallow-ignore|Stryker (?:disable|restore)|istanbul ignore|[vc]8 ignore|@vite-ignore|[#@]__PURE__|@vitest-environment|@jsxImportSource|@type\s*\{|\/\s*<reference\b|gitleaks:allow)/u;

export const isDirective = (comment: SourceComment): boolean =>
  comment.type === "Shebang" || DIRECTIVE_PATTERN.test(comment.value);

export const judgeFile = (count: number, allowed: number): FileVerdict => {
  if (count > allowed) {
    return { kind: "over", count, allowed };
  }

  if (count < allowed) {
    return { kind: "stale", count, allowed };
  }

  return { kind: "within" };
};

const VERDICT_TAG = /\[comments (?<count>\d+)\/(?<allowed>\d+)\]/u;

export const verdictTag = (count: number, allowed: number): string =>
  `[comments ${count}/${allowed}]`;

export const parseVerdictTag = (
  message: string
): { readonly count: number; readonly allowed: number } | undefined => {
  const groups = VERDICT_TAG.exec(message)?.groups;

  if (groups?.count === undefined || groups.allowed === undefined) {
    return undefined;
  }

  return { count: Number(groups.count), allowed: Number(groups.allowed) };
};

export const tightenBaseline = (
  baseline: CommentBaseline,
  counts: CommentBaseline,
  exists: (file: string) => boolean
): CommentBaseline =>
  Object.fromEntries(
    Object.entries(baseline)
      .map(
        ([file, allowed]) =>
          [file, Math.min(counts[file] ?? allowed, allowed)] as const
      )
      .filter(([file, count]) => count > 0 && exists(file))
      .toSorted(([left], [right]) => left.localeCompare(right))
  );
