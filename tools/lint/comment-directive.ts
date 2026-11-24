export interface SourceComment {
  readonly type: "Line" | "Block" | "Shebang";
  readonly value: string;
}

const DIRECTIVE_PATTERN =
  /^[\s*]*(?:oxlint-(?:disable|enable)|eslint-(?:disable|enable)|@ts-(?:expect-error|ignore|nocheck|check)|fallow-ignore|Stryker (?:disable|restore)|istanbul ignore|[vc]8 ignore|@vite-ignore|[#@]__PURE__|@vitest-environment|@jsxImportSource|@type\s*\{|\/\s*<reference\b|gitleaks:allow|SAFETY\s*:\s*\S)/u;

export const isDirective = (comment: SourceComment): boolean =>
  comment.type === "Shebang" || DIRECTIVE_PATTERN.test(comment.value);

const SUPPRESSION_PATTERN =
  /^[\s*]*(?:(?:oxlint|eslint)-disable(?:-next-line|-line)?\b|@ts-(?:expect-error|ignore|nocheck)\b|fallow-ignore(?:-next-line|-file)?\b|Stryker disable\b|istanbul ignore\b|[vc]8 ignore (?!stop\b)|gitleaks:allow)/u;

const STRYKER_PATTERN = /^[\s*]*Stryker disable\b/u;

const DASH_REASON_PATTERN = /\s--\s+\S/u;

const COLON_REASON_PATTERN = /:\s*\S/u;

export const isSuppression = (comment: SourceComment): boolean =>
  comment.type !== "Shebang" && SUPPRESSION_PATTERN.test(comment.value);

export const hasReason = (comment: SourceComment): boolean =>
  DASH_REASON_PATTERN.test(comment.value) ||
  (STRYKER_PATTERN.test(comment.value) &&
    COLON_REASON_PATTERN.test(comment.value));
