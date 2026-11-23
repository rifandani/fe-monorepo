import { Option, Schema } from "effect";

import { HOOK_BYPASS_REASON, skipsHooks } from "./git-hook-policy.ts";

const Payload = Schema.Struct({
  command: Schema.optional(Schema.String),
  tool_input: Schema.optional(
    Schema.Struct({ command: Schema.optional(Schema.String) })
  ),
});

const decodePayload = Schema.decodeUnknownOption(
  Schema.fromJsonString(Payload)
);

export interface HookAnswer {
  readonly exitCode: number;
  readonly stderr: string;
  readonly stdout: string;
}

export const answerHook = (raw: string): HookAnswer => {
  const payload = Option.getOrUndefined(decodePayload(raw));
  const toolCommand = payload?.tool_input?.command;
  const shellCommand = payload?.command;

  if (toolCommand !== undefined) {
    return skipsHooks(toolCommand)
      ? { exitCode: 2, stderr: `${HOOK_BYPASS_REASON}\n`, stdout: "" }
      : { exitCode: 0, stderr: "", stdout: "" };
  }

  const blocked = shellCommand !== undefined && skipsHooks(shellCommand);

  const decision = blocked
    ? {
        agent_message: HOOK_BYPASS_REASON,
        permission: "deny",
        user_message: HOOK_BYPASS_REASON,
      }
    : { permission: "allow" };

  return { exitCode: 0, stderr: "", stdout: `${JSON.stringify(decision)}\n` };
};
