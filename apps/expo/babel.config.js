// run `dev:clean` everytime babel config changes, to clear bundler cache
/** @type {import('@babel/core').ConfigFunction} */
export default function babelConfig(api) {
  api.cache(true);
  return {
    plugins: ["react-native-reanimated/plugin", "@tamagui/babel-plugin"],
    presets: ["babel-preset-expo"],
  };
}
