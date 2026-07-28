/* oxlint-disable react/react-compiler react-doctor/react-compiler-no-manual-memoization react-doctor/js-set-map-lookups react-doctor/no-pass-data-to-parent */
import { useLocalStorageState } from "@workspace/core/hooks/use-local-storage-state";
import { useMediaQuery } from "@workspace/core/hooks/use-media-query";
import { useCallback, useEffect, useMemo } from "react";
/**
 * Basic color schema types - either a direct mode or 'auto' for system preference
 */
export type BasicColorSchema = BasicColorMode | "auto";
/**
 * Available color mode values
 */
export type BasicColorMode = "light" | "dark";
export interface UseColorModeOptions<T extends string = BasicColorMode> {
  /**
   * CSS Selector for the target element applying to
   *
   * @default 'html'
   */
  selector?: string;
  /**
   * HTML attribute applying the target element
   *
   * @default 'class'
   */
  attribute?: string;
  /**
   * The initial color mode
   *
   * @default 'auto'
   */
  initialValue?: T | BasicColorSchema;
  /**
   * Prefix when adding value to the attribute
   */
  modes?: Partial<Record<T | BasicColorSchema, string>>;
  /**
   * A custom handler for handle the updates.
   * When specified, the default behavior will be overridden.
   *
   * @default undefined
   */
  onChanged?: (
    mode: T | BasicColorMode,
    defaultHandler: (mode: T | BasicColorMode) => void
  ) => void;
  /**
   * Key to persist the data into localStorage/sessionStorage.
   *
   * @default 'app-color-scheme'
   */
  storageKey?: string;
  /**
   * Disable transition on switch
   *
   * @default true
   */
  disableTransition?: boolean;
}
/**
 * Media query for detecting system dark mode preference
 */
const COLOR_SCHEME_QUERY = "(prefers-color-scheme: dark)";
const splitRegex = /\s/gu;
const NO_TRANSITION_STYLE =
  "*,*::before,*::after{-webkit-transition:none!important;-moz-transition:none!important;-o-transition:none!important;-ms-transition:none!important;transition:none!important}";

/**
 * Suppresses CSS transitions while the color mode swaps.
 *
 * @returns a function restoring transitions once the swap is applied
 */
const suppressTransitions = () => {
  const style = window.document.createElement("style");
  style.append(document.createTextNode(NO_TRANSITION_STYLE));
  window.document.head.append(style);
  return () => {
    // Calling getComputedStyle forces the browser to redraw
    (() => window.getComputedStyle(style).opacity)();
    style.remove();
  };
};

/**
 * Applies the color mode to the element, either by toggling the mode classes
 * or by writing the mode into a custom attribute.
 */
const applyModeToElement = (
  el: Element,
  attribute: string,
  mode: string,
  modes: Record<string, string>
) => {
  if (attribute !== "class") {
    el.setAttribute(attribute, mode);
    return;
  }
  const current = mode.split(splitRegex);
  const truthyModes = Object.values(modes)
    .flatMap((i) => (i || "").split(splitRegex))
    .filter(Boolean);
  for (const v of truthyModes) {
    el.classList.toggle(v, current.includes(v));
  }
};

/**
 * Reactive color mode with auto data persistence.
 * Manages color scheme switching with DOM updates and storage persistence.
 *
 * @template T Custom color mode type extending string
 * @param options Configuration options for color mode behavior
 * @returns [colorMode, setColorMode] tuple for reading/writing the current color mode
 *
 * @example
 * ```ts
 * const [colorMode, setColorMode] = useColorMode()
 * // Change to dark mode
 * setColorMode('dark')
 * ```
 */
export const useColorMode = <T extends string = BasicColorMode>(
  options: UseColorModeOptions<T> = {}
) => {
  const {
    selector = "html",
    attribute = "class",
    initialValue = "auto",
    storageKey = "app-color-scheme",
    disableTransition = true,
    modes: customModes,
    onChanged,
  } = options;
  /**
   * Persisted color mode state in localStorage
   */
  const store = useLocalStorageState(storageKey, {
    defaultValue: initialValue,
  });
  /**
   * System dark mode preference from media query
   */
  const preferredDark = useMediaQuery(COLOR_SCHEME_QUERY);
  /**
   * Combined color modes including custom modes from options
   */
  const modes = useMemo(
    () =>
      ({
        auto: "",
        dark: "dark",
        light: "light",
        ...customModes,
      }) as Record<BasicColorSchema | T, string>,
    [customModes]
  );

  /**
   * Current system color mode based on preference
   */
  const system = preferredDark ? "dark" : "light";
  /**
   * Active color mode - either from storage or system preference if set to 'auto'
   */
  const state = (store[0] === "auto" ? system : store[0]) as
    | "light"
    | "dark"
    | T;

  /**
   * Updates HTML attributes to apply the color mode
   * Handles class-based and attribute-based color modes with transition disabling
   *
   * @param _selector DOM selector for target element
   * @param _attribute Attribute to modify ('class' or custom)
   * @param _mode Color mode value to apply
   */
  const updateHTMLAttrs = useCallback(
    (_selector: string, _attribute: string, _mode = "") => {
      const el = window.document.querySelector(_selector);
      if (!el) {
        return;
      }
      const restoreTransitions = disableTransition
        ? suppressTransitions()
        : undefined;
      applyModeToElement(el, _attribute, _mode, modes);
      restoreTransitions?.();
    },
    [disableTransition, modes]
  );
  useEffect(() => {
    // Apply color mode changes to DOM
    if (onChanged) {
      onChanged(state, (mode: T | BasicColorMode) => {
        updateHTMLAttrs(selector, attribute, modes[mode]);
      });
    } else {
      updateHTMLAttrs(selector, attribute, modes[state]);
    }
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, [attribute, modes, onChanged, selector, state]);
  return store;
};
