// fallow-ignore-file unused-file
import { Schema } from "effect";

const envServerSchema = Schema.Struct({
  APP_VARIANT: Schema.NonEmptyString,
});

export const ENV_SERVER = Schema.decodeUnknownSync(envServerSchema)({
  APP_VARIANT: process.env.APP_VARIANT,
});
