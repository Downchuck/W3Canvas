// This script runs inside a Web Worker.
// `self` is the global scope, provided by worker_bootstrap.js
const self = global;

self.onmessage = async (e) => {
    const { command, data, fontPath, family, buffer } = e.data;

    if (command === 'echo') {
        self.postMessage({ response: 'echo', data: data });
    }

    if (command === 'arrayBuffer') {
        // The buffer should have been transferred, not copied.
        // We can check its content and send it back.
        const view = new Uint8Array(buffer);
        const sum = view.reduce((acc, val) => acc + val, 0);
        self.postMessage({ response: 'arrayBuffer', sum: sum });
    }

    if (command === 'error') {
        throw new Error('This is a test error from inside the worker.');
    }

    if (command === 'loadFont') {
        const fontFace = new self.FontFace(family, fontPath);
        self.fonts.add(fontFace);

        await self.fonts.ready;

        const isLoaded = self.fonts.check(`12px ${family}`);
        self.postMessage({ response: 'fontLoaded', isLoaded: isLoaded });
    }
};
