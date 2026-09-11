# Core

Shared libraries and cross-app vocabulary used by spa and expo.

## Language

### Internationalization

**Locale**: A lowercase BCP-47 language tag that selects which Message Catalog to use (`en-us`, `id-id`). _Avoid_: language, languageCode, lng, resolvedLanguage

**Message Catalog**: The set of Translation Keys and strings for one Locale, owned in `packages/core`. _Avoid_: resources, locale JSON, dictionary, i18n file

**Translation Key**: A flat identifier into a Message Catalog (e.g. `welcome`, `editProfile`), shared across apps. _Avoid_: nested namespaces like `auth.welcome`, i18next paths

**Translation Provider**: App-local React glue that holds Locale state and exposes `t` / `setLocale`. Not part of core. _Avoid_: I18nextProvider, react-i18next

### Errors

**Error Envelope**: The `{ message }` body the API returns on a failed request. Present on most failures, absent on some — a caller may never assume it parsed. _Avoid_: error response, error body, error payload

### Session

**Session**: What one successful login produces — the signed-in person together with the credentials that prove it. Each app persists exactly one, or none. _Avoid_: user, appUser, auth state, current user

**Access Token**: The credential sent with a request to prove the Session. Held inside the Session, never read by a caller. _Avoid_: token, bearer, jwt, auth header

**End Session**: The single flow that discards a Session, whether the person signed out or the server rejected the Access Token. _Avoid_: logout, clearUser, resetUser, sign out
