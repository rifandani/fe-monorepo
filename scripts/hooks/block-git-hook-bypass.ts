import { text } from "node:stream/consumers";

import { answerHook } from "./hook-answer.ts";

const answer = answerHook(await text(process.stdin));

process.stdout.write(answer.stdout);

process.stderr.write(answer.stderr);

process.exitCode = answer.exitCode;
