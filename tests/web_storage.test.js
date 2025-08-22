import { test } from 'node:test';
import assert from 'node:assert';
import { Storage } from '../src/dom/web_storage.js';
import { DatabaseSync } from 'node:sqlite';

test('Storage should set and get items', () => {
    const storage = new Storage(new DatabaseSync(':memory:'));
    storage.setItem('foo', 'bar');
    assert.strictEqual(storage.getItem('foo'), 'bar');
});

test('Storage should have correct length', () => {
    const storage = new Storage(new DatabaseSync(':memory:'));
    storage.setItem('a', '1');
    storage.setItem('b', '2');
    assert.strictEqual(storage.length, 2);
});

test('Storage should remove items', () => {
    const storage = new Storage(new DatabaseSync(':memory:'));
    storage.setItem('a', '1');
    storage.removeItem('a');
    assert.strictEqual(storage.getItem('a'), null);
    assert.strictEqual(storage.length, 0);
});

test('Storage should clear all items', () => {
    const storage = new Storage(new DatabaseSync(':memory:'));
    storage.setItem('a', '1');
    storage.setItem('b', '2');
    storage.clear();
    assert.strictEqual(storage.length, 0);
});

test('Storage should get key by index', () => {
    const storage = new Storage(new DatabaseSync(':memory:'));
    storage.setItem('a', '1');
    storage.setItem('b', '2');
    assert.strictEqual(storage.key(0), 'a');
    assert.strictEqual(storage.key(1), 'b');
});
