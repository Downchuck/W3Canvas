import { Storage } from './web_storage.js';
import { DatabaseSync } from 'node:sqlite';

export class Window {
    constructor() {
        this.localStorage = new Storage(new DatabaseSync('localStorage.db'));
        this.sessionStorage = new Storage(new DatabaseSync(':memory:'));
    }
}
