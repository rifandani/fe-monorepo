import url from 'node:url'
import antfu from '@antfu/eslint-config'
import { fixupConfigRules } from '@eslint/compat'
import { FlatCompat } from '@eslint/eslintrc'
import pluginRouter from '@tanstack/eslint-plugin-router'
import depend from 'eslint-plugin-depend'
import expoPlugin from 'eslint-plugin-expo'
import jsxA11y from 'eslint-plugin-jsx-a11y'
// import tailwind from 'eslint-plugin-tailwindcss'
import globals from 'globals'

const __dirname = url.fileURLToPath(new URL('apps/web', import.meta.url))
const flatCompat = new FlatCompat({
  baseDirectory: __dirname, // optional; default: process.cwd()
  resolvePluginsRelativeTo: __dirname, // optional
})
const [nextRecommended, nextCoreWebVitals] = fixupConfigRules(flatCompat.extends('plugin:@next/next/core-web-vitals'))

export default antfu(
  {
    name: 'fe-monorepo/global',

    // Type of the project. 'lib' for libraries, the default is 'app'
    type: 'app',

    isInEditor: false,

    // Enable stylistic formatting rules
    stylistic: true,

    formatters: {
      /**
       * Format CSS, LESS, SCSS files, also the `<style>` blocks in Vue
       * By default uses Prettier
       */
      css: true,
      /**
       * Format HTML files
       * By default uses Prettier
       */
      html: true,
      svg: true,
      xml: true,
      /**
       * Format Markdown files
       * Supports Prettier and dprint
       * By default uses Prettier
       */
      markdown: 'prettier',
    },

    typescript: true,
    vue: false,
    react: true,
    jsonc: true,
    yaml: false,

    rules: {
      'node/prefer-global/process': 'off',
      'react-refresh/only-export-components': 'off',
    },

    // `.eslintignore` is no longer supported in Flat config, use `ignores` instead
    ignores: [
      '**/fixtures',
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/out/**',
      '**/coverage/**',
      '**/__mocks__/**',
      '**/.next/**',
      '**/.expo/**',
      '**/android/**',
      '**/ios/**',
      '**/.react-router/**',
      '**/jest.config.js',
      '**/tailwind.config.js',
      '**/routeTree.gen.ts',
      '**/*.queries.ts',
      '.vscode/**',
      '.husky/**',
      'babel.config.js',
      'commitlint.config.js',
    ],
  },
  // From the second arguments they are ESLint Flat Configs. You can have multiple configs
  {
    files: ['**/*.{jsx,tsx,mtsx}'],
    ...jsxA11y.flatConfigs.recommended,
    languageOptions: {
      ...jsxA11y.flatConfigs.recommended.languageOptions,
      globals: {
        ...globals.serviceworker,
        ...globals.browser,
      },
    },
  },
  {
    name: 'e18e/depend',
    files: ['**/*.{js,mjs,cjs,jsx,mjsx,ts,tsx,mtsx}'],
    ...depend.configs['flat/recommended'],
  },
  // FIXME: v4 not yet supported: https://github.com/francoismassart/eslint-plugin-tailwindcss/pull/381
  // tailwind.configs['flat/recommended'][0],
  // {
  //   name: 'tailwindcss:rules',
  //   rules: {
  //     ...tailwind.configs['flat/recommended'][1].rules,
  //     'tailwindcss/no-custom-classname': 'off',
  //   },
  // },
  {
    name: 'tailwindcss:settings',
    settings: {
      tailwindcss: {
        callees: ['classnames', 'clsx', 'ctl', 'cn', 'twMerge', 'twJoin'],
      },
    },
  },
  {
    name: 'next/recommended',
    files: ['apps/web/*.{js,mjs,cjs,jsx,mjsx,ts,tsx,mtsx}'],
    ...nextRecommended,
  },
  {
    name: 'next/core-web-vitals',
    files: ['apps/web/*.{js,mjs,cjs,jsx,mjsx,ts,tsx,mtsx}'],
    ...nextCoreWebVitals,
  },
  {
    name: 'web/overrides',
    files: ['apps/web/*.{js,mjs,cjs,jsx,mjsx,ts,tsx,mtsx}'],
    rules: {
      // Consistently import locale from `next-intl`
      'no-restricted-imports': [
        'error',
        {
          name: 'react-aria',
          importNames: ['useLocale'],
          message: 'Please import from `next-intl` instead.',
        },
      ],
    },
  },
  {
    name: '@tanstack/router',
    files: ['apps/spa/*.{ts,tsx}'],
    ...pluginRouter.configs['flat/recommended'][0],
  },
  /**
   * we are not using full `eslint-config-expo`, cause it contains already implemented plugins for react, typescript, etc.
   * instead we are using only expo-specific config
   * link: https://github.com/expo/expo/blob/main/packages/eslint-config-expo/flat/utils/expo.js
   */
  {
    name: 'expo/config',
    files: ['apps/expo/*.{ts,tsx}'],
    plugins: {
      expo: expoPlugin,
    },
    rules: {
      'expo/no-env-var-destructuring': ['error'],
      'expo/no-dynamic-env-var': ['error'],
    },
  },
  {
    name: 'expo/metro',
    files: ['apps/expo/metro.config.js'],
    languageOptions: {
      globals: globals.node,
    },
  },
)
