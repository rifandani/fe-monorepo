# Application Overview

The application built with:

- `expo` react native framework with rich ecosystem and community
- `ky` + `@tanstack/react-query` -> data fetching
- `zod` -> runtime schema validation
- `react-hook-form` -> form management
- `zustand` -> performant global state
- `type-fest` -> collection of useful type helpers
- `tamagui` react native UI kit
- `react-native-mmkv` modern and fast local storage
- `@formatjs` polyfills for Intl i18n

## Get Started

Prerequisite, minimum requirements:

- Node 18+
- Java 11+

To set up the app execute the following commands:

```bash
# clone the template OR you can click "Use this template" on the github repo
$ git clone https://github.com/rifandani/expo-app.git

# cd into the app dir
$ cd expo-app

# rename the example env files
# learn more: https://docs.expo.dev/guides/environment-variables/
$ cp .env.development.local.example .env.development.local
$ cp .env.production.local.example .env.production.local

# install deps
$ bun i
```

## How to upgrade?

If there are any new versions of Expo SDK, here's how to upgrade the app to the next versions:

```bash
# Update to the latest version of EAS CLI
$ bun i -g eas-cli

# Install the new version of the Expo SDK package (e.g ^50.0.0)
$ bun install expo@^50.0.0

# Upgrade all dependencies to match Expo SDK 50
$ npx expo install --fix

# Check for any possible known issues
$ npx expo-doctor@latest

# Next, in `eas.json` file, update `cli.version` to the new version of `eas-cli` global package
# Next, upgrade xcode / android studio if needed
# Next, Recreate a development build after upgrading
```

## Development

Every single time you change the `app.json` file, install native libraries, you need to re-generate native project (CNG) using:

```bash
# Regenerate native project
$ bun run prebuild

# or regenerate native project from scratch
$ bun run prebuild:clean
```

After that, to start the app + i18n, run:

```bash
# Runs the app + i18n
$ bun run start

# or
$ bun run start:clean
```

## Testing

Coming Soon

## Build

To build the app, we use global `eas-cli` bun package. Install it globally as it is the recommendation from the expo team.

```bash
# install eas-cli globally
$ bun i -g eas-cli
```

There are 2 main target build, android and ios. For further details, please check `eas.json` file.

```bash
# build android
$ bun build:android

# build ios
$ bun build:ios
```

If you want to opt-out of EAS cloud build, you can [run the build locally](https://docs.expo.dev/build-reference/local-builds/). But first, you still need to login to EAS first OR alternatively set `EXPO_TOKEN` access token.

> As of Expo SDK 50, you need to have Java 17 installed in your device to build android

```bash
# build android locally
$ bun build:android:local

# build ios locally
$ bun build:ios:local
```

## Deployment

Coming Soon
