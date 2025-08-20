import { test } from 'node:test';
import assert from 'node:assert';
import { CanvasRenderingContext2D } from '../src/core/canvas/CanvasRenderingContext2D.js';
import { SVGPathElement } from '../src/dom/svg/dom_svg_path.js';
import { Element } from '../src/dom/html/dom_core.js';
import { assertPixelIsColor } from './test-helpers.js';

test('SVG path element renders a triangle', () => {
    const ctx = new CanvasRenderingContext2D(100, 100);

    const canvas = new Element('CANVAS');
    canvas.getContext = (type) => {
        if (type === '2d') return ctx;
    };

    const path = new SVGPathElement();
    path.setD('M 10 10 L 90 10 L 50 90 Z');
    path.setFill('red');

    canvas.appendChild(path);

    path.repaint();

    const imageData = ctx.getImageData(50, 50, 1, 1);
    assertPixelIsColor(imageData, 0, 0, [255, 0, 0, 255]);
});

test('SVG path element renders with H command', () => {
    const ctx = new CanvasRenderingContext2D(100, 100);
    const canvas = new Element('CANVAS');
    canvas.getContext = () => ctx;

    const path = new SVGPathElement();
    path.setD('M 10 10 H 90');
    path.setStroke('blue');
    canvas.appendChild(path);
    path.repaint();

    const imageData = ctx.getImageData(50, 10, 1, 1);
    assertPixelIsColor(imageData, 0, 0, [0, 0, 255, 255]);
});

test('SVG path element renders with h command', () => {
    const ctx = new CanvasRenderingContext2D(100, 100);
    const canvas = new Element('CANVAS');
    canvas.getContext = () => ctx;

    const path = new SVGPathElement();
    path.setD('M 10 10 h 80');
    path.setStroke('green');
    canvas.appendChild(path);
    path.repaint();

    const imageData = ctx.getImageData(50, 10, 1, 1);
    assertPixelIsColor(imageData, 0, 0, [0, 255, 0, 255]);
});

test('SVG path element renders with V command', () => {
    const ctx = new CanvasRenderingContext2D(100, 100);
    const canvas = new Element('CANVAS');
    canvas.getContext = () => ctx;

    const path = new SVGPathElement();
    path.setD('M 10 10 V 90');
    path.setStroke('purple');
    canvas.appendChild(path);
    path.repaint();

    const imageData = ctx.getImageData(10, 50, 1, 1);
    assertPixelIsColor(imageData, 0, 0, [128, 0, 128, 255]);
});

test('SVG path element renders with v command', () => {
    const ctx = new CanvasRenderingContext2D(100, 100);
    const canvas = new Element('CANVAS');
    canvas.getContext = () => ctx;

    const path = new SVGPathElement();
    path.setD('M 10 10 v 80');
    path.setStroke('orange');
    canvas.appendChild(path);
    path.repaint();

    const imageData = ctx.getImageData(10, 50, 1, 1);
    assertPixelIsColor(imageData, 0, 0, [255, 165, 0, 255]);
});

test('SVG path element renders with C command', () => {
    const ctx = new CanvasRenderingContext2D(100, 100);
    const canvas = new Element('CANVAS');
    canvas.getContext = () => ctx;

    const path = new SVGPathElement();
    path.setD('M 10 50 C 30 10, 70 10, 90 50');
    path.setStroke('red');
    canvas.appendChild(path);
    path.repaint();

    const imageData = ctx.getImageData(50, 20, 1, 1);
    assertPixelIsColor(imageData, 0, 0, [255, 0, 0, 255]);
});

test('SVG path element renders with c command', () => {
    const ctx = new CanvasRenderingContext2D(100, 100);
    const canvas = new Element('CANVAS');
    canvas.getContext = () => ctx;

    const path = new SVGPathElement();
    path.setD('M 10 50 c 20 -40, 60 -40, 80 0');
    path.setStroke('blue');
    canvas.appendChild(path);
    path.repaint();

    const imageData = ctx.getImageData(50, 20, 1, 1);
    assertPixelIsColor(imageData, 0, 0, [0, 0, 255, 255]);
});
