import { parseCSSColor } from './csscolorparser.js';

export function parseColor(colorStr) {
  if (typeof colorStr !== 'string') {
    return { r: 0, g: 0, b: 0, a: 255 };
  }

  const result = parseCSSColor(colorStr);

  if (result === null) {
    // Default to black if color is not recognized
    return { r: 0, g: 0, b: 0, a: 255 };
  }

  const [r, g, b, a] = result;
  return { r, g, b, a: Math.round(a * 255) };
}
