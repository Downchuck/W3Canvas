import { DatabaseSync } from 'node:sqlite';

export class Storage {
    constructor(db) {
        this.db = db;
        this.db.exec("CREATE TABLE IF NOT EXISTS storage (key TEXT PRIMARY KEY, value TEXT)");
    }

    getItem(key) {
        const stmt = this.db.prepare("SELECT value FROM storage WHERE key = ?");
        const result = stmt.get(key);
        return result ? result.value : null;
    }

    setItem(key, value) {
        const stmt = this.db.prepare("REPLACE INTO storage (key, value) VALUES (?, ?)");
        stmt.run(key, String(value));
    }

    removeItem(key) {
        const stmt = this.db.prepare("DELETE FROM storage WHERE key = ?");
        stmt.run(key);
    }

    clear() {
        this.db.exec("DELETE FROM storage");
    }

    key(index) {
        const stmt = this.db.prepare("SELECT key FROM storage LIMIT 1 OFFSET ?");
        const result = stmt.get(index);
        return result ? result.key : null;
    }

    get length() {
        const stmt = this.db.prepare("SELECT COUNT(*) as count FROM storage");
        const result = stmt.get();
        return result.count;
    }
}
