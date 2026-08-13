import { ArrowPathIcon } from "@heroicons/react/16/solid";
import { useState } from "react";
import { SwitchButton, SwitchField } from "react-aria-components/Switch";
import { twJoin } from "tailwind-merge";

import { Button } from "@/core/components/ui/button";
import { isFeatureEnabled } from "@/core/feature-flags/is-enabled";
import {
  featureFlagIds,
  featureFlagRegistry,
} from "@/core/feature-flags/registry";
import type {
  FeatureFlagDefinition,
  FeatureFlagId,
} from "@/core/feature-flags/registry";
import {
  featureFlagStoreName,
  useFeatureFlagStore,
} from "@/core/feature-flags/store";
import { router } from "@/core/providers/router/client";

const applyFlagChange = (mutate: () => void): void => {
  mutate();
  void router.invalidate();
};

/** camelCase / PascalCase → kebab-case for display. */
const toKebab = (id: string): string =>
  id
    .replaceAll(/(?<lower>[a-z0-9])(?<upper>[A-Z])/gu, "$<lower>-$<upper>")
    .replaceAll("_", "-")
    .toLowerCase();

/** Subsequence match — `/ fuzzy filter` in the panel. */
const fuzzyMatch = (query: string, ...haystacks: string[]): boolean => {
  const q = query.trim().toLowerCase();
  if (q.length === 0) {
    return true;
  }

  return haystacks.some((haystack) => {
    const t = haystack.toLowerCase();
    let i = 0;
    for (const char of t) {
      if (char === q[i]) {
        i += 1;
      }
      if (i === q.length) {
        return true;
      }
    }
    return false;
  });
};

const groupBySection = (
  flags: readonly FeatureFlagDefinition[]
): readonly (readonly [string, FeatureFlagDefinition[]])[] => {
  const groups = new Map<string, FeatureFlagDefinition[]>();
  for (const flag of flags) {
    const list = groups.get(flag.section) ?? [];
    list.push(flag);
    groups.set(flag.section, list);
  }
  return [...groups.entries()];
};

const statusDotClass = (isOverridden: boolean, enabled: boolean): string => {
  if (isOverridden) {
    return "bg-blue-500";
  }
  if (enabled) {
    return "bg-muted-fg";
  }
  return "bg-muted-fg/40";
};

const OverrideRail = ({ visible }: { visible: boolean }) => {
  if (!visible) {
    return null;
  }
  return (
    <span
      aria-hidden="true"
      className="absolute inset-y-0 left-0 w-0.5 bg-blue-500"
    />
  );
};

const OverrideResetButton = ({
  displayId,
  flagId,
  visible,
}: {
  displayId: string;
  flagId: FeatureFlagId;
  visible: boolean;
}) => {
  const resetOverride = useFeatureFlagStore((s) => s.resetOverride);

  if (!visible) {
    return null;
  }

  return (
    <Button
      intent="plain"
      size="sq-xs"
      aria-label={`Reset ${displayId} to default`}
      className="size-6 text-muted-fg sm:size-6"
      onPress={() => {
        applyFlagChange(() => {
          resetOverride(flagId);
        });
      }}
    >
      <ArrowPathIcon className="size-3" />
    </Button>
  );
};

const rowClassName = (isOverridden: boolean, enabled: boolean): string =>
  twJoin(
    "group/row relative flex items-center gap-2 py-1.5 pr-2.5 pl-2.5",
    isOverridden && "bg-muted/50",
    !enabled && "text-muted-fg"
  );

const idClassName = (enabled: boolean): string =>
  twJoin("min-w-0 flex-1 truncate", enabled ? "text-fg" : "text-muted-fg");

const FlagSwitchIndicator = ({
  isFocusVisible,
  isSelected,
}: {
  isFocusVisible: boolean;
  isSelected: boolean;
}) => (
  <span
    data-slot="indicator"
    className={twJoin(
      "relative inline-flex h-4 w-7 items-center rounded-full p-0.5 transition-colors",
      isFocusVisible && "ring-2 ring-ring/50 ring-offset-1 ring-offset-bg",
      isSelected ? "bg-fg" : "bg-muted-fg/25"
    )}
  >
    <span
      aria-hidden="true"
      className={twJoin(
        "size-3 rounded-full bg-bg shadow-sm transition-transform",
        isSelected && "translate-x-3"
      )}
    />
  </span>
);

