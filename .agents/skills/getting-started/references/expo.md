# Expo setup

Read this reference only when the user keeps Expo. Paths are relative to `apps/expo` unless marked as repo root.

## App and EAS identity

Ask for the display name, bundle identifier, URL scheme, Expo owner, project slug, and whether to create or link an EAS project. Collect an existing EAS project ID when available. Use the EAS setup instructions in the app README for account login and `eas init`. Apply the external-service authorization rules in the main skill before creating or linking a project.

- `app.config.ts`: set `EAS_PROJECT_ID`, `PROJECT_SLUG`, `OWNER`, `APP_NAME`, `BUNDLE_IDENTIFIER`, and `SCHEME`. The project ID also supplies EAS Update URLs; verify those derived values.
- Preserve consistent development, preview, and production suffixes for names, bundle IDs, and schemes.
- Replace or remove the template `appleTeamId` and app-group examples with the user's values when applicable.
- `package.json`: update `MAESTRO_APP_ID` in `test:dev` and `test:prod`, and the template temporary directory in `ios:sim:install`.
- `README.md`: update bundle IDs in uninstall and Maestro commands and the matching simulator-install temporary directory.
- `eas.json`: collect `submit.production` values when the user is ready for store submission. Otherwise mark store configuration as deferred. Setup does not include publishing a build.

## Storage, text, and assets

- `src/lib/layers/mmkv.ts` and `mmkv.unit.test.ts`: replace the template `encryptionKey` value with the selected project-specific storage value. For an app already in use, account for existing encrypted data before changing it.
- Repo root `packages/core/src/i18n/locales/en-US.ts` and `id-ID.ts`: set `appName` to the chosen display name.
- Replace `src/shared/assets/icons/*`, including development and preview icons and the splash image, with supplied assets.
- Set splash and adaptive-icon `backgroundColor` in `app.config.ts` to match the assets.

## API and test data

Ask whether to keep DummyJSON or use the user's API. Coordinate shared changes with SPA setup when both apps remain.

- `.env.example` and the EAS project environment: set `EXPO_PUBLIC_API_BASE_URL` for the selected API. Use the EAS project environment as the source of truth for Expo local environment files. Follow the existing pull scripts; keep the SPA's separate local-to-CI flow intact.
- Repo root `packages/core/src/lib/{auth,cdn,http}/` and app `src/features/user/`: adapt endpoints and schemas after inspecting the API contract.
- `.maestro/shared/_login.yaml` and `.maestro/flows/profile.yaml`: update the test user and email for the selected API.
- `.maestro/flows/home.yaml`: update the display-name text from `appName`.

Run affected storage, locale, and API tests. Inspect resolved Expo config for all three variants and check asset paths. Run native or Maestro checks when a device or simulator is available; list checks that remain pending.
