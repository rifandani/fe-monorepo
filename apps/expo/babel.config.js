// run `dev:clean` everytime babel config changes, to clear bundler cache
/** @type {import('@babel/core').ConfigFunction} */
module.exports = function (api) {
  api.cache(true)

  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'react-native-reanimated/plugin',
      '@tamagui/babel-plugin',
      // {
      //   components: ['tamagui'],
      //   config: './tamagui.config.ts',
      //   logTimings: true,
      //   disableExtraction: process.env.NODE_ENV === 'development',
      // },
    ],
  }
}
