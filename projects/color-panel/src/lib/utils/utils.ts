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


export const decimalToHex = (decimal: number) => {
  const hex = decimal.toString(16);

  return hex.length === 2 ? hex : `0${hex}`;
}

const hexToDecimal = (hex: string) => parseInt(hex, 16);

export const hexToRgb = (hex: string): { r: number; g: number; b: number } => {
  // Remove the # if present
  let cleanHex = hex.replace(/^#/, '');
  
  // Handle shorthand hex (e.g., #FFF)
  if (cleanHex.length === 3) {
    cleanHex = cleanHex.split('').map(char => char + char).join('');
  }
  
  // Ensure it's 6 characters
  if (cleanHex.length !== 6) {
    throw new Error('Invalid hex color format');
  }
  
  // Parse the hex values
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);
  
  return { r, g, b };
}

export const hsvToRgb = ({ h, s, v }: HsvColor): RgbColor => {
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

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
}

export const rgbToHsv = (rChannel: number, gChannel: number, bChannel: number): HsvColor => {
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
}
