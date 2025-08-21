import { test } from 'node:test';
import assert from 'node:assert';
import { CanvasRenderingContext2D } from '../src/core/canvas/CanvasRenderingContext2D.js';
import { createCanvas } from 'canvas';
import fs from 'fs';

test('fillText with identity transform', async (t) => {
    const ctx = new CanvasRenderingContext2D(100, 100);
    ctx.fillStyle = 'green';
    ctx.font = '20px sans-serif';
    ctx.fillText('Hi', 10, 20);

    const imageData = ctx.getImageData(0, 0, 100, 100);

    const canvas = createCanvas(100, 100);
    const canvasCtx = canvas.getContext('2d');
    const newImageData = canvasCtx.createImageData(100, 100);
    newImageData.data.set(imageData.data);
    canvasCtx.putImageData(newImageData, 0, 0);

    const out = fs.createWriteStream('test_output.png');
    const stream = canvas.createPNGStream();
    stream.pipe(out);
    await new Promise((resolve) => out.on('finish', resolve));
    console.log('The PNG file was created.');

    assert.strictEqual(imageData.data[1*4+1], 255, 'Green channel should be 255');
});

test.skip('strokeText with identity transform', (t) => {
    const ctx = new CanvasRenderingContext2D(100, 100);
    ctx.strokeStyle = 'blue';
    ctx.font = '20px sans-serif';
    ctx.strokeText('Hi', 10, 50);

    const imageData = ctx.getImageData(15, 55, 1, 1).data;
    assert.strictEqual(imageData[2], 255, 'Blue channel should be 255');
});

test('fillRect with translation', (t) => {
    const ctx = new CanvasRenderingContext2D(100, 100);
    ctx.translate(10, 20);
    ctx.fillStyle = 'red';
    ctx.fillRect(0, 0, 10, 10);

    const imageData = ctx.getImageData(0, 0, 100, 100);
    const { data, width } = imageData;

    let x = 15;
    let y = 25;
    let index = (y * width + x) * 4;
    assert.strictEqual(data[index], 255, 'Red channel should be 255');

    x = 5;
    y = 5;
    index = (y * width + x) * 4;
    assert.strictEqual(data[index + 3], 0, 'Pixel at original location should be transparent');
});

test('strokeRect with rotation', (t) => {
    const ctx = new CanvasRenderingContext2D(100, 100);
    ctx.strokeStyle = 'blue';
    ctx.translate(50, 50);
    ctx.rotate(Math.PI / 4); // 45 degrees
    ctx.strokeRect(-10, -10, 20, 20);

    const imageData = ctx.getImageData(0, 0, 100, 100);
    const { data, width } = imageData;

    let x = 64;
    let y = 50;
    let index = (y * width + x) * 4;
    assert.strictEqual(data[index + 2], 255, 'Blue channel should be 255 at rotated corner');
});

test('drawImage with rotation', (t) => {
    const ctx = new CanvasRenderingContext2D(100, 100);
    const image = {
        width: 10,
        height: 10,
        data: new Uint8ClampedArray(10 * 10 * 4).fill(255) // Solid white image
    };

    ctx.translate(50, 50);
    ctx.rotate(Math.PI / 4);
    ctx.drawImage(image, -5, -5);

    const imageData = ctx.getImageData(50, 50, 1, 1).data;
    assert.strictEqual(imageData[0], 255, 'Center pixel should be white');
});
