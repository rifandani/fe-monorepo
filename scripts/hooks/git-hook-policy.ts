export const HOOK_BYPASS_REASON =
  "Blocked hook bypass: this command skips or disables the Git hooks. The husky pre-commit hook runs `bun lint:fix` and `bun check:fix`, and every commit must pass it. Fix: remove the bypass (`--no-verify`, `git commit -n`, `HUSKY=0`, a `core.hooksPath` change, or a write under `.git/hooks` or `.husky/_`), read the hook output, and fix the failure. Ask the owner before you change `.husky/`.";

interface Token {
  readonly text: string;
  readonly assignable: boolean;
  readonly redirect: boolean;
}

type Segment = readonly Token[];

const PIECE =
  /'(?<single>[^']*)'?|"(?<double>(?:\\[\s\S]|[^"\\])*)"?|\\(?<escaped>[\s\S])|(?<redirect>>>|>\||>)|(?<separator>[;&|()`\n])|(?<space>[^\S\n]+)|(?<bare>[^\s'"\\;&|()`>]+)/gu;

const ASSIGNMENT = /^[A-Za-z_]\w*=/u;

const SHELLS = new Set(["bash", "dash", "ksh", "sh", "zsh"]);

const WRAPPERS = new Set([
  "command",
  "env",
  "exec",
  "nohup",
  "proxy",
  "rtk",
  "sudo",
  "time",
]);

const HOOK_READERS = new Set([
  "[",
  "bat",
  "cat",
  "diff",
  "echo",
  "file",
  "git",
  "grep",
  "head",
  "less",
  "ls",
  "more",
  "printf",
  "rg",
  "stat",
  "tail",
  "test",
  "tree",
  "wc",
]);

const HOOK_PATHS = [".git/hooks", ".husky/_"];

const GIT_GLOBALS_WITH_VALUE = new Set([
  "--exec-path",
  "--git-dir",
  "--namespace",
  "--super-prefix",
  "--work-tree",
  "-C",
]);

const COMMIT_SHORT_WITH_VALUE = new Set(["C", "F", "c", "m", "t"]);

const COMMIT_LONG_WITH_VALUE = new Set([
  "--author",
  "--cleanup",
  "--date",
  "--file",
  "--fixup",
  "--message",
  "--pathspec-from-file",
  "--reedit-message",
  "--reuse-message",
  "--squash",
  "--template",
  "--trailer",
]);

const CONFIG_READS = new Set([
  "--get",
  "--get-all",
  "--get-regexp",
  "--list",
  "--show-origin",
  "-l",
  "get",
  "list",
]);

const CONFIG_UNSETS = new Set(["--unset", "--unset-all", "unset"]);

const NO_VERIFY = "--no-verify";

const NO_VERIFY_SHORTEST_PREFIX = "--no-veri".length;

const unescapeDouble = (text: string) =>
  text.replaceAll(/\\(?<char>[\s\S])/gu, "$<char>");

const pieceText = (groups: Partial<Record<string, string>>) =>
  groups.single ??
  (groups.double === undefined ? undefined : unescapeDouble(groups.double)) ??
  groups.escaped ??
  groups.bare ??
  "";

export const segmentsOf = (command: string): Segment[] => {
  const segments: Token[][] = [[]];
  let word: { text: string; assignable: boolean } | undefined;

  const current = () => segments.at(-1) ?? [];

  const flush = () => {
    if (word !== undefined) {
      current().push({ ...word, redirect: false });
      word = undefined;
    }
  };

  for (const { groups = {} } of command.matchAll(PIECE)) {
    if (groups.separator !== undefined) {
      flush();
      segments.push([]);
    } else if (groups.space !== undefined) {
      flush();
    } else if (groups.redirect === undefined) {
      word = {
        assignable: word?.assignable ?? groups.bare !== undefined,
        text: (word?.text ?? "") + pieceText(groups),
      };
    } else {
      flush();
      current().push({
        assignable: false,
        redirect: true,
        text: groups.redirect,
      });
    }
  }

  flush();

  return segments.filter((segment) => segment.length > 0);
};

const basename = (word: string) => word.slice(word.lastIndexOf("/") + 1);

const disablesHooks = (token: Token) =>
  token.assignable &&
  ASSIGNMENT.test(token.text) &&
  token.text.split("=")[0] === "HUSKY" &&
  token.text.slice("HUSKY=".length).trim() === "0";

