// IndexedDB + localStorage utilities for PSICO PLAYROOM
import { openDB } from 'idb';
let db = null;
export async function initDB() {
    if (db)
        return db;
    db = await openDB('psico-playroom', 1, {
        upgrade(db) {
            db.createObjectStore('sessions', { keyPath: 'id' });
            db.createObjectStore('images', { keyPath: 'id' });
            db.createObjectStore('progress', { keyPath: 'id' });
        },
    });
    return db;
}
// Session management
export async function saveSession(session) {
    const database = await initDB();
    await database.put('sessions', session);
}
export async function getSession(id) {
    const database = await initDB();
    return database.get('sessions', id);
}
export async function getAllSessions() {
    const database = await initDB();
    return database.getAll('sessions');
}
// Image management (localStorage for temp, IndexedDB for permanent)
export function saveTempImage(key, data) {
    localStorage.setItem(`temp_img_${key}`, data);
}
export function getTempImage(key) {
    return localStorage.getItem(`temp_img_${key}`);
}
export function removeTempImage(key) {
    localStorage.removeItem(`temp_img_${key}`);
}
export async function savePermanentImage(id, data) {
    const database = await initDB();
    await database.put('images', { id, data, timestamp: Date.now() });
}
export async function getPermanentImage(id) {
    const database = await initDB();
    return database.get('images', id);
}
// Progress tracking
export async function saveProgress(progress) {
    const database = await initDB();
    await database.put('progress', progress);
}
export async function getProgress(id) {
    const database = await initDB();
    return database.get('progress', id);
}
export async function getAllProgress() {
    const database = await initDB();
    return database.getAll('progress');
}
// Clear all data
export async function clearAllData() {
    const database = await initDB();
    await database.clear('sessions');
    await database.clear('images');
    await database.clear('progress');
    localStorage.clear();
}
