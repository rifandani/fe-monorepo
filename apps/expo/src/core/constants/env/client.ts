import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const ENV_CLIENT = createEnv({
  client: {
    EXPO_PUBLIC_API_BASE_URL: z.url(),
  },
  clientPrefix: "EXPO_PUBLIC_",
  runtimeEnv: process.env,
});
