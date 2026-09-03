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

/**
 * Поддерживает форматы: #RGB, #RGBA, #RRGGBB, #RRGGBBAA
 */
export function hexaToRgba(hex: string): RGBA {
  hex = hex.replace(/^#/, '');
  
  let r: number, g: number, b: number, a: number = 1;
  
  if (hex.length === 3) {
    // #RGB
    r = parseInt(hex[0] + hex[0], 16);
    g = parseInt(hex[1] + hex[1], 16);
    b = parseInt(hex[2] + hex[2], 16);
  } else if (hex.length === 4) {
    // #RGBA
    r = parseInt(hex[0] + hex[0], 16);
    g = parseInt(hex[1] + hex[1], 16);
    b = parseInt(hex[2] + hex[2], 16);
    a = parseInt(hex[3] + hex[3], 16) / 255;
  } else if (hex.length === 6) {
    // #RRGGBB
    r = parseInt(hex.substring(0, 2), 16);
    g = parseInt(hex.substring(2, 4), 16);
    b = parseInt(hex.substring(4, 6), 16);
  } else if (hex.length === 8) {
    // #RRGGBBAA
    r = parseInt(hex.substring(0, 2), 16);
    g = parseInt(hex.substring(2, 4), 16);
    b = parseInt(hex.substring(4, 6), 16);
    a = parseInt(hex.substring(6, 8), 16) / 255;
  } else {
    throw new Error('Invalid HEX color format');
  }
  
  return { r, g, b, a };
}

export function rgbToHsv(r: number, g: number, b: number, prevHue?: number): HSV {
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;
  
  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  const diff = max - min;
  
  let h = 0;
  const s = max === 0 ? 0 : diff / max;
  const v = max;
  
  if (diff !== 0) {
    if (max === rNorm) {
      h = 60 * ((gNorm - bNorm) / diff % 6);
    } else if (max === gNorm) {
      h = 60 * ((bNorm - rNorm) / diff + 2);
    } else if (max === bNorm) {
      h = 60 * ((rNorm - gNorm) / diff + 4);
    }
  } else {
    if (prevHue) {
      h = prevHue;
    }
  }
  
  if (h < 0) h += 360;
  
  return { h, s, v };
}

export function hsvToRgb(h: number, s: number, v: number): RGBA {
  h = ((h % 360) + 360) % 360;
  const c = v * s;
  const x = c * (1 - Math.abs((h / 60) % 2 - 1));
  const m = v - c;
  
  let rPrime: number, gPrime: number, bPrime: number;
  
  if (h < 60) {
    [rPrime, gPrime, bPrime] = [c, x, 0];
  } else if (h < 120) {
    [rPrime, gPrime, bPrime] = [x, c, 0];
  } else if (h < 180) {
    [rPrime, gPrime, bPrime] = [0, c, x];
  } else if (h < 240) {
    [rPrime, gPrime, bPrime] = [0, x, c];
  } else if (h < 300) {
    [rPrime, gPrime, bPrime] = [x, 0, c];
  } else {
    [rPrime, gPrime, bPrime] = [c, 0, x];
  }
  
  return {
    r: Math.round((rPrime + m) * 255),
    g: Math.round((gPrime + m) * 255),
    b: Math.round((bPrime + m) * 255),
    a: 1
  };
}

export function hsvToHsl(h: number, s: number, v: number): HSL {
  const l = v * (1 - s / 2);
  const sL = l === 0 || l === 1 
    ? 0 
    : (v - l) / Math.min(l, 1 - l);
  
  return {
    h,
    s: Math.round(sL * 100),
    l: Math.round(l * 100),
  };
}

export function rgbToHex(r: number, g: number, b: number, a?: number): string {
  const toHex = (value: number): string => {
    const clamped = Math.max(0, Math.min(255, Math.round(value)));
    return clamped.toString(16).padStart(2, '0');
  };
  
  if (a !== undefined && a < 1) {
    const alpha = Math.max(0, Math.min(1, a));
    return `#${toHex(r)}${toHex(g)}${toHex(b)}${toHex(alpha * 255)}`;
  }
  
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export function hslToHsv(h: number, s: number, l: number): HSV {
  // Нормализуем входные значения
  h = ((h % 360) + 360) % 360;
  s = Math.max(0, Math.min(100, s)) / 100;
  l = Math.max(0, Math.min(100, l)) / 100;
  
  let v: number;
  let sV: number;
  
  if (l === 0) {
    v = 0;
    sV = 0;
  } else if (l === 1) {
    v = 1;
    sV = 0;
  } else {
    v = l + s * Math.min(l, 1 - l);
    sV = v === 0 ? 0 : 2 * (1 - l / v);
  }
  
  return {
    h: h,
    s: Math.round(sV),
    v: Math.round(v)
  };
}

export const isValidHex = (value: string): boolean => {
  return /^#[0-9A-Fa-f]{6}$/.test(value) || /^#[0-9A-Fa-f]{8}$/.test(value);
}
