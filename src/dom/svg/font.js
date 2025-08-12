import { parsePath } from './path_parser.js';
import fs from 'fs';
import jsdom from 'jsdom';
const { JSDOM } = jsdom;

export class Font {
    constructor(url) {
        this.url = url;
        this.glyphs = {};
        this.load();
    }

    load() {
        try {
            const svgText = fs.readFileSync(this.url, 'utf-8');
            this.parseFont(svgText);
        } catch (error) {
            console.error("Failed to load font:", this.url, error);
        }
    }

    parseFont(svgText) {
        const dom = new JSDOM(svgText, { contentType: 'image/svg+xml' });
        const doc = dom.window.document;
        const font = doc.querySelector("font");
        this.horizAdvX = parseFloat(font.getAttribute("horiz-adv-x"));
        const fontFace = font.querySelector("font-face");
        this.unitsPerEm = parseFloat(fontFace.getAttribute("units-per-em"));
        this.ascent = parseFloat(fontFace.getAttribute("ascent"));
        this.descent = parseFloat(fontFace.getAttribute("descent"));

        const glyphs = font.querySelectorAll("glyph");
        for (const glyph of glyphs) {
            const unicode = glyph.getAttribute("unicode");
            const d = glyph.getAttribute("d");
            const horizAdvX = glyph.getAttribute("horiz-adv-x");
            this.glyphs[unicode] = {
                d: d,
                horizAdvX: horizAdvX ? parseFloat(horizAdvX) : this.horizAdvX,
                path: d ? parsePath(d) : null
            };
        }
    }

    renderText(ctx, text, x, y, fontSize) {
        const scale = fontSize / this.unitsPerEm;
        let currentX = x;

        for (const char of text) {
            const glyph = this.glyphs[char];
            if (glyph) {
                if (glyph.path) {
                    ctx.save();
                    ctx.translate(currentX, y);
                    ctx.scale(scale, -scale); // Flip Y-axis because SVG fonts have y=0 at the baseline
                    ctx.translate(0, -this.ascent);

                    ctx.beginPath();
                    for (const command of glyph.path) {
                        switch (command.type) {
                            case 'M':
                                ctx.moveTo(command.x, command.y);
                                break;
                            case 'L':
                                ctx.lineTo(command.x, command.y);
                                break;
                            case 'Z':
                                ctx.closePath();
                                break;
                        }
                    }
                    if (ctx.fillStyle && ctx.fillStyle !== 'none') {
                        ctx.fill();
                    }
                    if (ctx.strokeStyle && ctx.strokeStyle !== 'none') {
                        ctx.stroke();
                    }
                    ctx.restore();
                }
                currentX += glyph.horizAdvX * scale;
            }
        }
    }
}
