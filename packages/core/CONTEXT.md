# Core

Shared libraries and cross-app vocabulary used by spa, web, and expo.

## Language

**Locale**: A lowercase BCP-47 language tag that selects which Message Catalog to use (`en-us`, `id-id`). _Avoid_: language, languageCode, lng, resolvedLanguage

**Message Catalog**: The set of Translation Keys and strings for one Locale, owned in `packages/core`. _Avoid_: resources, locale JSON, dictionary, i18n file

**Translation Key**: A flat identifier into a Message Catalog (e.g. `welcome`, `editProfile`), shared across apps. _Avoid_: nested namespaces like `auth.welcome`, i18next paths

**Translation Provider**: App-local React glue that holds Locale state and exposes `t` / `setLocale`. Not part of core. _Avoid_: I18nextProvider, react-i18next
