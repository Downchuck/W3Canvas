import { describe, it } from 'node:test';
import * as assert from 'node:assert';
import { HTMLCanvasElement } from '../src/dom/html/dom_html_canvas.js';
import { HTMLImageElement } from '../src/dom/html/dom_html_image.js';
import * as fs from 'node:fs';

describe('Canvas PNG', () => {
    it('should generate a valid PNG data URL from a blank canvas', () => {
        const canvas = new HTMLCanvasElement();
        canvas.setWidth(10);
        canvas.setHeight(10);
        const ctx = canvas.getContext('2d');
        assert.ok(ctx, 'should get a 2d context');

        const dataURL = canvas.toDataURL('image/png');
        assert.ok(dataURL, 'should get a data URL');
        assert.ok(dataURL.startsWith('data:image/png;base64,'), 'should be a PNG data URL');

        const base64Data = dataURL.substring('data:image/png;base64,'.length);
        const buffer = Buffer.from(base64Data, 'base64');

        // Check for PNG signature
        assert.strictEqual(buffer[0], 137, 'PNG signature byte 0 should be 137');
        assert.strictEqual(buffer[1], 80, 'PNG signature byte 1 should be 80');
        assert.strictEqual(buffer[2], 78, 'PNG signature byte 2 should be 78');
        assert.strictEqual(buffer[3], 71, 'PNG signature byte 3 should be 71');
    });

    it('should draw an image and export it back to a data URL', (done) => {
        const img = new HTMLImageElement();
        img.onload = () => {
            const canvas = new HTMLCanvasElement();
            canvas.setWidth(img.width);
            canvas.setHeight(img.height);
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);

            const dataURL = canvas.toDataURL('image/png');
            assert.ok(dataURL, 'should get a data URL after drawing an image');
            assert.ok(dataURL.startsWith('data:image/png;base64,'), 'should be a PNG data URL');

            const base64Data = dataURL.substring('data:image/png;base64,'.length);
            const buffer = Buffer.from(base64Data, 'base64');

            // Very basic check: does it look like a PNG?
            assert.ok(buffer.length > 100, "PNG data should not be empty");
            assert.strictEqual(buffer[0], 137, 'PNG signature byte 0 should be 137');

            // A more thorough test would be to decode the generated PNG
            // and compare pixel data, but for now, this is a good start.

            done();
        };
        img.onerror = (err) => {
            done(err);
        }
        img.src = 'test/images/tp1n3p08.png';
    });
});
