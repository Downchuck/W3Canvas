import { strict as assert } from 'assert';
import { test } from 'node:test';
import { parseColor } from '../src/core/canvas/color.js';

test('should parse named colors', () => {
  assert.deepStrictEqual(parseColor('red'), { r: 255, g: 0, b: 0, a: 255 });
  assert.deepStrictEqual(parseColor('green'), { r: 0, g: 128, b: 0, a: 255 });
  assert.deepStrictEqual(parseColor('blue'), { r: 0, g: 0, b: 255, a: 255 });
});

test('should parse hex colors', () => {
  assert.deepStrictEqual(parseColor('#ff0000'), { r: 255, g: 0, b: 0, a: 255 });
  assert.deepStrictEqual(parseColor('#00ff00'), { r: 0, g: 255, b: 0, a: 255 });
  assert.deepStrictEqual(parseColor('#0000ff'), { r: 0, g: 0, b: 255, a: 255 });
  assert.deepStrictEqual(parseColor('#f00'), { r: 255, g: 0, b: 0, a: 255 });
});

test('should parse rgb colors', () => {
  assert.deepStrictEqual(parseColor('rgb(255, 0, 0)'), { r: 255, g: 0, b: 0, a: 255 });
  assert.deepStrictEqual(parseColor('rgb(0, 255, 0)'), { r: 0, g: 255, b: 0, a: 255 });
  assert.deepStrictEqual(parseColor('rgb(0, 0, 255)'), { r: 0, g: 0, b: 255, a: 255 });
});

test('should parse rgba colors', () => {
  assert.deepStrictEqual(parseColor('rgba(255, 0, 0, 1)'), { r: 255, g: 0, b: 0, a: 255 });
  assert.deepStrictEqual(parseColor('rgba(0, 255, 0, 0.5)'), { r: 0, g: 255, b: 0, a: 128 });
  assert.deepStrictEqual(parseColor('rgba(0, 0, 255, 0)'), { r: 0, g: 0, b: 255, a: 0 });
});

test('should parse hsl colors', () => {
  assert.deepStrictEqual(parseColor('hsl(0, 100%, 50%)'), { r: 255, g: 0, b: 0, a: 255 });
  assert.deepStrictEqual(parseColor('hsl(120, 100%, 50%)'), { r: 0, g: 255, b: 0, a: 255 });
  assert.deepStrictEqual(parseColor('hsl(240, 100%, 50%)'), { r: 0, g: 0, b: 255, a: 255 });
});

test('should parse hsla colors', () => {
  assert.deepStrictEqual(parseColor('hsla(0, 100%, 50%, 1)'), { r: 255, g: 0, b: 0, a: 255 });
  assert.deepStrictEqual(parseColor('hsla(120, 100%, 50%, 0.5)'), { r: 0, g: 255, b: 0, a: 128 });
  assert.deepStrictEqual(parseColor('hsla(240, 100%, 50%, 0)'), { r: 0, g: 0, b: 255, a: 0 });
});

test('should handle invalid colors', () => {
  assert.deepStrictEqual(parseColor('invalid-color'), { r: 0, g: 0, b: 0, a: 255 });
  assert.deepStrictEqual(parseColor(123), { r: 0, g: 0, b: 0, a: 255 });
  assert.deepStrictEqual(parseColor(null), { r: 0, g: 0, b: 0, a: 255 });
  assert.deepStrictEqual(parseColor(undefined), { r: 0, g: 0, b: 0, a: 255 });
});
