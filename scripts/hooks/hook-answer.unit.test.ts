import { describe, expect, it } from "vitest";

import { HOOK_BYPASS_REASON } from "./git-hook-policy.ts";
import { answerHook } from "./hook-answer.ts";

const toolCall = (command: string) =>
  JSON.stringify({ tool_input: { command }, tool_name: "Bash" });

const shellCall = (command: string) =>
  JSON.stringify({ command, hook_event_name: "beforeShellExecution" });

describe(answerHook, () => {
  it("should let a Claude Code or Codex tool call run when it keeps the hooks", () => {
    const result = answerHook(toolCall("git commit -m 'feat: x'"));

    expect(result).toStrictEqual({ exitCode: 0, stderr: "", stdout: "" });
  });

  it("should stop a Claude Code or Codex tool call with exit code 2 and the reason", () => {
    const result = answerHook(toolCall("git commit --no-verify -m wip"));

    expect(result).toStrictEqual({
      exitCode: 2,
      stderr: `${HOOK_BYPASS_REASON}\n`,
      stdout: "",
    });
  });

  it("should allow a Cursor shell command that keeps the hooks", () => {
    const result = answerHook(shellCall("git push"));

    expect(JSON.parse(result.stdout)).toStrictEqual({ permission: "allow" });
  });

  it("should deny a Cursor shell command that skips the hooks", () => {
    const result = answerHook(shellCall("HUSKY=0 git push"));

    expect(JSON.parse(result.stdout)).toStrictEqual({
      agent_message: HOOK_BYPASS_REASON,
      permission: "deny",
      user_message: HOOK_BYPASS_REASON,
    });
  });

  it.each(["", "not json", "[]", '{"command":1}'])(
    "should fail open on the unreadable payload %j",
    (raw) => {
      const result = answerHook(raw);

      expect(result.exitCode).toBe(0);
    }
  );
});
