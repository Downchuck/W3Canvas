// This script runs inside a Shared Worker.
// `self` is the global scope, provided by shared_worker_bootstrap.js

const ports = new Set();

self.onconnect = (e) => {
    const port = e.ports[0];
    ports.add(port);

    port.onmessage = async (event) => {
        if (typeof event.data === 'string' && event.data === 'ping') {
            // Broadcast 'pong' to all connected clients
            for (const p of ports) {
                p.postMessage('pong');
            }
        }

        if (typeof event.data === 'object') {
            const { command, fontPath, family } = event.data;
            if (command === 'loadFont') {
                const fontFace = new self.FontFace(family, fontPath);
                self.fonts.add(fontFace);

                await self.fonts.ready;

                const isLoaded = self.fonts.check(`12px ${family}`);
                // Send the result back to the specific client that requested it.
                port.postMessage({ response: 'fontLoaded', isLoaded: isLoaded });
            }
        }
    };

    port.onclose = () => {
        ports.delete(port);
    };
};
