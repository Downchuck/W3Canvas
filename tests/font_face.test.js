import { test } from 'node:test';
import assert from 'node:assert';
import { BoxModelPainter } from '../src/dom/css/box_paint.js';

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

    const mockFont = {
        getScaleFactor: () => 0.1,
        getTextColor: () => 'red',
    };

    const painter = new BoxModelPainter();
    const contentBox = { x: 10, y: 20, width: 100, height: 50 };

    // Act
    painter.paintText(mockContext, contentBox, 'Hello', mockFont);

    // Assert
    const expectedFontSize = 220 * 0.1;
    const expectedBaseline = 160 * 0.1;

    assert.strictEqual(mockContext.save.wasCalled(), true, 'save() should be called');
    assert.deepStrictEqual(mockContext.translate.getArgs(), [10, 20], 'translate() should be called with correct args');
    assert.strictEqual(mockContext.font, `${expectedFontSize}px Arial`, 'font should be set correctly');
    assert.strictEqual(mockContext.fillStyle, 'red', 'fillStyle should be set correctly');
    assert.strictEqual(mockContext.textBaseline, 'alphabetic', 'textBaseline should be set correctly');
    assert.deepStrictEqual(mockContext.fillText.getArgs(), ['Hello', 0, expectedBaseline], 'fillText() should be called with correct args');
    assert.strictEqual(mockContext.restore.wasCalled(), true, 'restore() should be called');
});
