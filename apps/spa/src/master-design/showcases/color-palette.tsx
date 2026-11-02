import { cn } from "cn";
import { useLayoutEffect, useRef, useState } from "react";

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

/** Resolve any CSS color to RGBA by painting one pixel (handles oklch/oklab). */
const cssColorToRgba = (color: string): Rgba | null => {
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

  ctx.clearRect(0, 0, 1, 1);
  ctx.fillRect(0, 0, 1, 1);
  // 1×1 getImageData always yields RGBA; index via ?? for noUncheckedIndexedAccess.
  const pixel = ctx.getImageData(0, 0, 1, 1).data;

  return {
    r: pixel[0] ?? 0,
    g: pixel[1] ?? 0,
    b: pixel[2] ?? 0,
    a: (pixel[3] ?? 0) / 255,
  };
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
      { name: "background", bg: "bg-background" },
      { name: "foreground", bg: "bg-foreground" },
      { name: "card", bg: "bg-card" },
      { name: "card-foreground", bg: "bg-card-foreground" },
      { name: "muted", bg: "bg-muted" },
      { name: "muted-foreground", bg: "bg-muted-foreground" },
      { name: "overlay", bg: "bg-overlay" },
      { name: "overlay-foreground", bg: "bg-overlay-foreground" },
    ],
  },
  {
    label: "Brand",
    swatches: [
      { name: "primary", bg: "bg-primary" },
      { name: "primary-foreground", bg: "bg-primary-foreground" },
      { name: "primary-subtle", bg: "bg-primary-subtle" },
      { name: "primary-subtle-foreground", bg: "bg-primary-subtle-foreground" },
      { name: "secondary", bg: "bg-secondary" },
      { name: "secondary-foreground", bg: "bg-secondary-foreground" },
      { name: "accent", bg: "bg-accent" },
      { name: "accent-foreground", bg: "bg-accent-foreground" },
    ],
  },
  {
    label: "Status",
    swatches: [
      { name: "success", bg: "bg-success" },
      { name: "success-foreground", bg: "bg-success-foreground" },
      { name: "success-subtle", bg: "bg-success-subtle" },
      { name: "success-subtle-foreground", bg: "bg-success-subtle-foreground" },
      { name: "danger", bg: "bg-danger" },
      { name: "danger-foreground", bg: "bg-danger-foreground" },
      { name: "danger-subtle", bg: "bg-danger-subtle" },
      { name: "danger-subtle-foreground", bg: "bg-danger-subtle-foreground" },
      { name: "warning", bg: "bg-warning" },
      { name: "warning-foreground", bg: "bg-warning-foreground" },
      { name: "warning-subtle", bg: "bg-warning-subtle" },
      { name: "warning-subtle-foreground", bg: "bg-warning-subtle-foreground" },
      { name: "info-subtle", bg: "bg-info-subtle" },
      { name: "info-subtle-foreground", bg: "bg-info-subtle-foreground" },
    ],
  },
  {
    label: "Chrome",
    swatches: [
      { name: "border", bg: "bg-border" },
      { name: "input", bg: "bg-input" },
      { name: "ring", bg: "bg-ring" },
      { name: "navbar", bg: "bg-navbar" },
      { name: "navbar-foreground", bg: "bg-navbar-foreground" },
      { name: "sidebar", bg: "bg-sidebar" },
      { name: "sidebar-foreground", bg: "bg-sidebar-foreground" },
      { name: "sidebar-primary", bg: "bg-sidebar-primary" },
      {
        name: "sidebar-primary-foreground",
        bg: "bg-sidebar-primary-foreground",
      },
      { name: "sidebar-accent", bg: "bg-sidebar-accent" },
      { name: "sidebar-accent-foreground", bg: "bg-sidebar-accent-foreground" },
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

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div
      aria-label={name}
      className={cn(
        "border-border flex h-16 min-w-24 items-center justify-center rounded-lg border px-1.5 font-mono text-[10px]",
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
        <h4 className="text-muted-foreground mb-3 text-sm font-medium">
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
