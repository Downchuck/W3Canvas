import { FontFace } from './font_face.js';
import path from 'path';

/**
 * Parses @font-face rules from a CSS text and adds them to the given scope's FontFaceSet.
 * @param {string} cssText - The CSS text to parse.
 * @param {GlobalScope} scope - The global scope whose FontFaceSet will be used.
 */
export function parseFontFaceRules(cssText, scope) {
    const fontFaceRegex = /@font-face\s*\{([^}]+)\}/g;
    let match;
    while ((match = fontFaceRegex.exec(cssText)) !== null) {
        const ruleBlock = match[1];

        const fontFamilyMatch = /font-family:\s*['"]?([^;'"]+)['"]?/.exec(ruleBlock);
        const srcMatch = /src:\s*url\((['"]?)(.*?)\1\)/.exec(ruleBlock);
        // A real implementation would parse other descriptors too (weight, style, etc.)

        if (fontFamilyMatch && srcMatch) {
            const fontFamily = fontFamilyMatch[1];
            const url = srcMatch[2];

            // Create a new FontFace object. The source is the URL.
            const fontFace = new FontFace(fontFamily, url);

            // Add it to the FontFaceSet of the provided scope.
            // The `add` method will automatically trigger the `load()` method.
            scope.fonts.add(fontFace);

            console.log(`Scheduled loading of font: ${fontFamily} from ${url}`);
        }
    }
}
