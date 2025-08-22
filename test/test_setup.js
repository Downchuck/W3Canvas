import { HTMLDocument } from '../src/dom/html/dom_html_doc.js';
import '../src/dom/html/dom_html_canvas.js';
import '../src/dom/svg/dom_svg_path.js';
import '../src/dom/svg/dom_svg_rect.js';

// Create a fresh document for this test run to avoid state pollution.
const doc = new HTMLDocument();
global.document = doc;

// Create a mock window object.
global.window = {
    document: doc,
    navigator: {
        userAgent: 'node.js'
    }
};

// Now, import the test files that rely on this setup.
import './test_svg.js';
import './test_svg_rect.js';
