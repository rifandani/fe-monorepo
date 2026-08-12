import { useLayoutEffect, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";

import { Variant, VariantGrid } from "../variant";

interface Swatch {
  name: string;
  /** Tailwind bg utility mapped from `@theme` in globals.css */
  bg: string;
}

const byteHex = (n: number) =>
  Math.round(n).toString(16).padStart(2, "0").toUpperCase();

const formatHex = (r: number, g: number, b: number, a = 1): string => {
  const rgb = `#${byteHex(r)}${byteHex(g)}${byteHex(b)}`;
  return a < 1 ? `${rgb}${byteHex(a * 255)}` : rgb;
};

interface Rgba {
  r: number;
  g: number;
  b: number;
  a: number;
}

const parseAlpha = (raw: string | undefined): number => {
  if (raw === undefined) {
    return 1;
  }
  return raw.endsWith("%") ? Number(raw.slice(0, -1)) / 100 : Number(raw);
};

const parseRgba = (color: string): Rgba | null => {
  const value = color.trim();

  // Modern: rgb(1 2 3 / 0.5)
  const modern = value.match(
    /^rgba?\(\s*(?<r>[\d.]+)\s+(?<g>[\d.]+)\s+(?<b>[\d.]+)(?:\s*\/\s*(?<a>[\d.]+%?))?\s*\)$/iu
  );
  if (modern?.groups) {
    return {
      r: Number(modern.groups.r),
      g: Number(modern.groups.g),
      b: Number(modern.groups.b),
      a: parseAlpha(modern.groups.a),
    };
  }

  // Legacy: rgba(1, 2, 3, 0.5)
  const legacy = value.match(
    /^rgba?\(\s*(?<r>[\d.]+)\s*,\s*(?<g>[\d.]+)\s*,\s*(?<b>[\d.]+)(?:\s*,\s*(?<a>[\d.]+))?\s*\)$/iu
  );
  if (legacy?.groups) {
    return {
      r: Number(legacy.groups.r),
      g: Number(legacy.groups.g),
      b: Number(legacy.groups.b),
      a: parseAlpha(legacy.groups.a),
    };
  }

  // Canvas / Chrome often serializes as color(srgb 0-1 channels)
  const srgb = value.match(
    /^color\(\s*srgb\s+(?<r>[\d.]+)\s+(?<g>[\d.]+)\s+(?<b>[\d.]+)(?:\s*\/\s*(?<a>[\d.]+%?))?\s*\)$/iu
  );
  if (srgb?.groups) {
    return {
      r: Number(srgb.groups.r) * 255,
      g: Number(srgb.groups.g) * 255,
      b: Number(srgb.groups.b) * 255,
      a: parseAlpha(srgb.groups.a),
    };
  }

  if (value.startsWith("#") && (value.length === 7 || value.length === 9)) {
    return {
      r: Number.parseInt(value.slice(1, 3), 16),
      g: Number.parseInt(value.slice(3, 5), 16),
      b: Number.parseInt(value.slice(5, 7), 16),
      a: value.length === 9 ? Number.parseInt(value.slice(7, 9), 16) / 255 : 1,
    };
  }

  return null;
};

/** Resolve any CSS color to RGBA by painting one pixel (handles oklch/oklab). */
const cssColorToRgba = (color: string): Rgba | null => {
  const parsed = parseRgba(color);
  if (parsed) {
    return parsed;
  }

  const canvas = document.createElement("canvas");
  canvas.width = 1;
  canvas.height = 1;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) {
    return null;
  }

  // Sentinel: if `color` is rejected, fillStyle stays on this value.
  ctx.fillStyle = "rgba(1, 2, 3, 1)";
  const sentinel = ctx.fillStyle;
  ctx.fillStyle = color;
  if (ctx.fillStyle === sentinel) {
    return null;
  }

  const fromStyle = parseRgba(ctx.fillStyle);
  if (fromStyle) {
    return fromStyle;
  }

  ctx.clearRect(0, 0, 1, 1);
  ctx.fillRect(0, 0, 1, 1);
  const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
  if (
    r === undefined ||
    g === undefined ||
    b === undefined ||
    a === undefined
  ) {
    return null;
  }
  return { r, g, b, a: a / 255 };
};

const toLinearChannel = (c: number): number => {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
};

const contrastInk = ({ r, g, b }: Rgba): string => {
  const luminance =
    0.2126 * toLinearChannel(r) +
    0.7152 * toLinearChannel(g) +
    0.0722 * toLinearChannel(b);
  return luminance > 0.4 ? "#111111" : "#FFFFFF";
};

