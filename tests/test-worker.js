// This script runs inside a Web Worker.
// `self` is the global scope, provided by worker_bootstrap.js

self.onmessage = async (e) => {
    const { command, data, fontPath, family } = e.data;

    if (command === 'echo') {
        self.postMessage({ response: 'echo', data: data });
    }

    if (command === 'loadFont') {
        const fontFace = new self.FontFace(family, fontPath);
        self.fonts.add(fontFace);

        await self.fonts.ready;

        const isLoaded = self.fonts.check(`12px ${family}`);
        self.postMessage({ response: 'fontLoaded', isLoaded: isLoaded });
    }
};
