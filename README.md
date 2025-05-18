# Frontend React Monorepo

### Todo

- [ ] Make sure CI/CD works
- [ ] Consider using changesets for monorepo versioning

### Upgrading Dependencies

- Remember to always use EXACT version for each dependency
- Run `bun outdated` to check for outdated dependencies in root and run `bun upgrade --latest` to upgrade all dependencies in root to the latest version
- Run `bun outdated --cwd packages/core` to check for outdated dependencies and run `bun upgrade --latest --cwd packages/core` to upgrade all dependencies to the latest version
- Run `bun outdated --cwd apps/web` to check for outdated dependencies and run `bun upgrade --latest --cwd apps/web` to upgrade all dependencies to the latest version
- Run `bun outdated --cwd apps/spa` to check for outdated dependencies and run `bun upgrade --latest --cwd apps/spa` to upgrade all dependencies to the latest version
- To upgrade expo app, it's better to follow the steps in "How to upgrade?" section below
- If there's MINOR upgrade in `playwright`, run `bun spa:test:install` to install new version of chromium
- Run `bun web:test` and `bun spa:test` to tests (expo is not ready yet)
- Run `bun web:build` and `bun spa:build` to build (expo is not ready yet)
- Run `bun lint-typecheck` for regression

## @workspace/web

### Note

- we don't use `@vercel/otel` because it needs a third party service to setup (e.g. sentry, datadog, langwatch, langfuse)

### Todo

- [ ] sitemap.txt still does not work when we run `bun web:build`

## @workspace/expo

### Fixme

- [ ] running `bun android` failed because of: (might be related to `peerDependencies` in `@workspace/core` package)

```bash
ERROR  Warning: Error: Incompatible React versions: The "react" and "react-native-renderer" packages must have the exact same version. Instead got:
│   - react:                  19.1.0
│   - react-native-renderer:  19.0.0
```

- [x] `Invalid hook call. Hooks can only be called inside of the body of a function component. Call Stack - AppI18nProvider (apps/expo/src/core/providers/i18n/provider.tsx:49:43)`. Resolved by not preserving the original code in `metro.config.js`
- [x] running `bun build:android:dev:local` successfully created a development build, but failed when running `bun dev` (`ERROR  Warning: TypeError: Cannot convert undefined value to object. Call Stack - CheckAuthWrapper (apps/expo/src/core/components/check-auth-wrapper.tsx:7:44)`). Resolved by not using `BaseSpinner` component, instead using `Spinner` component from `tamagui`
- [x] `Unable to resolve "react" from "apps/expo/src/app/[...unmatched].tsx"`. Resolved by removing `node_modules` folder inside `apps/expo`

### Todo

- [ ] test a multi-environment build -> development/production
- [ ] test on iOS and update README to also mention iOS after all to-do items are resolved
- [ ] consider using new expo-router [protected route guard](https://docs.expo.dev/router/advanced/protected/)

### Prerequisite

[Expo reference](https://docs.expo.dev/get-started/set-up-your-environment/) or [React Native reference](https://reactnative.dev/docs/set-up-your-environment).

- Node 22+
- Java 17+
- Install EAS CLI globally using `npm i -g eas-cli`
- **Don't use VPN**, or `fetch` will not work

### How to upgrade?

If there are any new versions of Expo SDK, please check the corresponding changelog first (refer to the "Deprecations, renamings, and removals" section above for breaking changes that are most likely to impact our app), most of the time here's how to upgrade the app to the next versions:

```bash
# Upgrade all dependencies to match Expo SDK 53
$ npx expo install expo@^53.0.0 --fix

# Check for any possible known issues
$ bun expo doctor

# Next, in `eas.json` file, update `cli.version` to the new version of `eas-cli` global package
# Next, upgrade xcode / android studio if needed
# Next, run `bun run prebuild` to regenerate native project (android and ios folders)
# Next, run `bun build:android:dev:local` to create a development build
```

### Development

Every single time you change the `app.json` file / install native libraries, you need to re-generate native project (CNG) using:

```bash
# cd into the expo directory (this is for better terminal logging)
$ cd apps/expo

# regenerate native project from scratch, then create a development build
$ bun prebuild && bun build:android:dev:local

# or, for ios
$ bun prebuild && bun build:ios:dev:sim
```

After that, install the app to your android device/simulator and start the app:

```bash
# run the app
$ bun start:dev
```

Or, we can straight forward doing prebuild -> create a development build -> runs the app on connected android device/simulator, all at once with single command:

```bash
# uninstall the app from the device/simulator if it's installed,
# then prebuild + build:android:dev:local + install the app to the device/simulator
$ bun android

# or, for ios
$ bun ios
```

### Build

There are 2 main target build, android and ios. For further details, please check `eas.json` file.

> Every env requires different keystores, because it counts as different app id

```bash
# kickoff EAS build for android
$ bun build:android:dev

# kickoff EAS build for ios (EAS will prompt us our Apple Developer account credentials)
$ bun build:ios:dev
```

If you want to opt-out of EAS cloud build, you can [run the build locally](https://docs.expo.dev/build-reference/local-builds/).

> As of Expo SDK 50, you need to have Java 17 installed in your device to build android

```bash
# this will create a .apk file in the root directory
$ bun build:android:dev:local

# for ios device
$ bun build:ios:dev:local

# this will create a .tar.gz file in the root directory (for ios simulator)
$ bun build:ios:dev:sim
```

If we run `bun build:ios:dev:sim`, you will get a `build-*.tar.gz` file. We can't just drag it to the simulator, because it's not a valid app file. To install the app to the iOS simulator:

```bash
# this will extract the `build-*.tar.gz` file into /tmp/fe-monorepo-expo folder and install the app to the iOS simulator
$ bun ios:install:sim
```

### Analyze Bundle Size

```bash
# analyze bundle size mimicking the production build
$ bun analyze
```

This will start the dev server. Click `shift+m` on the terminal and choos to open expo-atlas. This will open a new tab on the browser.

### Testing

End to end testing is done with maestro. Follow their [installation steps](https://docs.maestro.dev/getting-started/installing-maestro) to install maestro CLI. We can't run test on regular CI like github actions, because we need to have a physical device/simulator to run the test.

> Note: At the moment, Maestro does not support physical iOS devices

```bash
# run end to end test on development variant
bun test:dev

# run end to end test on production variant
bun test:prod
```

To help us write and debug Maestro Flows better, we can open Maestro Studio.

```bash
# DO NOT run this and `bun run test:dev` at the same time, it will cause "(Unable to launch app com.rifandani.expoapp.development: null)"
# open Maestro Studio in http://localhost:9999/interact
bun test:ui
```

### Deployment

Coming Soon
