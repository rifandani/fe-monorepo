import { defaultConfig } from '@tamagui/config/v4';
import { createTamagui } from 'tamagui';

// see the source code for more information of the built-in config
const config = createTamagui(defaultConfig);

// this makes typescript properly type everything based on the config
type Conf = typeof config;
declare module 'tamagui' {
  interface TamaguiCustomConfig extends Conf {}
}

export default config;
