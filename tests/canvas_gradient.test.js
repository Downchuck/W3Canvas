import { CanvasRenderingContext2D } from '../src/core/canvas/CanvasRenderingContext2D.js';
import { CanvasGradient } from '../src/core/canvas/CanvasGradient.js';

test('CanvasRenderingContext2D.createLinearGradient creates a CanvasGradient object', () => {
    const ctx = new CanvasRenderingContext2D(100, 100);
    const gradient = ctx.createLinearGradient(0, 0, 100, 100);
    expect(gradient).toBeInstanceOf(CanvasGradient);
    expect(gradient.x0).toBe(0);
    expect(gradient.y0).toBe(0);
    expect(gradient.x1).toBe(100);
    expect(gradient.y1).toBe(100);
});

test('CanvasGradient.addColorStop adds color stops correctly', () => {
    const gradient = new CanvasGradient(0, 0, 100, 100);
    gradient.addColorStop(0, 'black');
    gradient.addColorStop(1, 'white');
    gradient.addColorStop(0.5, 'red');
    expect(gradient.colorStops.length).toBe(3);
    expect(gradient.colorStops[0]).toEqual({ offset: 0, color: 'black' });
    expect(gradient.colorStops[1]).toEqual({ offset: 0.5, color: 'red' });
    expect(gradient.colorStops[2]).toEqual({ offset: 1, color: 'white' });
});

test('Gradient fillStyle renders a gradient', () => {
    const ctx = new CanvasRenderingContext2D(2, 1);
    const gradient = ctx.createLinearGradient(0, 0, 1, 0);
    gradient.addColorStop(0, '#000000');
    gradient.addColorStop(1, '#ffffff');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 2, 1);

    const imageData = ctx.getImageData(0, 0, 2, 1);
    // First pixel should be close to black
    expect(imageData.data[0]).toBeLessThan(10);
    expect(imageData.data[1]).toBeLessThan(10);
    expect(imageData.data[2]).toBeLessThan(10);
    // Last pixel should be close to white
    expect(imageData.data[4]).toBeGreaterThan(245);
    expect(imageData.data[5]).toBeGreaterThan(245);
    expect(imageData.data[6]).toBeGreaterThan(245);
});
