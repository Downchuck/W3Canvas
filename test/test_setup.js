import { JSDOM } from 'jsdom';

const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
    url: "https://example.org/",
    referrer: "https://example.com/",
    contentType: "text/html",
    includeNodeLocations: true,
    storageQuota: 10000000
});

global.window = dom.window;
global.document = dom.window.document;
global.navigator = dom.window.navigator;

// Now, import the test file
import './test_svg.js';
import './test_svg_rect.js';
