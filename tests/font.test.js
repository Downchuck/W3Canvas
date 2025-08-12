import { BoxModelPainter } from '../src/dom/css/box_paint.js';
import { Font } from '../src/dom/css/font.js';

const createSpy = () => {
    let called = false;
    let args = null;
    const spy = (...theArgs) => {
        called = true;
        args = theArgs;
    };
    spy.wasCalled = () => called;
    spy.getArgs = () => args;
    return spy;
};

test('Font Implementation: should call fillText with the correct parameters', () => {
    // Arrange
    const mockContext = {
        save: createSpy(),
        restore: createSpy(),
        beginPath: createSpy(),
        rect: createSpy(),
        clip: createSpy(),
        closePath: createSpy(),
        translate: createSpy(),
        fillText: createSpy(),
        font: '',
        fillStyle: '',
        textBaseline: '',
    };

    const mockFont = new Font('Verdana', 22, 'blue');
    mockFont.setScaleFactor(0.1);

    const painter = new BoxModelPainter();
    const contentBox = { x: 10, y: 20, width: 100, height: 50 };

    // Act
    painter.paintText(mockContext, contentBox, 'Hello', mockFont);

    // Assert
    const expectedFontSize = 220 * 0.1;
    const expectedBaseline = 160 * 0.1;

    expect(mockContext.save.wasCalled()).toBe(true);
    expect(mockContext.translate.getArgs()).toEqual([10, 20]);
    expect(mockContext.font).toBe(`${expectedFontSize}px Verdana`);
    expect(mockContext.fillStyle).toBe('blue');
    expect(mockContext.textBaseline).toBe('alphabetic');
    expect(mockContext.fillText.getArgs()).toEqual(['Hello', 0, expectedBaseline]);
    expect(mockContext.restore.wasCalled()).toBe(true);
});
