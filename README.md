# React Monorepo

Todo

- [ ] Make sure CI/CD works
- [ ] Maybe use changesets for monorepo versioning

Upgrading Dependencies

- Remember to always use EXACT version for each dependency
- Run `bun outdated` to check for outdated dependencies in root and run `bun upgrade --latest` to upgrade all dependencies in root to the latest version
- Run `bun outdated --cwd packages/core` to check for outdated dependencies and run `bun upgrade --latest --cwd packages/core` to upgrade all dependencies to the latest version
- Run `bun outdated --cwd apps/web` to check for outdated dependencies and run `bun upgrade --latest --cwd apps/web` to upgrade all dependencies to the latest version
- Run `bun outdated --cwd apps/spa` to check for outdated dependencies and run `bun upgrade --latest --cwd apps/spa` to upgrade all dependencies to the latest version
- Run `bun outdated --cwd apps/expo` to check for outdated dependencies and run `bun upgrade --latest --cwd apps/expo` to upgrade all dependencies to the latest version
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

### Prerequisite

- Java 17+

### How to upgrade?

If there are any new versions of Expo SDK, here's how to upgrade the app to the next versions:

```bash
# Update to the latest version of EAS CLI
$ npm i -g eas-cli

# Upgrade all dependencies to match Expo SDK 53
$ npx expo install expo@^53.0.0 --fix

# Check for any possible known issues
$ npx expo-doctor@latest

# Next, in `eas.json` file, update `cli.version` to the new version of `eas-cli` global package
# Next, upgrade xcode / android studio if needed
# Next, Delete the android and ios directories and run `bun run prebuild` again
# Next, Recreate a development build
```

### Development

Every single time you change the `app.json` file / install native libraries, you need to re-generate native project (CNG) using:

```bash
# or regenerate native project from scratch
$ bun run prebuild
```

After that, to start the app:

```bash
# Runs the app
$ bun run dev
```

### Testing

Coming Soon

### Build

To build the app, we use global `eas-cli` bun package. Install it globally as it is the recommendation from the expo team.

```bash
# install eas-cli globally
$ npm i -g eas-cli
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

### Deployment

Coming Soon
