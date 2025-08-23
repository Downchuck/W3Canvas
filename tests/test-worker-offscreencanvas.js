self.onmessage = (e) => {
    if (e.data.canvas) {
        const canvas = e.data.canvas;
        const ctx = canvas.getContext('2d');

        // Perform a simple drawing operation
        ctx.fillStyle = 'green';
        ctx.fillRect(10, 10, 50, 50);

        // To send the result back, we would ideally use commitFrame or similar,
        // but for this test, we can just signal completion.
        self.postMessage({ done: true });
    } else {
        // Fallback for environments where canvas transfer is not supported
        const { width, height } = e.data;
        const canvas = new self.OffscreenCanvas(width, height);
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = 'blue';
        ctx.fillRect(0, 0, width, height);
        const imageBitmap = canvas.transferToImageBitmap();
        self.postMessage({ imageBitmap: imageBitmap }, [imageBitmap]);
    }
};
