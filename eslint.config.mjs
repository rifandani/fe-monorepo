import antfu from '@antfu/eslint-config'
import nextPlugin from '@next/eslint-plugin-next'
import pluginRouter from '@tanstack/eslint-plugin-router'
// import eslintPluginBetterTailwindcss from 'eslint-plugin-better-tailwindcss'
import depend from 'eslint-plugin-depend'
import expoPlugin from 'eslint-plugin-expo'
import globals from 'globals'

/**
 * FIXME: Can't resolve 'tailwindcss/package.json'
 */
// function getBetterTailwindConfig(appName) {
//   return {
//     name: `better-tailwindcss:${appName}`,
//     files: [`apps/${appName}/**/*.{jsx,tsx}`],
//     languageOptions: {
//       parserOptions: {
//         ecmaFeatures: {
//           jsx: true,
//         },
//       },
//     },
//     plugins: {
//       'better-tailwindcss': eslintPluginBetterTailwindcss,
//     },
//     rules: {
//       // enable all recommended rules to report a warning
//       ...eslintPluginBetterTailwindcss.configs['recommended-warn'].rules,
//       // enable all recommended rules to report an error
//       ...eslintPluginBetterTailwindcss.configs['recommended-error'].rules,

//       // or configure rules individually
//       'better-tailwindcss/no-unregistered-classes': ['warn'],
//     },
//     // it already handle the default callees (clsx, ctl, cva, cx, cn, twMerge, twJoin)
//     settings: {
//       'better-tailwindcss': {
//         entryPoint: `./apps/${appName}/src/core/styles/globals.css`,
//       },
//     },
//   }
// }

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
    jsx: {
      a11y: true,
    },
    vue: false,
    react: true,
    jsonc: true,
    yaml: false,

    rules: {
      'node/prefer-global/process': 'off',
      'react-refresh/only-export-components': 'off',
      'perfectionist/sort-imports': ['error', {
        // partitionByNewLine: true,
        groups: [
          'side-effect',
          'type',
          ['parent-type', 'sibling-type', 'index-type', 'internal-type'],
          'builtin',
          'external',
          'internal',
          ['parent', 'sibling', 'index'],
          'object',
          'unknown',
        ],
        newlinesBetween: 'ignore',
        order: 'asc',
        type: 'natural',
      }],
    },

    ignores: [
      '**/fixtures',
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/out/**',
      '**/migrations/**',
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
      '.github/chatmodes/**',
      '.cursor/commands/**',
      '.agents/skills/**',
      '.husky/**',
      'babel.config.js',
      'commitlint.config.js',
    ],
  },
  // From the second arguments they are ESLint Flat Configs. You can have multiple configs
  {
    name: 'e18e/depend',
    files: ['**/*.{js,mjs,cjs,jsx,mjsx,ts,tsx,mtsx}'],
    ...depend.configs['flat/recommended'],
  },
  // getBetterTailwindConfig('web'),
  // getBetterTailwindConfig('spa'),
  {
    files: ['apps/web/*.{js,mjs,cjs,jsx,mjsx,ts,tsx,mtsx}'],
    ...nextPlugin.configs.recommended,
    settings: {
      ...nextPlugin.configs.recommended.settings,
      next: {
        rootDir: './apps/web',
      },
    },
  },
  {
    files: ['apps/web/*.{js,mjs,cjs,jsx,mjsx,ts,tsx,mtsx}'],
    ...nextPlugin.configs['core-web-vitals'],
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
