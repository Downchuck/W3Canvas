import { HTMLParser } from '../src/dom/parser/html_parser.js';
import { render } from '../src/dom/renderer.js';
import { EventDispatcher } from '../src/dom/event_dispatcher.js';
import { CanvasRenderingContext2D } from '../src/core/canvas/CanvasRenderingContext2D.js';

const html = `
    <div id="container">
        <div id="red-box"></div>
        <div id="blue-box"></div>
    </div>
`;

const parser = new HTMLParser();
const doc = parser.parse(html);

const canvas = document.getElementById('canvas');
const ctx = new CanvasRenderingContext2D(canvas.width, canvas.height);

const dispatcher = new EventDispatcher(canvas, doc.body);
dispatcher.init();

const container = doc.body.children[0];
container.style.setProperty('display', 'block');
container.style.setProperty('background-color', '#eee');
container.boxModel.setSize(400, 300);
container.boxModel.setPadding(20);

const redBox = container.children[0];
redBox.style.setProperty('display', 'block');
redBox.style.setProperty('background-color', 'red');
redBox.boxModel.setSize(100, 100);
redBox.boxModel.setMargin(10);
redBox.addEventListener('mousedown', (event) => {
    console.log('Red box clicked!', event);
});

const blueBox = container.children[1];
blueBox.style.setProperty('display', 'block');
blueBox.style.setProperty('background-color', 'blue');
blueBox.boxModel.setSize(100, 100);
blueBox.boxModel.setMargin(10);
blueBox.addEventListener('mousedown', (event) => {
    console.log('Blue box clicked!', event);
    event.stopPropagation();
});

doc.body.addEventListener('mousedown', (event) => {
    console.log('Body clicked!', event);
});

function animate() {
    render(doc.body, ctx);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const nativeCtx = canvas.getContext('2d');
    nativeCtx.putImageData(imageData, 0, 0);
    requestAnimationFrame(animate);
}

animate();
