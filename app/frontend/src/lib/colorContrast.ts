function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function parseHexColor(input: string): [number, number, number] | null {
  const hex = input.trim().replace("#", "");
  if (hex.length === 3) {
    const r = parseInt(hex[0] + hex[0], 16);
    const g = parseInt(hex[1] + hex[1], 16);
    const b = parseInt(hex[2] + hex[2], 16);
    return [r, g, b];
  }
  if (hex.length === 6) {
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    return [r, g, b];
  }
  return null;
}

function parseRgbColor(input: string): [number, number, number] | null {
  const match = input
    .trim()
    .match(/^rgba?\((\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})/i);
  if (!match) return null;
  const r = clamp(parseInt(match[1], 10), 0, 255);
  const g = clamp(parseInt(match[2], 10), 0, 255);
  const b = clamp(parseInt(match[3], 10), 0, 255);
  return [r, g, b];
}

function parseColor(input: string): [number, number, number] | null {
  if (!input) return null;
  return parseHexColor(input) || parseRgbColor(input);
}

function relativeLuminance([r, g, b]: [number, number, number]) {
  const transform = (c: number) => {
    const v = c / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  };
  const rr = transform(r);
  const gg = transform(g);
  const bb = transform(b);
  return 0.2126 * rr + 0.7152 * gg + 0.0722 * bb;
}

function contrastRatio(a: [number, number, number], b: [number, number, number]) {
  const l1 = relativeLuminance(a);
  const l2 = relativeLuminance(b);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

export function getReadableTextColor(bgColor: string, light = "#ffffff", dark = "#111827") {
  const bg = parseColor(bgColor);
  const lightRgb = parseColor(light);
  const darkRgb = parseColor(dark);
  if (!bg || !lightRgb || !darkRgb) return dark;
  const lightContrast = contrastRatio(bg, lightRgb);
  const darkContrast = contrastRatio(bg, darkRgb);
  return lightContrast >= darkContrast ? light : dark;
}

export function ensureContrastForeground(
  fgColor: string,
  bgColor: string,
  minRatio = 3,
  fallbackLight = "#ffffff",
  fallbackDark = "#111827",
) {
  const fg = parseColor(fgColor);
  const bg = parseColor(bgColor);
  if (!fg || !bg) return fgColor;
  if (contrastRatio(fg, bg) >= minRatio) return fgColor;
  return getReadableTextColor(bgColor, fallbackLight, fallbackDark);
}
