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
                refCount: 0
            };
            activeWorkers.set(scriptURL, workerInfo);

            worker.on('exit', () => {
                activeWorkers.delete(scriptURL);
            });
        }

        workerInfo.refCount++;

        const { port1, port2 } = new MessageChannel();
        this.port = port1;
        this.port.start(); // Start the port to allow message processing.

        // The worker needs to know about the new connection.
        // We send one of the ports to the worker thread.
        workerInfo.worker.postMessage({ type: 'connect', port: port2 }, [port2]);

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
