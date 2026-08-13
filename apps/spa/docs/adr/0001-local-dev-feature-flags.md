# Local DEV Feature Flags via TanStack Devtools

Spa gates developer-only surfaces (starting with the Component Catalog) behind local Feature Flags — not remote config. Flags default ON in development and OFF otherwise; overrides persist in the browser and are toggled from a custom TanStack Devtools panel. Production builds never mount Devtools and never honor an ON override, so gated routes stay unreachable outside DEV.
