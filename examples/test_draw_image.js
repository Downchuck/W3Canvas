import { CanvasRenderingContext2D } from '../src/core/canvas/CanvasRenderingContext2D.js';
import { HTMLImageElement } from '../src/dom/html/dom_html_image.js';

function assertPixel(imageData, x, y, r, g, b, a, message) {
  const index = (y * imageData.width + x) * 4;
  if (imageData.data[index] !== r ||
      imageData.data[index + 1] !== g ||
      imageData.data[index + 2] !== b ||
      imageData.data[index + 3] !== a) {
    throw new Error(`Assertion failed for pixel (${x},${y}): ${message} - expected (${r},${g},${b},${a}), but got (${imageData.data[index]},${imageData.data[index+1]},${imageData.data[index+2]},${imageData.data[index+3]})`);
  }
}

async function runDrawImageTests() {
  console.log('Running drawImage tests...');

  const image = new HTMLImageElement();
  const imageUrl = 'examples/marilyn_th.jpg';

  await new Promise((resolve, reject) => {
    image.onload = resolve;
    image.onerror = reject;
    image.src = imageUrl;
  });

  console.log(`Image loaded: ${image.width}x${image.height}`);

  // Test 1: Simple drawImage(image, dx, dy)
  let ctx = new CanvasRenderingContext2D(200, 200);
  ctx.drawImage(image, 10, 20);
  // We can't easily assert pixel values for a complex image without having a reference image.
  // Instead, we will check if a pixel in the drawn area is not transparent black anymore.
  let index = (25 * ctx.imageData.width + 15) * 4;
  if (ctx.imageData.data[index+3] === 0) {
    throw new Error('Test 1 failed: Image was not drawn.');
  }
  console.log('Passed test 1: drawImage(image, dx, dy)');


  // Test 2: drawImage(image, dx, dy, dWidth, dHeight) - scaling
  ctx = new CanvasRenderingContext2D(200, 200);
  ctx.drawImage(image, 10, 20, image.width * 2, image.height * 2);
  index = (25 * ctx.imageData.width + 15) * 4;
  if (ctx.imageData.data[index+3] === 0) {
    throw new Error('Test 2 failed: Scaled image was not drawn.');
  }
  console.log('Passed test 2: drawImage(image, dx, dy, dWidth, dHeight)');


  // Test 3: drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight) - clipping and scaling
  ctx = new CanvasRenderingContext2D(200, 200);
  // Draw a 10x10 chunk from the source image at (5,5) to the canvas at (30,40) with size 50x50
  ctx.drawImage(image, 5, 5, 10, 10, 30, 40, 50, 50);
  index = (45 * ctx.imageData.width + 35) * 4;
  if (ctx.imageData.data[index+3] === 0) {
    throw new Error('Test 3 failed: Clipped and scaled image was not drawn.');
  }
  console.log('Passed test 3: drawImage with all arguments');

  console.log('All drawImage tests passed!');
}

async function renderOnPage() {
    const canvas = document.getElementById('testCanvas');
    if (!canvas) {
        console.log("No canvas found on page, skipping render.");
        return;
    }
    const pageCtx = canvas.getContext('2d');

    const image = new HTMLImageElement();
    const imageUrl = 'marilyn_th.jpg'; // Relative to the HTML file

    await new Promise((resolve, reject) => {
        image.onload = resolve;
        image.onerror = reject;
        image.src = imageUrl;
    });

    const customCtx = new CanvasRenderingContext2D(canvas.width, canvas.height);
    customCtx.fillStyle = '#f0f0f0';
    customCtx.fillRect(0,0,canvas.width, canvas.height);

    // Test 1
    customCtx.drawImage(image, 10, 10);

    // Test 2
    customCtx.drawImage(image, 150, 10, 50, 50);

    // Test 3
    customCtx.drawImage(image, 20, 20, 30, 30, 10, 150, 60, 60);

    // Now, copy the result to the visible canvas
    const finalImageData = pageCtx.createImageData(customCtx.imageData.width, customCtx.imageData.height);
    finalImageData.data.set(customCtx.imageData.data);
    pageCtx.putImageData(finalImageData, 0, 0);
}


// This allows the script to run in both Node.js for testing and in the browser for viewing
if (typeof window === 'undefined') {
  runDrawImageTests().catch(e => {
    console.error(e);
    process.exit(1);
  });
} else {
  renderOnPage().catch(console.error);
}
