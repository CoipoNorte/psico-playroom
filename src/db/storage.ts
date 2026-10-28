// IndexedDB + localStorage utilities for PSICO PLAYROOM

import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface PlayroomDB extends DBSchema {
  sessions: {
    key: string;
    value: {
      id: string;
      roomCode: string;
      startTime: number;
      endTime?: number;
      activities: string[];
      notes: string;
    };
  };
  images: {
    key: string;
    value: {
      id: string;
      data: Blob;
      timestamp: number;
    };
  };
  progress: {
    key: string;
    value: {
      id: string;
      stage: number;
      completed: boolean;
      timestamp: number;
    };
  };
}

let db: IDBPDatabase<PlayroomDB> | null = null;

export async function initDB(): Promise<IDBPDatabase<PlayroomDB>> {
  if (db) return db;
  
  db = await openDB<PlayroomDB>('psico-playroom', 1, {
    upgrade(db) {
      db.createObjectStore('sessions', { keyPath: 'id' });
      db.createObjectStore('images', { keyPath: 'id' });
      db.createObjectStore('progress', { keyPath: 'id' });
    },
  });
  
  return db;
}

// Session management
export async function saveSession(session: PlayroomDB['sessions']['value']) {
  const database = await initDB();
  await database.put('sessions', session);
}

export async function getSession(id: string) {
  const database = await initDB();
  return database.get('sessions', id);
}

export async function getAllSessions() {
  const database = await initDB();
  return database.getAll('sessions');
}

// Image management (localStorage for temp, IndexedDB for permanent)
export function saveTempImage(key: string, data: string) {
  localStorage.setItem(`temp_img_${key}`, data);
}

export function getTempImage(key: string): string | null {
  return localStorage.getItem(`temp_img_${key}`);
}

export function removeTempImage(key: string) {
  localStorage.removeItem(`temp_img_${key}`);
}

export async function savePermanentImage(id: string, data: Blob) {
  const database = await initDB();
  await database.put('images', { id, data, timestamp: Date.now() });
}

export async function getPermanentImage(id: string) {
  const database = await initDB();
  return database.get('images', id);
}

// Progress tracking
export async function saveProgress(progress: PlayroomDB['progress']['value']) {
  const database = await initDB();
  await database.put('progress', progress);
}

export async function getProgress(id: string) {
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