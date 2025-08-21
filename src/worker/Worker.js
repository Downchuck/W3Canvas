import { Worker as NodeWorker } from 'worker_threads';
import path from 'path';

const workerBootstrapPath = path.resolve(process.cwd(), 'src/worker/worker_bootstrap.js');

export class Worker {
    #nodeWorker;
    #isReady = false;
    #messageQueue = [];

    constructor(scriptURL, options = {}) {
        this.#nodeWorker = new NodeWorker(workerBootstrapPath, {
            workerData: {
                scriptURL: scriptURL,
                options: options
            }
        });

        this.#nodeWorker.on('message', (message) => {
            if (message && message.type === '__worker_ready__') {
                this.#isReady = true;
                this.#flushMessageQueue();
                return;
            }
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

    #flushMessageQueue() {
        for (const message of this.#messageQueue) {
            this.#nodeWorker.postMessage(message);
        }
        this.#messageQueue = [];
    }

    postMessage(message) {
        if (this.#isReady) {
            this.#nodeWorker.postMessage(message);
        } else {
            this.#messageQueue.push(message);
        }
    }

    terminate() {
        this.#nodeWorker.terminate();
    }
}
