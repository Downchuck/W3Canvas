import { FontFace, fontFaceSet } from './font_face.js';
import fs from 'fs';
import path from 'path';

export function parseFontFaceRules(cssText) {
    const fontFaceRegex = /@font-face\s*\{([^}]+)\}/g;
    let match;
    while ((match = fontFaceRegex.exec(cssText)) !== null) {
        const ruleBlock = match[1];

        const fontFamilyMatch = /font-family:\s*['"]?([^;'"]+)['"]?/.exec(ruleBlock);
        const srcMatch = /src:\s*url\((['"]?)(.*?)\1\)/.exec(ruleBlock);

        if (fontFamilyMatch && srcMatch) {
            const fontFamily = fontFamilyMatch[1];
            const url = srcMatch[2];

            // For now, we only support file:/// URIs
            if (url.startsWith('file:///')) {
                try {
                    // Convert file:/// URI to a local path
                    const filePath = path.normalize(url.substring(7)); // 7 chars for "file://"
                    const fontData = fs.readFileSync(filePath);
                    const fontFace = new FontFace(fontFamily, fontData);
                    fontFaceSet.add(fontFace);
                    console.log(`Loaded font: ${fontFamily} from ${filePath}`);
                } catch (e) {
                    console.error(`Failed to load font from ${url}: ${e.message}`);
                }
            }
        }
    }
}
