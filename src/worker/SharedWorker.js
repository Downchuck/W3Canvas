import { Worker as NodeWorker, MessageChannel } from 'worker_threads';
import path from 'path';

const sharedWorkerBootstrapPath = path.resolve(process.cwd(), 'src/worker/shared_worker_bootstrap.js');

// Registry for active shared workers.
const activeWorkers = new Map();

export class SharedWorker {
    constructor(scriptURL, options = {}) {
        let workerInfo = activeWorkers.get(scriptURL);

        if (!workerInfo) {
            const worker = new NodeWorker(sharedWorkerBootstrapPath, {
                workerData: {
                    scriptURL: scriptURL,
                    options: options
                }
            });

            workerInfo = {
                worker: worker,
                refCount: 0,
                isReady: false,
                connectionQueue: []
            };
            activeWorkers.set(scriptURL, workerInfo);

            worker.on('message', (message) => {
                if (message && message.type === '__worker_ready__') {
                    workerInfo.isReady = true;
                    // Process any pending connections
                    for (const msg of workerInfo.connectionQueue) {
                        workerInfo.worker.postMessage(msg.message, msg.transfer);
                    }
                    workerInfo.connectionQueue = [];
                }
            });

            worker.on('exit', () => {
                activeWorkers.delete(scriptURL);
            });
        }

        workerInfo.refCount++;

        const { port1, port2 } = new MessageChannel();
        this.port = port1;
        this.port.start();

        const connectMessage = {
            message: { type: 'connect', port: port2 },
            transfer: [port2]
        };

        if (workerInfo.isReady) {
            workerInfo.worker.postMessage(connectMessage.message, connectMessage.transfer);
        } else {
            workerInfo.connectionQueue.push(connectMessage);
        }

        this.port.on('close', () => {
            workerInfo.refCount--;
            if (workerInfo.refCount === 0) {
                workerInfo.worker.terminate();
                activeWorkers.delete(scriptURL);
            }
        });
    }
}

/**
 * Forcefully terminates all active shared workers.
 * This is useful for cleaning up at the end of a process, like in tests.
 */
export function shutdownAllSharedWorkers() {
    for (const workerInfo of activeWorkers.values()) {
        workerInfo.worker.terminate();
    }
    activeWorkers.clear();
}
