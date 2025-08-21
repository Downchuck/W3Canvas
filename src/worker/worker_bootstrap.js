import { parentPort, workerData } from 'worker_threads';
import { GlobalScope } from '../dom/globals.js';
import { FontFace } from '../dom/css/font_face.js';
import path from 'path';
import { pathToFileURL } from 'url';

// Create the worker's global scope. This is the `self` object in a worker.
const self = new GlobalScope();

// Expose FontFace class to the worker scope
self.FontFace = FontFace;

// Set up the communication channel.
// The `parentPort` is the connection to the main thread.
self.postMessage = (message) => {
    parentPort.postMessage(message);
};

parentPort.on('message', (message) => {
    if (self.onmessage) {
        self.onmessage({ data: message });
    }
});

// Expose the global scope to the worker script.
global.self = self;

// The main thread sends the path to the actual worker script to execute.
const { scriptURL } = workerData;
const scriptPath = path.resolve(process.cwd(), scriptURL);

// Execute the worker script using a file URL.
import(pathToFileURL(scriptPath).href)
    .then(() => {
        // Signal to the main thread that the worker script has loaded and is ready.
        parentPort.postMessage({ type: '__worker_ready__' });
    })
    .catch(err => {
        console.error(`Error in worker script: ${scriptURL}`, err);
        // We could also post an error message back to the main thread.
        parentPort.postMessage({ type: 'error', message: err.message, stack: err.stack });
    });
