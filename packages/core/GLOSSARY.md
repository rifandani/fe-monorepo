# Core

Shared libraries and cross-app vocabulary used by spa and expo.

## Language

### Internationalization

**Locale**: One of the supported lowercase BCP-47 language tags (`en-us`, `id-id`), listed once in core with its display name and Message Catalog. A raw tag that is not one of them is never a Locale; it is first mapped to a Device Locale. It selects which Message Catalog to use. _Avoid_: language, languageCode, lng, resolvedLanguage

**Device Locale**: The Locale mapped from the raw language tag of the platform (the OS language on a device, `navigator.language` in a browser), used while no picked Locale is in Persistence. Mapped by primary language subtag (`en*` → `en-us`, `id*` → `id-id`); otherwise `en-us`. Each app gives only the raw tag; core owns the mapping (`toLocale`) and the list of supported Locales. _Avoid_: system language, browser language, userLocale, system language sync on AppState resume

**Message Catalog**: The set of Translation Keys and strings for one Locale, owned in `packages/core`. _Avoid_: resources, locale JSON, dictionary, i18n file

**Translation Key**: A flat identifier into a Message Catalog (e.g. `welcome`, `editProfile`), shared across apps. _Avoid_: nested namespaces like `auth.welcome`, i18next paths

**Translation Provider**: App-local React glue that holds Locale state and exposes `t` / `setLocale`. Not part of core. _Avoid_: I18nextProvider, react-i18next

### Errors

**Error Envelope**: The `{ message }` body the API returns on a failed request. Present on most failures, absent on some — a caller may never assume it parsed. _Avoid_: error response, error body, error payload

**Retry Safety**: The statement that a mutation is idempotent (sending it again has the same effect as sending it once) or not. Each mutation option factory declares it in `meta.retrySafety`; a not-idempotent mutation never retries. _Avoid_: retryable, safe mutation

**Unknown Outcome**: A timeout of a not-idempotent mutation. The server possibly did the work, so the UI tells the person to check the result before they try again. _Avoid_: failed, lost request

### Telemetry

**Golden Signals**: The latency, traffic and errors of the requests that `Http` sends, recorded as `http.client.requests` and `http.client.request.duration` (ADR-0013). _Avoid_: request stats

**Route Template**: The path of a request without origin, query and hash, with each id segment replaced by `{id}` (`/users/{id}`). The `url.template` attribute of the Golden Signals. _Avoid_: route, full URL

### Session

**Session**: What one successful login produces — the signed-in person together with the credentials that prove it. Each app persists exactly one, or none. _Avoid_: user, appUser, auth state, current user

**Access Token**: The credential sent with a request to prove the Session. Held inside the Session, never read by a caller. _Avoid_: token, bearer, jwt, auth header

**Session Start**: The single flow that keeps the Session a successful login produced. The pair of End Session. _Avoid_: setUser, sign in (the login request itself)

**Session Refresh**: The single flow that gets a new Access Token when the server rejects the current one, by exchanging the refresh token of the Session. One runs at a time, also across the tabs of one browser: every request rejected while it runs waits for it, then sends once more with the new Access Token. When the server refuses the refresh token, End Session follows; when the refresh cannot finish, the Session stays. _Avoid_: token refresh (the request itself), re-auth, silent login

**End Session**: The single flow that discards a Session, whether the person signed out or the server refused the refresh token. Distinct from the store setter it calls. _Avoid_: logout, sign out, log off

**Session Lock**: The lock that lets one Session Refresh at a time send its request, across every Session on one store (the tabs of one browser on one `localStorage`). The SPA uses the Web Locks API; one app instance uses a memory lock. _Avoid_: mutex, refresh lock, leader tab

**Session Machine**: The statechart that runs Session Start, Session Refresh and End Session in order, one at a time. It holds which of these runs now (the Session Activity); the Session itself stays in Persistence. _Avoid_: auth machine, auth state

**Session Activity**: The Session work that runs now: `idle`, `starting`, `refreshing` or `ending`. The state of the Session Machine, which React reads to show, for example, that a token refresh runs. _Avoid_: session status, auth status

### Persistence

**Persistence**: The client state one app keeps on its device across restarts: the Session, the picked theme, and the picked Locale. Each app has exactly one. _Avoid_: store, app store, local storage
