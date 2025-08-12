const fs = require('fs');
const path = require('path');
const { loadImageFromMemory, getImageInfoFromMemory } = require('../stb-image.js');

function assert(condition, message) {
    if (!condition) {
        throw new Error(message || "Assertion failed");
    }
}

function test(name, fn) {
    try {
        fn();
        console.log(`✓ ${name}`);
    } catch (e) {
        console.error(`✗ ${name}: ${e.message}`);
        process.exit(1);
    }
}

const imagesDir = path.join(__dirname, 'images');
if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir);
}

const imageFiles = fs.readdirSync(imagesDir).filter(f => !f.startsWith('.')); // Ignore dotfiles

console.log("Running tests for stb-image.js...");

if (imageFiles.length === 0) {
    console.log("No images found in test/images directory. Skipping decoder tests.");
} else {
    imageFiles.forEach(file => {
        const imagePath = path.join(imagesDir, file);
        const buffer = fs.readFileSync(imagePath);

        test(`Info parsing for ${file}`, () => {
            const info = getImageInfoFromMemory(buffer);
            assert(info !== null, "getImageInfoFromMemory should not return null");
            assert(info.w > 0, "Image width must be positive");
            assert(info.h > 0, "Image height must be positive");
            assert(info.comp > 0, "Image components must be positive");
        });

        test(`Loading for ${file}`, () => {
            const image = loadImageFromMemory(buffer);
            assert(image !== null, "loadImageFromMemory should not return null");
            assert(image.data instanceof Uint8Array, "Image data should be a Uint8Array");
            assert(image.w > 0, "Image width must be positive");
            assert(image.h > 0, "Image height must be positive");
            assert(image.n > 0, "Image components must be positive");
            assert(image.data.length === image.w * image.h * image.n, "Image data size should match dimensions");
        });
    });
}

console.log("All tests passed (for the available images).");
