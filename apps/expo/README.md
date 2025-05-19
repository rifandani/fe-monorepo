# @workspace/expo

## Fixme

- [x] `Error: Unable to parse color from object: {"dynamic":{"dark":"hsla(0, 0%, 100%, 1)","light":"hsla(0, 0%, 9%, 1)"}}`. Error occurs only on iOS simulator. Resolved by deleting `(authed)/(tabs)/_layout.tsx` and `useCheckAuth`, and use `Stack.Protected` instead.
- [x] `Invalid hook call. Hooks can only be called inside of the body of a function component. Call Stack - AppI18nProvider (apps/expo/src/core/providers/i18n/provider.tsx:49:43)`. Resolved by not preserving the original code in `metro.config.js`
- [x] running `bun build:android:dev:local` successfully created a development build, but failed when running `bun dev` (`ERROR  Warning: TypeError: Cannot convert undefined value to object. Call Stack - CheckAuthWrapper (apps/expo/src/core/components/check-auth-wrapper.tsx:7:44)`). Resolved by not using `BaseSpinner` component, instead using `Spinner` component from `tamagui`
- [x] `Unable to resolve "react" from "apps/expo/src/app/[...unmatched].tsx"`. Resolved by removing `node_modules` folder inside `apps/expo`

## Todo

- [ ] add a "preview" profile build, unlike "development" profile build, this do not require running a development server and "development build". This build often referred as "internal distribution" which can be distributed to Google Play Beta (android) and TestFlight (iOS).
- [ ] test on iOS and update README to also mention iOS after all to-do items are resolved
- [ ] EAS workflows, setup CI/CD
- [ ] EAS update, OTA updates, login in dev client so we can have extensions tab

## Prerequisite

[Expo reference](https://docs.expo.dev/get-started/set-up-your-environment/) or [React Native reference](https://reactnative.dev/docs/set-up-your-environment).

- Node 22+
- Java 17+ (as of Expo SDK 50)
- Install EAS CLI globally using `npm i -g eas-cli`
- **Don't use VPN**, or `fetch` will not work

### Setup EAS

```bash
# setup EAS CLI autocomplete
$ eas autocomplete zsh # then, follow the instructions
```

```bash
# login into EAS account
$ eas login # then, follow the instructions
```

```bash
# init a new EAS project (this will create a `extra.eas.projectId` and also project slug)
$ eas init
```

### Environment Variables

> The source of truth is the EAS project env, so the process is whenever we change the EAS project env / when we want to change the app environment, we need to pull EAS project env to our local env files, not the other way around (we change our local env files, then we run `eas env:push` to update the EAS project env)

- `.env.local.example` is just an example to show the available env variables, it's not used in any possible way
- Set EAS project env from the dashboard, with key `APP_VARIANT` with value `development`, `preview`, or `production`, and `EXPO_PUBLIC_APP_VARIANT` with value `https://dummyjson.com`
- Pull EAS project env into local env every time you want to change the app environment by running `bun env:pull:dev`, `bun env:pull:preview`, or `bun env:pull:prod`

## How to upgrade?

If there are any new versions of Expo SDK, please check the corresponding changelog first (refer to the "Deprecations, renamings, and removals" section above for breaking changes that are most likely to impact our app), most of the time here's how to upgrade the app to the next versions:

```bash
# Upgrade all dependencies to match Expo SDK 53
$ npx expo install expo@^53.0.0 --fix

# Check for any possible known issues
$ bun expo doctor

# Next, in `eas.json` file, update `cli.version` to the new version of `eas-cli` global package
# Next, upgrade xcode / android studio if needed
# Next, run `bun run prebuild` to regenerate native project (android and ios folders)
# Next, run `bun build:android:dev:local` or `bun build:ios:dev:sim` to create a local development build
```

## Development

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

## Development Build

Development Build requires a "development build" app and a development server to be running. There are 2 build profiles, `development` and `development-simulator`. For further details, please check `eas.json` file.

> Every env requires different keystores, because it counts as different app id

```bash
# kickoff EAS build for android
$ bun build:android:dev

# kickoff EAS build for ios (iphone device)
# requirements: https://docs.expo.dev/tutorial/eas/ios-development-build-for-devices/
# - Apple Developer Account credentials for signing the app as each build needs to be signed to verify that the app comes from a trusted source
# - Developer Mode activated on iOS 16 and higher. https://docs.expo.dev/guides/ios-developer-mode/
$ bun build:ios:dev
```

If you want to opt-out of EAS cloud build, you can [run the build locally](https://docs.expo.dev/build-reference/local-builds/).

```bash
# this will create a .apk file in the root directory
$ bun build:android:dev:local

# this will create a .tar.gz file in the root directory (for ios simulator)
$ bun build:ios:dev:sim

# for ios device
$ bun build:ios:dev:local
```

If we run `bun build:ios:dev:sim`, you will get a `build-*.tar.gz` file. We can't just drag it to the simulator, because it's not a valid app file. To install the app to the iOS simulator:

```bash
# this will extract the `build-*.tar.gz` file into /tmp/fe-monorepo-expo folder and install the app to the iOS simulator
$ bun ios:install:sim
```

## Preview Build

This build often referred as "internal distribution" which can be distributed to Google Play Beta (android) and TestFlight (iOS). [Reference](https://docs.expo.dev/tutorial/eas/internal-distribution-builds/).

```bash
# kickoff EAS build for android
$ bun build:android:preview

# kickoff EAS build for ios (iphone device)
$ bun build:ios:preview
```

If you want to opt-out of EAS cloud build, you can run the build locally.

```bash
# this will create a .apk file in the root directory
$ bun build:android:preview:local

# this will create a .app file in the root directory
$ bun build:ios:preview:local
```

## Production Build

Coming Soon

## Updates

Coming Soon

## Analyze Bundle Size

```bash
# analyze bundle size mimicking the production build
$ bun analyze
```

This will start the dev server. Click `shift+m` on the terminal and choos to open expo-atlas. This will open a new tab on the browser.

## Testing

End to end testing is done with maestro. Follow their [installation steps](https://docs.maestro.dev/getting-started/installing-maestro) to install maestro CLI. We can't run test on regular CI like github actions, because we need to have a physical device/simulator to run the test.

> Note: As of 18 May 2025, Maestro does not support physical iOS devices

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

## Submission

Coming Soon