const groups: { label: string; swatches: Swatch[] }[] = [
  {
    label: "Surface",
    swatches: [
      { name: "bg", bg: "bg-bg" },
      { name: "fg", bg: "bg-fg" },
      { name: "card", bg: "bg-card" },
      { name: "card-fg", bg: "bg-card-fg" },
      { name: "muted", bg: "bg-muted" },
      { name: "muted-fg", bg: "bg-muted-fg" },
      { name: "overlay", bg: "bg-overlay" },
      { name: "overlay-fg", bg: "bg-overlay-fg" },
    ],
  },
  {
    label: "Brand",
    swatches: [
      { name: "primary", bg: "bg-primary" },
      { name: "primary-fg", bg: "bg-primary-fg" },
      { name: "primary-subtle", bg: "bg-primary-subtle" },
      { name: "primary-subtle-fg", bg: "bg-primary-subtle-fg" },
      { name: "secondary", bg: "bg-secondary" },
      { name: "secondary-fg", bg: "bg-secondary-fg" },
      { name: "accent", bg: "bg-accent" },
      { name: "accent-fg", bg: "bg-accent-fg" },
    ],
  },
  {
    label: "Status",
    swatches: [
      { name: "success", bg: "bg-success" },
      { name: "success-fg", bg: "bg-success-fg" },
      { name: "success-subtle", bg: "bg-success-subtle" },
      { name: "success-subtle-fg", bg: "bg-success-subtle-fg" },
      { name: "danger", bg: "bg-danger" },
      { name: "danger-fg", bg: "bg-danger-fg" },
      { name: "danger-subtle", bg: "bg-danger-subtle" },
      { name: "danger-subtle-fg", bg: "bg-danger-subtle-fg" },
      { name: "warning", bg: "bg-warning" },
      { name: "warning-fg", bg: "bg-warning-fg" },
      { name: "warning-subtle", bg: "bg-warning-subtle" },
      { name: "warning-subtle-fg", bg: "bg-warning-subtle-fg" },
      { name: "info-subtle", bg: "bg-info-subtle" },
      { name: "info-subtle-fg", bg: "bg-info-subtle-fg" },
    ],
  },
  {
    label: "Chrome",
    swatches: [
      { name: "border", bg: "bg-border" },
      { name: "input", bg: "bg-input" },
      { name: "ring", bg: "bg-ring" },
      { name: "navbar", bg: "bg-navbar" },
      { name: "navbar-fg", bg: "bg-navbar-fg" },
      { name: "sidebar", bg: "bg-sidebar" },
      { name: "sidebar-fg", bg: "bg-sidebar-fg" },
      { name: "sidebar-primary", bg: "bg-sidebar-primary" },
      { name: "sidebar-primary-fg", bg: "bg-sidebar-primary-fg" },
      { name: "sidebar-accent", bg: "bg-sidebar-accent" },
      { name: "sidebar-accent-fg", bg: "bg-sidebar-accent-fg" },
      { name: "sidebar-border", bg: "bg-sidebar-border" },
      { name: "sidebar-ring", bg: "bg-sidebar-ring" },
    ],
  },
  {
    label: "Chart",
    swatches: [
      { name: "chart-1", bg: "bg-chart-1" },
      { name: "chart-2", bg: "bg-chart-2" },
      { name: "chart-3", bg: "bg-chart-3" },
      { name: "chart-4", bg: "bg-chart-4" },
      { name: "chart-5", bg: "bg-chart-5" },
    ],
  },
];

const SwatchTile = ({ name, bg }: Swatch) => {
  const ref = useRef<HTMLDivElement>(null);
  const [hex, setHex] = useState("");
  const [ink, setInk] = useState("#111111");

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) {
      return;
    }

    const update = () => {
      const rgba = cssColorToRgba(getComputedStyle(el).backgroundColor);
      if (!rgba) {
        setHex("");
        return;
      }
      setHex(formatHex(rgba.r, rgba.g, rgba.b, rgba.a));
      setInk(contrastInk(rgba));
    };

    update();

    // ThemeToggle flips `.dark` on <html>; re-read tokens when that changes.
    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, {
      attributeFilter: ["class"],
      attributes: true,
    });
    return () => observer.disconnect();
  }, []);

  return (
    <div
      aria-label={name}
      className={twMerge(
        "flex h-16 min-w-24 items-center justify-center rounded-lg border border-border px-1.5 font-mono text-[10px]",
        bg
      )}
      ref={ref}
      style={{ color: ink }}
    >
      {hex || "…"}
    </div>
  );
};

export const ColorPaletteShowcase = () => (
  <div className="flex flex-col gap-8">
    {groups.map((group) => (
      <div key={group.label}>
        <h4 className="mb-3 font-medium text-muted-fg text-sm">
          {group.label}
        </h4>
        <VariantGrid>
          {group.swatches.map((swatch) => (
            <Variant key={swatch.name} label={swatch.name}>
              <SwatchTile {...swatch} />
            </Variant>
          ))}
        </VariantGrid>
      </div>
    ))}
  </div>
);
