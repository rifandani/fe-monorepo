/* oxlint-disable unicorn/prefer-module */
// run `dev:clean` everytime babel config changes, to clear bundler cache
// A static object config is cached forever, the same as `api.cache(true)`.
module.exports = {
  plugins: [
    "react-native-reanimated/plugin",
    "@tamagui/babel-plugin",
    // {
    //   components: ['tamagui'],
    //   config: './tamagui.config.ts',
    //   logTimings: true,
    //   disableExtraction: process.env.NODE_ENV === 'development',
    // },
  ],
  presets: ["babel-preset-expo"],
};
