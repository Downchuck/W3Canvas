import { test } from 'node:test';
import assert from 'node:assert';
import { Line } from '../src/dom/svg/dom_svg_line.js';
import { Circle } from '../src/dom/svg/dom_svg_circle.js';
import { Ellipse } from '../src/dom/svg/dom_svg_ellipse.js';
import { Rectangle } from '../src/dom/svg/dom_svg_rect.js';
import { Image as SVGImage } from '../src/dom/svg/dom_svg_image.js';

const createMockContext = () => ({
    lineWidth: 1, // Default value
    fillStyle: '',
    strokeStyle: '',
    beginPath: () => {},
    moveTo: () => {},
    lineTo: () => {},
    arc: () => {},
    ellipse: () => {},
    rect: () => {},
    bezierCurveTo: () => {},
    closePath: () => {},
    fill: () => {},
    stroke: () => {}
});

const createMockCanvas = (context) => ({
    tagName: 'CANVAS',
    getContext: (type) => {
        if (type === '2d') return context;
    },
    getParent: () => null
});

test('SVG line element applies stroke-width', () => {
    const mockContext = createMockContext();
    const mockCanvas = createMockCanvas(mockContext);
    const line = new Line();
    line.setStroke('black');
    line.setStrokeWidth(5);
    line.getParent = () => mockCanvas;

    line.repaint();

    assert.strictEqual(mockContext.lineWidth, 5, 'Line: context.lineWidth should be updated to the stroke-width');
});

test('SVG circle element applies stroke-width', () => {
    const mockContext = createMockContext();
    const mockCanvas = createMockCanvas(mockContext);
    const circle = new Circle();
    circle.setStroke('black');
    circle.setStrokeWidth(10);
    circle.getParent = () => mockCanvas;

    circle.repaint();

    assert.strictEqual(mockContext.lineWidth, 10, 'Circle: context.lineWidth should be updated to the stroke-width');
});

test('SVG ellipse element applies stroke-width', () => {
    const mockContext = createMockContext();
    const mockCanvas = createMockCanvas(mockContext);
    const ellipse = new Ellipse();
    ellipse.setStroke('black');
    ellipse.setStrokeWidth(2.5);
    ellipse.getParent = () => mockCanvas;

    ellipse.repaint();

    assert.strictEqual(mockContext.lineWidth, 2.5, 'Ellipse: context.lineWidth should be updated to the stroke-width');
});

test('SVG rect element applies stroke-width', () => {
    const mockContext = createMockContext();
    const mockCanvas = createMockCanvas(mockContext);
    const rect = new Rectangle();
    rect.setStroke('black');
    rect.setStrokeWidth(7);
    rect.getParent = () => mockCanvas;

    rect.repaint();

    assert.strictEqual(mockContext.lineWidth, 7, 'Rectangle: context.lineWidth should be updated to the stroke-width');
});

test('SVG image element calls drawImage on repaint', (t) => {
    // 1. Arrange
    const mockImageData = { w: 20, h: 30, data: new Uint8ClampedArray(2400) };
    const mockLoader = () => mockImageData;
    let drawImageCalled = false;
    let drawImageArgs = null;

    const mockContext = {
        ...createMockContext(),
        drawImage: (...args) => {
            drawImageCalled = true;
            drawImageArgs = args;
        }
    };
    const mockCanvas = createMockCanvas(mockContext);

    const image = new SVGImage();
    image.setX(50);
    image.setY(60);
    image.setWidth(100);
    image.setHeight(120);
    image.getParent = () => mockCanvas;

    // 2. Act
    // Call _loadImage directly with a dummy buffer and our mock loader
    image._loadImage(Buffer.from(''), mockLoader);

    // 3. Assert
    assert.strictEqual(drawImageCalled, true, 'context.drawImage should have been called');
    assert.deepStrictEqual(drawImageArgs[0], { data: mockImageData.data, width: mockImageData.w, height: mockImageData.h }, 'drawImage should be called with the correct image data');
    assert.strictEqual(drawImageArgs[1], 50, 'drawImage should be called with the correct x coordinate');
    assert.strictEqual(drawImageArgs[2], 60, 'drawImage should be called with the correct y coordinate');
    assert.strictEqual(drawImageArgs[3], 100, 'drawImage should be called with the correct width');
    assert.strictEqual(drawImageArgs[4], 120, 'drawImage should be called with the correct height');
});