const isPrefix = (token: Token) =>
  (token.assignable && ASSIGNMENT.test(token.text)) ||
  WRAPPERS.has(basename(token.text));

const programWords = (segment: Segment) => {
  const words = segment.filter((token) => !token.redirect);
  const start = words.findIndex((token) => !isPrefix(token));

  return start === -1 ? [] : words.slice(start).map((token) => token.text);
};

const isNoVerify = (arg: string) =>
  arg.length >= NO_VERIFY_SHORTEST_PREFIX && NO_VERIFY.startsWith(arg);

const setsHooksPath = (setting: string) =>
  setting.split("=")[0]?.trim().toLowerCase() === "core.hookspath";

const shortFlagsSkipHooks = (arg: string) => {
  for (const flag of arg.slice(1)) {
    if (flag === "n") {
      return { skips: true, takesValue: false };
    }

    if (COMMIT_SHORT_WITH_VALUE.has(flag)) {
      return { skips: false, takesValue: arg.endsWith(flag) };
    }
  }

  return { skips: false, takesValue: false };
};

const commitSkipsHooks = (args: readonly string[]) => {
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index] ?? "";

    if (arg === "--") {
      return false;
    }

    if (isNoVerify(arg)) {
      return true;
    }

    if (COMMIT_LONG_WITH_VALUE.has(arg)) {
      index += 1;
    } else if (/^-[^-]/u.test(arg)) {
      const { skips, takesValue } = shortFlagsSkipHooks(arg);

      if (skips) {
        return true;
      }

      index += takesValue ? 1 : 0;
    }
  }

  return false;
};

const configWritesHooksPath = (args: readonly string[]) => {
  const key = args.findIndex(setsHooksPath);

  if (key === -1 || args.some((arg) => CONFIG_READS.has(arg))) {
    return false;
  }

  return (
    args[key]?.includes("=") === true ||
    key < args.length - 1 ||
    args.some((arg) => CONFIG_UNSETS.has(arg))
  );
};

const inlineConfig = (option: string, next: string) => {
  if (option === "-c") {
    return { setting: next, width: 2 };
  }

  if (option.startsWith("--config-env=")) {
    return { setting: option.slice("--config-env=".length), width: 1 };
  }

  if (option.startsWith("-c")) {
    return { setting: option.slice(2), width: 1 };
  }

  return { setting: "", width: GIT_GLOBALS_WITH_VALUE.has(option) ? 2 : 1 };
};

const gitSkipsHooks = (args: readonly string[]) => {
  let index = 0;

  while (args[index]?.startsWith("-") === true) {
    const { setting, width } = inlineConfig(
      args[index] ?? "",
      args[index + 1] ?? ""
    );

    if (setsHooksPath(setting)) {
      return true;
    }

    index += width;
  }

  const [subcommand = "", ...rest] = args.slice(index);

  if (subcommand === "commit") {
    return commitSkipsHooks(rest);
  }

  if (subcommand === "config") {
    return configWritesHooksPath(rest);
  }

  return rest.some(isNoVerify);
};

const touchesHookPath = (segment: Segment) => {
  const program = basename(programWords(segment)[0] ?? "");

  return segment.some(
    (token, index) =>
      !token.redirect &&
      HOOK_PATHS.some((path) => token.text.includes(path)) &&
      (segment[index - 1]?.redirect === true || !HOOK_READERS.has(program))
  );
};

const nestedScript = (args: readonly string[]) => {
  const flag = args.findIndex((arg) => /^-[a-z]*c[a-z]*$/u.test(arg));

  return flag === -1 ? "" : (args[flag + 1] ?? "");
};

const segmentSkipsHooks = (
  segment: Segment,
  nested: (command: string) => boolean
) => {
  const words = segment.filter((token) => !token.redirect);
  const start = words.findIndex((token) => !isPrefix(token));
  const prefixes = start === -1 ? words : words.slice(0, start);

  if (prefixes.some(disablesHooks) || touchesHookPath(segment)) {
    return true;
  }

  const [program = "", ...args] = programWords(segment);
  const name = basename(program);

  if (name === "export") {
    return words.slice(start + 1).some(disablesHooks);
  }

  if (name === "git") {
    return gitSkipsHooks(args);
  }

  if (name === "eval") {
    return nested(args.join(" "));
  }

  return SHELLS.has(name) && nested(nestedScript(args));
};

export const skipsHooks = (command: string): boolean =>
  segmentsOf(command).some((segment) => segmentSkipsHooks(segment, skipsHooks));
