import { CanvasRenderingContext2D } from '../src/core/canvas/CanvasRenderingContext2D.js';
import { SVGPathElement } from '../src/dom/svg/dom_svg_path.js';
import { Element } from '../src/dom/html/dom_core.js';

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
    expect(imageData.data[0]).toBe(255);
    expect(imageData.data[1]).toBe(0);
    expect(imageData.data[2]).toBe(0);
    expect(imageData.data[3]).toBe(255);
});
