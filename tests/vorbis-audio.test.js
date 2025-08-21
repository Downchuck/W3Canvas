import { strict as assert } from 'assert';
import { test } from 'node:test';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Import my custom DOM classes
import { Element } from '../src/dom/html/dom_core.js';
import { Event } from '../src/dom/event.js';
import { HTMLDocument } from '../src/dom/html/dom_html_doc.js';
import { tags } from '../src/dom/html/dom_html_basic.js';

// Mock CustomEvent since it's not in the custom DOM implementation
class CustomEvent extends Event {
    constructor(type, options) {
        super(type);
        this.detail = options ? options.detail : null;
    }
}

// Ogg file for mocking fetch
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const oggBuffer = fs.readFileSync(path.resolve(__dirname, 'sample.ogg'));

// Mock customElements registry to hook into the custom DOM's `tags` map
const customElements = {
    define: function(name, constructor) {
        tags[name.toUpperCase()] = constructor;
    }
};

test('VorbisAudioElement should fire "load" event on success', async () => {
    // 1. Set up the global mocks
    global.HTMLElement = Element;
    global.customElements = customElements;
    global.Event = Event;
    global.CustomEvent = CustomEvent;
    global.fetch = async (url) => {
        console.log(`Mock fetch called for: ${url}`);
        return {
            ok: true,
            arrayBuffer: async () => oggBuffer,
        };
    };
    // Pass through console
    global.console = console;

    // 2. Dynamically import the custom element script to register it.
    // The import path is relative to this test file.
    await import('../examples/vorbis-audio/vorbis-audio.js');

    // 3. Create an instance of the element using the custom DOM.
    const doc = new HTMLDocument();
    const vorbisElement = doc.createElement('vorbis-audio');
    assert.ok(vorbisElement.constructor.name === 'VorbisAudioElement', 'Element should be of the correct class');

    // 4. Set up the event listener and trigger the load.
    const loadPromise = new Promise((resolve, reject) => {
        vorbisElement.addEventListener('load', resolve);
        vorbisElement.addEventListener('error', (e) => reject(e.detail.error));
    });

    // Call loadAudio directly since the custom DOM's setAttribute doesn't trigger attributeChangedCallback
    vorbisElement.loadAudio('fake.ogg');

    // 5. Await the result.
    await loadPromise;

    // 6. Clean up globals to avoid polluting other tests
    delete global.HTMLElement;
    delete global.customElements;
    delete global.Event;
    delete global.CustomEvent;
    delete global.fetch;
    delete global.console;
});
