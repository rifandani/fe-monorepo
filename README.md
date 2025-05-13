# Frontend React Monorepo

### Todo

- [ ] Make sure CI/CD works
- [ ] Maybe use changesets for monorepo versioning

### Upgrading Dependencies\_

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

### Fixme

- [ ] running `bun android` failed because of: (might be related to `peerDependencies` in `@workspace/core` package)

```bash
ERROR  Warning: Error: Incompatible React versions: The "react" and "react-native-renderer" packages must have the exact same version. Instead got:
│   - react:                  19.1.0
│   - react-native-renderer:  19.0.0
```

- [x] running `bun build:android:local` successfully created a development build, but failed when running `bun dev` (`ERROR  Warning: TypeError: Cannot convert undefined value to object. Call Stack - CheckAuthWrapper (apps/expo/src/core/components/check-auth-wrapper.tsx:7:44)`). Resolved by not using `BaseSpinner` component, instead using `Spinner` component from `tamagui`
- [x] `Unable to resolve "react" from "apps/expo/src/app/[...unmatched].tsx"`. Resolved by removing `node_modules` folder inside `apps/expo`

### Todo

- [ ] E2E test with maestro

### Prerequisite

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
# Next, delete the android and ios directories and run `bun run prebuild` again
# Next, recreate a development build
```

### Development

Every single time you change the `app.json` file / install native libraries, you need to re-generate native project (CNG) using:

```bash
# or regenerate native project from scratch
$ npm run prebuild -w @workspace/expo
```

Then, create a development build:

```bash
# create a development build
$ npm run android -w @workspace/expo
```

After that, to start the app:

```bash
# Run the app
$ npm run dev -w @workspace/expo
```

### Testing

Coming Soon

### Build

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