const FlagSwitch = ({
  flagId,
  label,
  enabled,
}: {
  flagId: FeatureFlagId;
  label: string;
  enabled: boolean;
}) => {
  const setOverride = useFeatureFlagStore((s) => s.setOverride);

  return (
    <SwitchField
      aria-label={label}
      isSelected={enabled}
      onChange={(isSelected) => {
        applyFlagChange(() => {
          setOverride(flagId, isSelected);
        });
      }}
    >
      <SwitchButton className="shrink-0 outline-none">
        {(values) => (
          <FlagSwitchIndicator
            isFocusVisible={values.isFocusVisible}
            isSelected={values.isSelected}
          />
        )}
      </SwitchButton>
    </SwitchField>
  );
};

const FeatureFlagRow = ({ flag }: { flag: FeatureFlagDefinition }) => {
  const { id, label } = flag;
  const isOverridden = useFeatureFlagStore(
    (s) => typeof s.overrides[id] === "boolean"
  );
  const enabled = isFeatureEnabled(id);
  const displayId = toKebab(id);

  return (
    <li className={rowClassName(isOverridden, enabled)}>
      <OverrideRail visible={isOverridden} />

      <span
        aria-hidden="true"
        className={twJoin(
          "size-1.5 shrink-0 rounded-full",
          statusDotClass(isOverridden, enabled)
        )}
      />

      <span className={idClassName(enabled)}>{displayId}</span>

      <OverrideResetButton
        displayId={displayId}
        flagId={id}
        visible={isOverridden}
      />

      <FlagSwitch flagId={id} label={label} enabled={enabled} />
    </li>
  );
};

export const FeatureFlagsPanel = () => {
  const overrideCount = useFeatureFlagStore(
    (s) => Object.keys(s.overrides).length
  );
  const resetAllOverrides = useFeatureFlagStore((s) => s.resetAllOverrides);

  const [query, setQuery] = useState("");

  const filteredFlags = featureFlagRegistry.filter((flag) =>
    fuzzyMatch(query, flag.id, toKebab(flag.id), flag.label, flag.section)
  );
  const sections = groupBySection(filteredFlags);

  // TanStack `pluginsTabContent` forces `width/height: 100%` on `& > *` and
  // `& > * > *`. One extra wrapper keeps header/filter/list from each stretching.
  return (
    <div
      data-feature-flag-store={featureFlagStoreName}
      data-feature-flag-count={featureFlagIds.length}
    >
      <div className="flex flex-col overflow-hidden font-mono text-xs text-fg">
        <div className="flex shrink-0 items-center justify-between gap-2 px-2.5 py-2">
          <span className="font-sans font-semibold text-sm lowercase">
            flags
          </span>
          <Button
            intent="outline"
            size="xs"
            className="font-sans"
            isDisabled={overrideCount === 0}
            onPress={() => {
              applyFlagChange(() => {
                resetAllOverrides();
              });
            }}
          >
            {`reset all (${overrideCount})`}
          </Button>
        </div>

        <label className="flex shrink-0 items-center gap-1.5 border-border/60 border-y px-2.5 py-1.5 text-muted-fg">
          <span aria-hidden="true" className="text-muted-fg/70">
            /
          </span>
          <input
            type="search"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
            }}
            placeholder="fuzzy filter"
            aria-label="Fuzzy filter feature flags"
            className="min-w-0 flex-1 bg-transparent text-fg outline-none placeholder:text-muted-fg/70 [&::-webkit-search-cancel-button]:hidden"
          />
          <span className="shrink-0 tabular-nums text-muted-fg">
            {filteredFlags.length}/{featureFlagIds.length}
          </span>
        </label>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          {sections.length === 0 ? (
            <p className="px-2.5 py-4 text-center font-sans text-muted-fg">
              No flags match.
            </p>
          ) : (
            sections.map(([section, flags]) => (
              <section key={section}>
                <h3 className="sticky top-0 z-10 bg-bg px-2.5 py-1 font-sans font-medium text-[10px] text-muted-fg uppercase tracking-wider">
                  {section}
                  <span className="ms-1 tabular-nums opacity-70">
                    {flags.length}
                  </span>
                </h3>
                <ul className="m-0 list-none p-0">
                  {flags.map((flag) => (
                    <FeatureFlagRow key={flag.id} flag={flag} />
                  ))}
                </ul>
              </section>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
