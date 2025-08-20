import fs from 'fs';
import { HTMLParser } from './src/dom/parser/html_parser.js';
import { CanvasRenderingContext2D } from './src/core/canvas/CanvasRenderingContext2D.js';
import { render } from './src/dom/renderer.js';
import { stbi_write_png_to_mem } from './src/stb-image/png_write.js';

// 1. Get the HTML file path from command line arguments
const htmlFilePath = process.argv[2];
if (!htmlFilePath) {
    console.error("Please provide a path to an HTML file.");
    process.exit(1);
}

// 2. Read the HTML file
const html = fs.readFileSync(htmlFilePath, 'utf-8');

// 3. Parse the HTML
const parser = new HTMLParser();
const doc = parser.parse(html);

// 4. Create a canvas and render the DOM
const ctx = new CanvasRenderingContext2D(600, 400);
render(doc.body, ctx);

// 5. Save the output to a PNG file using the ported stb_image_write
const out_len = { value: 0 };
const png_data = stbi_write_png_to_mem(ctx.imageData.data, ctx.width * 4, ctx.width, ctx.height, 4, out_len);

if (png_data) {
    const outputFileName = 'render_output.png';
    fs.writeFileSync(outputFileName, png_data);
    console.log(`Render output saved to ${outputFileName}`);
} else {
    console.error("Failed to generate PNG data.");
}
