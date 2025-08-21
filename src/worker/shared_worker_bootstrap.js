import { parentPort, workerData } from 'worker_threads';
import { GlobalScope } from '../dom/globals.js';
import { FontFace } from '../dom/css/font_face.js';
import path from 'path';
import { pathToFileURL } from 'url';

// Create the worker's global scope.
const self = new GlobalScope();

// Expose FontFace class to the worker scope
self.FontFace = FontFace;

// --- Robust onconnect handling to prevent race conditions ---
const queuedPorts = [];
let onconnectHandler = null;

Object.defineProperty(self, 'onconnect', {
    enumerable: true,
    configurable: true,
    get() {
        return onconnectHandler;
    },
    set(handler) {
        onconnectHandler = handler;
        // If a handler is set, immediately process any ports that were queued
        // before the handler was assigned.
        if (typeof handler === 'function') {
            while (queuedPorts.length > 0) {
                const port = queuedPorts.shift();
                const event = { ports: [port] };
                handler(event);
            }
        }
    }
});

// Listen for messages from the main thread.
parentPort.on('message', (message) => {
    // A 'connect' message indicates a new client has connected.
    if (message.type === 'connect' && message.port) {
        if (self.onconnect) {
            // If the handler is already set, use it.
            const event = { ports: [message.port] };
            self.onconnect(event);
        } else {
            // If onconnect is not yet set, queue the port.
            queuedPorts.push(message.port);
        }
    }
});

// Expose the global scope.
global.self = self;

// Load the user's script.
const { scriptURL } = workerData;
const scriptPath = path.resolve(process.cwd(), scriptURL);

// Execute the worker script using a file URL.
import(pathToFileURL(scriptPath).href)
    .then(() => {
        // Signal to the main thread that the worker script has loaded and is ready.
        parentPort.postMessage({ type: '__worker_ready__' });
    })
    .catch(err => {
        // Post an error message back to the main thread if the script fails to import.
        parentPort.postMessage({ type: 'error', message: err.message, stack: err.stack });
    });
