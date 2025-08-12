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

    expect(mockContext.lineWidth).toBe(5);
});

test('SVG circle element applies stroke-width', () => {
    const mockContext = createMockContext();
    const mockCanvas = createMockCanvas(mockContext);
    const circle = new Circle();
    circle.setStroke('black');
    circle.setStrokeWidth(10);
    circle.getParent = () => mockCanvas;

    circle.repaint();

    expect(mockContext.lineWidth).toBe(10);
});

test('SVG ellipse element applies stroke-width', () => {
    const mockContext = createMockContext();
    const mockCanvas = createMockCanvas(mockContext);
    const ellipse = new Ellipse();
    ellipse.setStroke('black');
    ellipse.setStrokeWidth(2.5);
    ellipse.getParent = () => mockCanvas;

    ellipse.repaint();

    expect(mockContext.lineWidth).toBe(2.5);
});

test('SVG rect element applies stroke-width', () => {
    const mockContext = createMockContext();
    const mockCanvas = createMockCanvas(mockContext);
    const rect = new Rectangle();
    rect.setStroke('black');
    rect.setStrokeWidth(7);
    rect.getParent = () => mockCanvas;

    rect.repaint();

    expect(mockContext.lineWidth).toBe(7);
});

test('SVG image element calls drawImage on repaint', () => {
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
    expect(drawImageCalled).toBe(true);
    expect(drawImageArgs[0]).toEqual({ data: mockImageData.data, width: mockImageData.w, height: mockImageData.h });
    expect(drawImageArgs[1]).toBe(50);
    expect(drawImageArgs[2]).toBe(60);
    expect(drawImageArgs[3]).toBe(100);
    expect(drawImageArgs[4]).toBe(120);
});
