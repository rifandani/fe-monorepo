# @workspace/expo

## 🔧 Fixme

- [ ] Can not open preview build on Android device & simulator. Maybe try to use only 1 route first.
- [ ] `Error: Unable to parse color from object: {"dynamic":{"dark":"hsla(0, 0%, 100%, 1)","light":"hsla(0, 0%, 9%, 1)"}}`. Error occurs only on iOS simulator. Resolved by deleting `(authed)/(tabs)/_layout.tsx` and `useCheckAuth`, and use `Stack.Protected` instead. Happens again on 19 May 2025.
- [x] `Invalid hook call. Hooks can only be called inside of the body of a function component. Call Stack - AppI18nProvider (apps/expo/src/core/providers/i18n/provider.tsx:49:43)`. Resolved by not preserving the original code in `metro.config.js`
- [x] running `bun build:android:dev:local` successfully created a development build, but failed when running `bun dev` (`ERROR  Warning: TypeError: Cannot convert undefined value to object. Call Stack - CheckAuthWrapper (apps/expo/src/core/components/check-auth-wrapper.tsx:7:44)`). Resolved by not using `BaseSpinner` component, instead using `Spinner` component from `tamagui`
- [x] `Unable to resolve "react" from "apps/expo/src/app/[...unmatched].tsx"`. Resolved by removing `node_modules` folder inside `apps/expo`

## 🎯 Todo

