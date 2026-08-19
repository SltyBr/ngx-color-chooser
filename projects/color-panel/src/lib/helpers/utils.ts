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
  let cleanHex = hex.replace('#', '');

  if (cleanHex.length === 3) {
    cleanHex = cleanHex
      .split('')
      .map((c) => c + c)
      .join('');
  } else if (cleanHex.length === 4) {
    cleanHex = cleanHex
      .split('')
      .map((c) => c + c)
      .join('');
  }

  if (cleanHex.length !== 6 && cleanHex.length !== 8) {
    throw new Error(
      'Invalid hex color format. Expected 3, 4, 6, or 8 characters (with or without #)',
    );
  }

  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);
  const a =
    cleanHex.length === 8 ? parseInt(cleanHex.substring(6, 8), 16) / 255 : 1; // Default alpha to 1 if not provided

  if (isNaN(r) || isNaN(g) || isNaN(b) || isNaN(a)) {
    throw new Error('Invalid hex color format. Contains non-hex characters');
  }

  return { r, g, b, a };
};

export const hsvToHex = ({ h, s, v }: HsvColor, a = 1): string => {
  let r: number;
  let g: number;
  let b: number;

  const sector = Math.floor(h / 60);
  const fraction = h / 60 - sector;
  const darkestColor = v * (1 - s);
  const descColor = v * (1 - fraction * s);
  const ascColor = v * (1 - (1 - fraction) * s);

  switch (sector % 6) {
    case 0:
      [r, g, b] = [v, ascColor, darkestColor];
      break;
    case 1:
      [r, g, b] = [descColor, v, darkestColor];
      break;
    case 2:
      [r, g, b] = [darkestColor, v, ascColor];
      break;
    case 3:
      [r, g, b] = [darkestColor, descColor, v];
      break;
    case 4:
      [r, g, b] = [ascColor, darkestColor, v];
      break;

    default:
      [r, g, b] = [v, darkestColor, descColor];
  }

  const toHex = (n: number): string => {
    const hex = Math.round(n * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}${toHex(a)}`;
};

export const rgbToHsv = (
  rChannel: number,
  gChannel: number,
  bChannel: number,
): HsvColor => {
  const r = rChannel / 255;
  const g = gChannel / 255;
  const b = bChannel / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);

  let h = max;
  let s = max;
  const v = max;

  const delta = max - min;

  s = max === 0 ? 0 : delta / max;

  if (max === min) {
    h = 0;
  } else {
    switch (max) {
      case r:
        h = (g - b) / delta + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / delta + 2;
        break;
      case b:
        h = (r - g) / delta + 4;
        break;

      default:
        break;
    }

    h *= 60;
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
