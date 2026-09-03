import { hexaToRgba, hsvToHex, rgbToHsv } from './utils';

describe('color functions works correct', () => {
  describe('color #5d5ff0', () => {
    const color = '#5d5ff0';
    const rgba = hexaToRgba(color);
    const hsv = rgbToHsv(rgba.r, rgba.g, rgba.b);
    const hexFromHsv = hsvToHex(hsv);
  
    it('correct r g b', () => {
      expect({ r: rgba.r, g: rgba.g, b: rgba.b }).toEqual({ r: 93, g: 95, b: 240 });
    });
  
    it('correct h s v', () => {
      expect({ h: hsv.h, s: hsv.s, v: hsv.v }).toEqual({ h: 239, s: 0.6124999999999999, v: 0.9411764705882353 });
    });
  
    it('hex equals to initial color', () => {
      expect(hexFromHsv).toEqual(color);
    });
  })

  describe('color #223316', () => {
    const color = '#223316';
    const rgba = hexaToRgba(color);
    const hsv = rgbToHsv(rgba.r, rgba.g, rgba.b);
    const hexFromHsv = hsvToHex(hsv);
  
    it('correct r g b', () => {
      expect({ r: rgba.r, g: rgba.g, b: rgba.b }).toEqual({ r: 34, g: 51, b: 22 });
    });
  
    it('correct h s v', () => {
      expect({ h: hsv.h, s: hsv.s, v: hsv.v }).toEqual({ h: 95, s: 0.5686274509803921, v: 0.2 });
    });
  
    it('hex equals to initial color', () => {
      expect(hexFromHsv).toEqual(color);
    });
  })

  describe('color #15230e', () => {
    const color = '#15230e';
    const rgba = hexaToRgba(color);
    const hsv = rgbToHsv(rgba.r, rgba.g, rgba.b);
    const hexFromHsv = hsvToHex(hsv);
  
    it('correct r g b', () => {
      expect({ r: rgba.r, g: rgba.g, b: rgba.b }).toEqual({ r: 21, g: 35, b: 14 });
    });
  
    it('correct h s v', () => {
      expect({ h: hsv.h, s: hsv.s, v: hsv.v }).toEqual({ h: 100, s: 0.6000000000000001, v: 0.13725490196078433 });
    });
  
    it('hex equals to initial color', () => {
      expect(hexFromHsv).toEqual(color);
    });
  })

  describe('color #0a1005', () => {
    const color = '#0a1005';
    const rgba = hexaToRgba(color);
    const hsv = rgbToHsv(rgba.r, rgba.g, rgba.b);
    const hexFromHsv = hsvToHex(hsv);
  
    it('correct hue', () => {
      expect(hsv.h).toEqual(93);
    });
  })
});