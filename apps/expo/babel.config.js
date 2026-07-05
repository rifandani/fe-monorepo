// run `dev:clean` everytime babel config changes, to clear bundler cache
/** @type {import('@babel/core').ConfigFunction} */
// oxlint-disable-next-line unicorn/prefer-module
module.exports = function exports(api) {
  api.cache(true);

  return {
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
};
