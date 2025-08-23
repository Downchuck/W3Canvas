import { Storage } from './web_storage.js';
import { DatabaseSync } from 'node:sqlite';
import fs from 'fs';

export class Window {
    constructor() {
        this.localStorage = new Storage(new DatabaseSync('localStorage.db'));
        this.sessionStorage = new Storage(new DatabaseSync(':memory:'));

        this.performance = {
            now: () => Date.now(),
        };

        this.requestAnimationFrame = (callback) => {
            return setTimeout(() => callback(this.performance.now()), 0);
        };

        this.cancelAnimationFrame = (id) => {
            clearTimeout(id);
        };

        this.fetch = async (url) => {
            try {
                const data = fs.readFileSync(url);
                return {
                    ok: true,
                    status: 200,
                    statusText: 'OK',
                    text: async () => data.toString(),
                    arrayBuffer: async () => data.buffer,
                };
            } catch (error) {
                return {
                    ok: false,
                    status: 404,
                    statusText: 'Not Found',
                };
            }
        };
    }
}