- [ ] Use our own i18n library from `@workspace/core` instead of `i18next`
- [ ] Use `expo-secure-store` to store sensitive data in android keystore or ios keychain instead of encrypted `mmkv`
- [ ] [EAS insights](https://docs.expo.dev/eas-insights/introduction/)
- [ ] [EAS submit](https://docs.expo.dev/submit/introduction/)
- [ ] [EAS metadata](https://docs.expo.dev/eas/metadata/)
- [ ] Otel for observability
- [ ] Feature flags

## 📦 Prerequisite

- Java 17+ (as of Expo SDK 50)
- Install EAS CLI globally using `npm i -g eas-cli`
- **Don't use VPN**, or `fetch` will not work

> References:
>
> - [Expo](https://docs.expo.dev/get-started/set-up-your-environment/)
> - [React Native](https://reactnative.dev/docs/set-up-your-environment)

### Setup EAS

> Full list of [EAS CLI commands](https://github.com/expo/eas-cli/blob/main/packages/eas-cli/README.md)

```bash
# setup EAS CLI autocomplete
eas autocomplete zsh # then, follow the instructions
```

```bash
# login into EAS account
eas login # then, follow the instructions
```

```bash
# init a new EAS project (this will create a `extra.eas.projectId` and also project slug)
eas init
```

### Environment Variables

> The source of truth is the EAS project env, so the process is whenever we change the EAS project env / when we want to change the app environment, we need to pull EAS project env to our local env files, not the other way around (we change our local env files, then we run `eas env:push` to update the EAS project env)

- `.env.local.example` is just an example to show the available env variables, it's not used in any possible way
- Set EAS project env from the dashboard, with key `APP_VARIANT` with value `development`, `preview`, or `production`, and `EXPO_PUBLIC_APP_VARIANT` with value `https://dummyjson.com`
- Pull EAS project env into local env every time you want to change the app environment by running `bun env:pull:dev`, `bun env:pull:preview`, or `bun env:pull:prod`

## ♻️ How to upgrade?

If there are any new versions of Expo SDK, please check the corresponding changelog first (refer to the "Deprecations, renamings, and removals" section above for breaking changes that are most likely to impact our app), most of the time here's how to upgrade the app to the next versions:

```bash
# Upgrade all dependencies to match Expo SDK 53
npx expo install expo@^53.0.0 --fix

# Check for any possible known issues
bun expo doctor

# Next, in `eas.json` file, update `cli.version` to the new version of `eas-cli` global package
# Next, upgrade xcode / android studio if needed
# Next, run `bun run prebuild` to regenerate native project (android and ios folders)
# Next, run `bun build:android:dev:local` or `bun build:ios:dev-sim:local` to create a local development build
```

## 💻 Development

Every single time you change the `app.json` file / install native libraries, you need to re-generate native project (CNG) using:

```bash
# cd into the expo directory (this is for better terminal logging)
cd apps/expo

# regenerate native project from scratch, then create a development build
bun prebuild && bun build:android:dev:local
bun prebuild && bun build:ios:dev-sim:local # for ios simulator
```

After that, install the app to your android device/simulator and start the app:

```bash
# run the app
bun start:dev
```

Or, we can straight forward doing prebuild -> create a development build -> runs the app on connected android device/simulator, all at once with single command:

```bash
# uninstall the app from the device/simulator if it's installed
adb uninstall com.rifandani.expoapp.development # or .preview or .production
xcrun simctl uninstall booted com.rifandani.expoapp.development # or .preview or .production

# prebuild + create development build + install the app to the device/simulator
bun android
bun ios # for ios simulator
```

Everytime we change the app icon, we need to clean re-build the app.

```bash
# clean re-build the app
bun prebuild
```

## 🔨 Build

### Development Build

Development Build requires a "development build" app and a development server to be running. There are 2 build profiles, `development` and `development-simulator`. For further details, please check `eas.json` file.

> Every env requires different keystores, because it counts as different app id

```bash
# kickoff EAS build for android
bun build:android:dev

# kickoff EAS build for ios (iphone device)
# requirements: https://docs.expo.dev/tutorial/eas/ios-development-build-for-devices/
# - Apple Developer Account (paid $99/year) credentials for signing the app as each build needs to be signed to verify that the app comes from a trusted source
# - Developer Mode activated on iOS 16 and higher. https://docs.expo.dev/guides/ios-developer-mode/
bun build:ios:dev
```

If you want to opt-out of EAS cloud build, you can [run the build locally](https://docs.expo.dev/build-reference/local-builds/).

```bash
# this will create a .apk file in the root directory
bun build:android:dev:local

# this will create a .tar.gz file in the root directory
bun build:ios:dev:local # for ios device (requires apple developer account)
bun build:ios:dev-sim:local # for ios simulator
```

If we run `bun build:ios:dev-sim:local`, you will get a `build-*.tar.gz` file. We can't just drag it to the simulator, because it's not a valid app file. To install the app to the iOS simulator:

```bash
# this will extract the `build-*.tar.gz` file into /tmp/fe-monorepo-expo folder and install the app to the iOS simulator
bun ios:sim:install
```

### Preview Build

This build often referred as "internal distribution" which can be distributed to Google Play Beta (android) and TestFlight (iOS). [Reference](https://docs.expo.dev/tutorial/eas/internal-distribution-builds/).

```bash
# kickoff EAS build for android
bun build:android:preview

# kickoff EAS build for ios (iphone device, requires apple developer account)
bun build:ios:preview
```

If you want to opt-out of EAS cloud build, you can run the build locally.

```bash
# this will create a .apk file in the root directory
bun build:android:preview:local

# this will create a .app file in the root directory (can't be installed directly on ios device)
bun build:ios:preview:local # (iphone device, requires apple developer account)
```

### Production Build

Production builds must be installed through their respective app stores. They cannot be installed directly on your Android Emulator or device, or iOS Simulator or device.

A production Android build has a `.aab` format which is optimized for distribution on the Google Play Store. Unlike `.apk` builds, `.aab` files can only be distributed and installed through the Google Play Store.

A production iOS build is optimized for Apple's App Store Connect, which allows distributing builds to testers with TestFlight and public end users through the App Store. This build type cannot be side-loaded on a simulator or device and can only be distributed through App Store Connect.

```bash
# kickoff EAS build for android
bun build:android:prod

# kickoff EAS build for ios (requires apple developer account)
bun build:ios:prod
```

If you want to opt-out of EAS cloud build, you can run the build locally.

```bash
# this will create a .aab file in the root directory (can't be installed directly on android emulator/device)
bun build:android:prod:local

# this will create a .ipa file in the root directory (can't be installed directly on ios simulator/device)
bun build:ios:prod:local # (requires apple developer account)
```

### Analyze Build Bundle Size

```bash
# analyze Javascript bundle size mimicking the production build
# this will start the dev server. Click `shift+m` on the terminal and choose to open expo-atlas. This will open a new tab on the browser.
bun analyze
```

## 🔄 Updates

EAS Update is a hosted service that serves updates for projects using the `expo-updates` library. Updates for own non-native pieces (such as JS, styling, and images) over-the-air (OTA).

```bash
# send OTA update to preview environment
bun update:preview

# send OTA update to production environment
bun update:prod
```

## 📨 Submission

To publish and distribute an app on the Google Play Store, we need [Google Play Developer Account, Google Service Account key, Production build profile](https://docs.expo.dev/tutorial/eas/android-production-build/). To publish and distribute an app on the Apple App Store, we need [Apple Developer account, Production build profile](https://docs.expo.dev/tutorial/eas/ios-production-build/).

[Best practices for submitting your app to the app stores](https://docs.expo.dev/distribution/app-stores/).

```bash
# submit the app to the Google Play Store
bun submit:android

# submit the app to the Apple App Store
bun submit:ios
```

[Best practices for reducing bundle size](https://docs.expo.dev/distribution/app-size/#optimizing-app-size):

- [Android](https://developer.android.com/topic/performance/reduce-apk-size)
- [iOS](https://developer.apple.com/documentation/xcode/reducing-your-app-s-size)

## 🧪 Testing

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

## ⏳ EAS Workflow

Requires the EAS project to be connected to the github repository to be able to run the workflow automatically based on push/pr events.

```bash
# run manually
eas workflow:run .eas/workflows/create-development-builds.yaml --non-interactive
```
