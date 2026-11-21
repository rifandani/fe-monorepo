// fallow-ignore-file unused-file
import { createThemes, defaultComponentThemes } from "@tamagui/theme-builder";

const darkPalette = [
  "hsla(0, 15%, 1%, 1)",
  "hsla(0, 15%, 6%, 1)",
  "hsla(0, 15%, 12%, 1)",
  "hsla(0, 15%, 17%, 1)",
  "hsla(0, 15%, 23%, 1)",
  "hsla(0, 15%, 28%, 1)",
  "hsla(0, 15%, 34%, 1)",
  "hsla(0, 15%, 39%, 1)",
  "hsla(0, 15%, 45%, 1)",
  "hsla(0, 15%, 50%, 1)",
  "hsla(0, 15%, 93%, 1)",
  "hsla(0, 15%, 99%, 1)",
];

const lightPalette = [
  "hsla(0, 15%, 99%, 1)",
  "hsla(0, 15%, 94%, 1)",
  "hsla(0, 15%, 88%, 1)",
  "hsla(0, 15%, 83%, 1)",
  "hsla(0, 15%, 77%, 1)",
  "hsla(0, 15%, 72%, 1)",
  "hsla(0, 15%, 66%, 1)",
  "hsla(0, 15%, 61%, 1)",
  "hsla(0, 15%, 55%, 1)",
  "hsla(0, 15%, 50%, 1)",
  "hsla(0, 15%, 15%, 1)",
  "hsla(0, 15%, 1%, 1)",
];

const lightShadows = {
  shadow1: "rgba(0,0,0,0.04)",
  shadow2: "rgba(0,0,0,0.08)",
  shadow3: "rgba(0,0,0,0.16)",
  shadow4: "rgba(0,0,0,0.24)",
  shadow5: "rgba(0,0,0,0.32)",
  shadow6: "rgba(0,0,0,0.4)",
};

const darkShadows = {
  shadow1: "rgba(0,0,0,0.2)",
  shadow2: "rgba(0,0,0,0.3)",
  shadow3: "rgba(0,0,0,0.4)",
  shadow4: "rgba(0,0,0,0.5)",
  shadow5: "rgba(0,0,0,0.6)",
  shadow6: "rgba(0,0,0,0.7)",
};

const accentPaletteEnd = "hsla(250, 50%, 95%, 1)";

const builtThemes = createThemes({
  componentThemes: defaultComponentThemes,
  base: {
    extra: {
      dark: {
        ...darkShadows,
        shadowColor: darkShadows.shadow1,
      },
      light: {
        ...lightShadows,
        shadowColor: lightShadows.shadow1,
      },
    },
    palette: {
      dark: darkPalette,
      light: lightPalette,
    },
  },
  accent: {
    palette: {
      dark: [
        "hsla(250, 50%, 35%, 1)",
        "hsla(250, 50%, 38%, 1)",
        "hsla(250, 50%, 41%, 1)",
        "hsla(250, 50%, 43%, 1)",
        "hsla(250, 50%, 46%, 1)",
        "hsla(250, 50%, 49%, 1)",
        "hsla(250, 50%, 52%, 1)",
        "hsla(250, 50%, 54%, 1)",
        "hsla(250, 50%, 57%, 1)",
        "hsla(250, 50%, 60%, 1)",
        "hsla(250, 50%, 90%, 1)",
        accentPaletteEnd,
      ],
      light: [
        "hsla(250, 50%, 40%, 1)",
        "hsla(250, 50%, 43%, 1)",
        "hsla(250, 50%, 46%, 1)",
        "hsla(250, 50%, 48%, 1)",
        "hsla(250, 50%, 51%, 1)",
        "hsla(250, 50%, 54%, 1)",
        "hsla(250, 50%, 57%, 1)",
        "hsla(250, 50%, 59%, 1)",
        "hsla(250, 50%, 62%, 1)",
        "hsla(250, 50%, 65%, 1)",
        accentPaletteEnd,
        accentPaletteEnd,
      ],
    },
  },
  childrenThemes: {
    error: {
      palette: {
        dark: [],
        light: [],
      },
    },
    success: {
      palette: {
        dark: [],
        light: [],
      },
    },
    warning: {
      palette: {
        dark: [],
        light: [],
      },
    },
  },
});

export type Themes = typeof builtThemes;

// SAFETY: a production client build gets its themes from the CSS that the Tamagui compiler extracts, so Tamagui never reads the fields of this object.
// oxlint-disable-next-line typescript/no-unsafe-type-assertion
const hydratedFromCss = {} as Themes;

export const themes: Themes =
  process.env.TAMAGUI_ENVIRONMENT === "client" &&
  process.env.NODE_ENV === "production"
    ? hydratedFromCss
    : builtThemes;
