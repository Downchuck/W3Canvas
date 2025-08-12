const { describe, it, expect } = require('@jest/globals');
const { BoxModelPainter } = require('../src/dom/css/box_paint.js');

describe('Font Implementation', () => {
    it('should call fillText with the correct parameters', () => {
        const mockContext = {
            save: jest.fn(),
            restore: jest.fn(),
            beginPath: jest.fn(),
            rect: jest.fn(),
            clip: jest.fn(),
            translate: jest.fn(),
            fillText: jest.fn(),
        };

        const mockFont = {
            getScaleFactor: () => 0.1,
            getTextColor: () => 'red',
        };

        const painter = new BoxModelPainter();
        const contentBox = { x: 10, y: 20, width: 100, height: 50 };

        painter.paintText(mockContext, contentBox, 'Hello', mockFont);

        const expectedFontSize = 220 * 0.1;
        const expectedBaseline = 160 * 0.1;

        expect(mockContext.save).toHaveBeenCalled();
        expect(mockContext.translate).toHaveBeenCalledWith(10, 20);
        expect(mockContext.font).toBe(`${expectedFontSize}px Arial`);
        expect(mockContext.fillStyle).toBe('red');
        expect(mockContext.textBaseline).toBe('alphabetic');
        expect(mockContext.fillText).toHaveBeenCalledWith('Hello', 0, expectedBaseline);
        expect(mockContext.restore).toHaveBeenCalled();
    });
});
