export interface HsvColor {
  h: number;
  s: number;
  v: number;
}

export interface RgbColor {
  r: number;
  g: number;
  b: number;
}

interface RGBA {
  r: number; // Red: 0-255
  g: number; // Green: 0-255
  b: number; // Blue: 0-255
  a: number; // Alpha: 0-1
}

interface HSV {
  h: number; // 0-360
  s: number; // 0-1
  v: number; // 0-1
}

interface HSL {
  h: number; // 0-360
  s: number; // 0-100
  l: number; // 0-100
}

export const hexaToRgba = (hex: string): RGBA => {
  const cleanHex = hex.replace("#", "");

  const r = parseInt(cleanHex.slice(0, 2), 16);
  const g = parseInt(cleanHex.slice(2, 4), 16);
  const b = parseInt(cleanHex.slice(4, 6), 16);
  const a = cleanHex.length === 8
    ? parseInt(cleanHex.slice(6, 8), 16) / 255
    : 1;

  return { r, g, b, a };
};

export const hsvToHex = ({ h, s, v }: HsvColor, a = 1): string => {
  h = ((h % 360) + 360) % 360;
  s = Math.max(0, Math.min(100, s));
  v = Math.max(0, Math.min(100, v));

  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;

  let r = 0;
  let g = 0;
  let b = 0;

  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];

  const toHex = (n: number) =>
    Math.round((n + m) * 255)
      .toString(16)
      .padStart(2, "0");

  const alpha = Math.round(Math.max(0, Math.min(1, a)) * 255)
    .toString(16)
    .padStart(2, "0");

  return `#${toHex(r)}${toHex(g)}${toHex(b)}${alpha}`;
};

export const rgbToHsv = (
  rChannel: number,
  gChannel: number,
  bChannel: number,
): HsvColor => {
  // Normalize RGB values to 0-1 range
  const r = rChannel / 255;
  const g = gChannel / 255;
  const b = bChannel / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;

  let h = 0;
  let s = 0;
  const v = max;

  // Calculate saturation
  if (max !== 0) {
    s = delta / max;
  }

  // Calculate hue
  if (delta !== 0) {
    if (max === r) {
      h = ((g - b) / delta) % 6;
    } else if (max === g) {
      h = (b - r) / delta + 2;
    } else {
      h = (r - g) / delta + 4;
    }
    h = Math.round(h * 60);
    if (h < 0) {
      h += 360;
    }
  }

  return { h, s, v };
};

export const hsvToHsl = ({ h, s, v }: HSV): HSL => {
  const l = v * (1 - s / 2);

  let sResult: number;
  if (l === 0 || l === 1) {
    sResult = 0;
  } else {
    sResult = (v - l) / Math.min(l, 1 - l);
  }

  return {
    h: h,
    s: Math.round(sResult * 100),
    l: Math.round(l * 100)
  };
}

export const hslToHsv = ({ h, s, l }: HSL): HSV => {
  // Convert percentages to decimals
  const sDecimal = s / 100;
  const lDecimal = l / 100;

  // Calculate HSV values
  const v = lDecimal + sDecimal * Math.min(lDecimal, 1 - lDecimal);
  const saturation = v === 0 ? 0 : 2 * (1 - lDecimal / v);

  return {
    h: h,
    s: Math.round(saturation * 100) / 100,
    v: Math.round(v * 100) / 100
  };
}
