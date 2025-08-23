import { test } from 'node:test';
import assert from 'node:assert';
import { FontFace, FontFaceSet } from '../src/dom/css/font_face.js';
import path from 'path';
import { pathToFileURL } from 'url';

const createSpy = () => {
    let called = false;
    let callCount = 0;
    let args = null;
    const spy = (...theArgs) => {
        called = true;
        callCount++;
        args = theArgs;
    };
    spy.wasCalled = () => called;
    spy.callCount = () => callCount;
    spy.getArgs = () => args;
    return spy;
};

test('FontFace: should load a font from a file URL', async (t) => {
    const fontPath = path.resolve(process.cwd(), 'fonts/DejaVuSans.ttf');
    const fontURL = pathToFileURL(fontPath).href;
    const fontFace = new FontFace('DejaVu Sans', fontURL);

    await fontFace.load();

    assert.strictEqual(fontFace.status, 'loaded', 'Font status should be "loaded"');
    assert.ok(fontFace.fontData, 'fontData should not be null');
});

test('FontFaceSet: should trigger onloading and onloadingdone events', async (t) => {
    const fontPath = path.resolve(process.cwd(), 'fonts/DejaVuSans.ttf');
    const fontURL = pathToFileURL(fontPath).href;
    const fontFace = new FontFace('DejaVu Sans', fontURL);

    const fontFaceSet = new FontFaceSet();
    const onloadingSpy = createSpy();
    const onloadingdoneSpy = createSpy();
    const onloadingerrorSpy = createSpy();

    fontFaceSet.onloading = onloadingSpy;
    fontFaceSet.onloadingdone = onloadingdoneSpy;
    fontFaceSet.onloadingerror = onloadingerrorSpy;

    fontFaceSet.add(fontFace);

    await fontFaceSet.ready;

    assert.ok(onloadingSpy.wasCalled(), 'onloading should have been called');
    assert.strictEqual(onloadingSpy.callCount(), 1, 'onloading should be called once');
    assert.ok(onloadingdoneSpy.wasCalled(), 'onloadingdone should have been called');
    assert.strictEqual(onloadingdoneSpy.callCount(), 1, 'onloadingdone should be called once');
    assert.strictEqual(onloadingerrorSpy.wasCalled(), false, 'onloadingerror should not have been called');
});

test('FontFaceSet: should trigger onloadingerror for a non-existent font', async (t) => {
    const fontFace = new FontFace('NonExistentFont', 'file:///non/existent/font.ttf');

    const fontFaceSet = new FontFaceSet();
    const onloadingSpy = createSpy();
    const onloadingdoneSpy = createSpy();
    const onloadingerrorSpy = createSpy();

    fontFaceSet.onloading = onloadingSpy;
    fontFaceSet.onloadingdone = onloadingdoneSpy;
    fontFaceSet.onloadingerror = onloadingerrorSpy;

    fontFaceSet.add(fontFace);

    await fontFaceSet.ready;

    assert.ok(onloadingSpy.wasCalled(), 'onloading should have been called');
    assert.ok(onloadingdoneSpy.wasCalled(), 'onloadingdone should have been called');
    assert.ok(onloadingerrorSpy.wasCalled(), 'onloadingerror should have been called');
    assert.strictEqual(fontFace.status, 'error', 'Font status should be "error"');
});
