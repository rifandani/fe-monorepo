/* oxlint-disable typescript/no-empty-interface typescript/no-empty-object-type */
import { defaultConfig } from "@tamagui/config/v4";
import { createTamagui } from "tamagui";

const config = createTamagui(defaultConfig);

type Conf = typeof config;

declare module "tamagui" {
  interface TamaguiCustomConfig extends Conf {}
}

export default config;
