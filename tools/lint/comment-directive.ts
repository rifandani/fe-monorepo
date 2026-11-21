export interface SourceComment {
  readonly type: "Line" | "Block" | "Shebang";
  readonly value: string;
}

const DIRECTIVE_PATTERN =
  /^[\s*]*(?:oxlint-(?:disable|enable)|eslint-(?:disable|enable)|@ts-(?:expect-error|ignore|nocheck|check)|fallow-ignore|Stryker (?:disable|restore)|istanbul ignore|[vc]8 ignore|@vite-ignore|[#@]__PURE__|@vitest-environment|@jsxImportSource|@type\s*\{|\/\s*<reference\b|gitleaks:allow|SAFETY\s*:\s*\S)/u;

export const isDirective = (comment: SourceComment): boolean =>
  comment.type === "Shebang" || DIRECTIVE_PATTERN.test(comment.value);
