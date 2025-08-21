import { parentPort, workerData } from 'worker_threads';
import { GlobalScope } from '../dom/globals.js';
import { FontFace } from '../dom/css/font_face.js';
import path from 'path';

// Create the worker's global scope.
const self = new GlobalScope();

// Expose FontFace class to the worker scope
self.FontFace = FontFace;

// The `onconnect` event handler will be set by the user's script.
self.onconnect = null;

// Listen for messages from the main thread.
parentPort.on('message', (message) => {
    // A 'connect' message indicates a new client has connected.
    if (message.type === 'connect' && message.port) {
        if (self.onconnect) {
            const event = { ports: [message.port] };
            self.onconnect(event);
        } else {
            // If onconnect is not yet set, queue the port. A more robust implementation
            // might handle this more gracefully.
            console.warn('SharedWorker received a connection before onconnect was set.');
        }
    }
});

// Expose the global scope.
global.self = self;

// Load the user's script.
const { scriptURL } = workerData;
const scriptPath = path.resolve(process.cwd(), scriptURL);

import(scriptPath)
    .catch(err => {
        console.error(`Error in shared worker script: ${scriptURL}`, err);
    });
