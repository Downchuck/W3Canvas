import { Worker as NodeWorker, MessageChannel } from 'worker_threads';
import path from 'path';

const sharedWorkerBootstrapPath = path.resolve(process.cwd(), 'src/worker/shared_worker_bootstrap.js');

const activeWorkers = new Map();

export class SharedWorker {
    port;
    ready;

    constructor(scriptURL, options = {}) {
        let workerInfo = activeWorkers.get(scriptURL);

        if (!workerInfo) {
            const worker = new NodeWorker(sharedWorkerBootstrapPath, {
                workerData: { scriptURL, options }
            });

            workerInfo = {
                worker,
                refCount: 0,
                isReady: false,
                connectionQueue: [],
                clients: new Set(),
                ready: new Promise(resolve => {
                    worker.on('message', message => {
                        if (message.type === '__worker_ready__') resolve();
                    });
                })
            };
            activeWorkers.set(scriptURL, workerInfo);

            workerInfo.ready.then(() => {
                workerInfo.isReady = true;
                workerInfo.connectionQueue.forEach(msg => worker.postMessage(msg.message, msg.transfer));
                workerInfo.connectionQueue = [];
            });

            const propagateError = err => {
                for (const clientPort of workerInfo.clients) {
                    clientPort.postMessage({ type: '__worker_error__', message: err.message, stack: err.stack });
                }
            };

            worker.on('message', message => {
                if (message && message.type === 'error') propagateError(message);
            });
            worker.on('error', propagateError);
            worker.on('exit', () => activeWorkers.delete(scriptURL));
        }

        this.ready = workerInfo.ready;
        workerInfo.refCount++;

        const { port1, port2 } = new MessageChannel();
        this.port = port1;
        workerInfo.clients.add(this.port);
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
            workerInfo.clients.delete(this.port);
            workerInfo.refCount--;
            if (workerInfo.refCount === 0) {
                workerInfo.worker.terminate();
                activeWorkers.delete(scriptURL);
            }
        });
    }
}

export function shutdownAllSharedWorkers() {
    for (const workerInfo of activeWorkers.values()) {
        workerInfo.worker.terminate();
    }
    activeWorkers.clear();
}
