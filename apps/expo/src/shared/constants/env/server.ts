// fallow-ignore-file unused-file
import { Schema } from "effect";

const envServerSchema = Schema.Struct({
  APP_VARIANT: Schema.NonEmptyString,
});

/**
 * @description Build-time env (read by `app.config.ts` in Node), decoded once.
 */
export const ENV_SERVER = Schema.decodeUnknownSync(envServerSchema)({
  APP_VARIANT: process.env.APP_VARIANT,
});
