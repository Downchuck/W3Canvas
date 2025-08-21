import { Worker as NodeWorker } from 'worker_threads';
import path from 'path';

const workerBootstrapPath = path.resolve(process.cwd(), 'src/worker/worker_bootstrap.js');

export class Worker {
    #nodeWorker;
    #isReady = false;
    #messageQueue = [];
    ready;
    #resolveReady;

    constructor(scriptURL, options = {}) {
        this.ready = new Promise(resolve => {
            this.#resolveReady = resolve;
        });

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
                this.#resolveReady();
                return;
            }
            if (message && message.type === 'error') {
                if (this.onerror) {
                    const err = new Error(message.message);
                    err.stack = message.stack;
                    this.onerror(err);
                }
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
            if (this.onexit) {
                this.onexit(code);
            }
        });
    }

    #flushMessageQueue() {
        for (const item of this.#messageQueue) {
            this.#nodeWorker.postMessage(item.message, item.transferList);
        }
        this.#messageQueue = [];
    }

    postMessage(message, transferList) {
        if (this.#isReady) {
            this.#nodeWorker.postMessage(message, transferList);
        } else {
            this.#messageQueue.push({ message, transferList });
        }
    }

    terminate() {
        this.#nodeWorker.terminate();
    }
}
