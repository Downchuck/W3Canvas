import { Worker as NodeWorker } from 'worker_threads';
import path from 'path';

const workerBootstrapPath = path.resolve(process.cwd(), 'src/worker/worker_bootstrap.js');

export class Worker {
    #nodeWorker;

    constructor(scriptURL, options = {}) {
        this.#nodeWorker = new NodeWorker(workerBootstrapPath, {
            workerData: {
                scriptURL: scriptURL,
                options: options
            }
        });

        this.#nodeWorker.on('message', (message) => {
            if (this.onmessage) {
                this.onmessage({ data: message });
            }
        });

        this.#nodeWorker.on('error', (error) => {
            if (this.onerror) {
                this.onerror(error);
            }
        });

        this.#nodeWorker.on('exit', (code) => {
            if (code !== 0 && this.onerror) {
                this.onerror(new Error(`Worker stopped with exit code ${code}`));
            }
        });
    }

    postMessage(message) {
        this.#nodeWorker.postMessage(message);
    }

    terminate() {
        this.#nodeWorker.terminate();
    }
}
