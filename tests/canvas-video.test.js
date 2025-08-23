import test from 'node:test';
import assert from 'node:assert';
import { HTMLDocument } from '../src/dom/html/dom_html_doc.js';
import '../examples/canvas-video/canvas-video.js';

test('CanvasVideoElement', async (t) => {
    const document = new HTMLDocument();

    await t.test('should create a canvas-video element', () => {
        const video = document.createElement('canvas-video');
        assert.ok(video);
    });

    await t.test('should be paused by default', () => {
        const video = document.createElement('canvas-video');
        assert.strictEqual(video.paused, true);
    });

    await t.test('should play when play() is called', () => {
        const video = document.createElement('canvas-video');
        video.play();
        assert.strictEqual(video.paused, false);
    });

    await t.test('should pause when pause() is called', () => {
        const video = document.createElement('canvas-video');
        video.play();
        video.pause();
        assert.strictEqual(video.paused, true);
    });
});
