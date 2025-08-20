import { test } from 'node:test';
import assert from 'node:assert';
import { FontFace, fontFaceSet } from '../src/dom/css/font_face.js';
import fs from 'fs';

test('FontFace API basic functionality', async () => {
    // 1. Create a new FontFace object from a local file buffer
    const fontBuffer = fs.readFileSync('./fonts/DejaVuSans.ttf');
    const myFont = new FontFace('My Test Font', fontBuffer, {
        weight: 'bold'
    });

    // 2. Check initial status
    // Because we load from a buffer, it should be 'loaded' immediately.
    assert.strictEqual(myFont.status, 'loaded', 'Font status should be "loaded" immediately when created from a buffer.');

    // 3. Load the font (which should return a resolved promise)
    const loadedFont = await myFont.load();
    assert.strictEqual(loadedFont, myFont, 'load() should resolve with the FontFace instance.');
    assert.strictEqual(myFont.status, 'loaded', 'Font status should remain "loaded".');

    // 4. Add the font to the FontFaceSet
    fontFaceSet.add(myFont);

    // 5. Use check() to see if the font is available
    assert.ok(fontFaceSet.check('20px "My Test Font"'), 'check() should find the font by family name.');
    assert.ok(fontFaceSet.check('bold 20px "My Test Font"'), 'check() should find the font by family and weight.');
    assert.strictEqual(fontFaceSet.check('20px "Another Font"'), false, 'check() should not find a font that does not exist.');

    // 6. Use find() to retrieve the font
    const foundFont = fontFaceSet.find('My Test Font', { weight: 'bold' });
    assert.strictEqual(foundFont, myFont, 'find() should retrieve the correct FontFace instance.');

    // 7. Clean up
    fontFaceSet.delete(myFont);
    assert.strictEqual(fontFaceSet.check('20px "My Test Font"'), false, 'check() should not find the font after it has been deleted.');
});
