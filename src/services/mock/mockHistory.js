import { delay } from './delay';

const STORAGE_KEY = 'ze-praga-history';

function getStorageKey(userId = 'guest') {
  return userId === 'guest' ? STORAGE_KEY : `${STORAGE_KEY}:${userId}`;
}

function readStorage(userId) {
  try {
    const data = localStorage.getItem(getStorageKey(userId));
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function writeStorage(items, userId) {
  localStorage.setItem(getStorageKey(userId), JSON.stringify(items));
}

export async function getAll(userId) {
  await delay(300);
  const items = readStorage(userId);
  return items.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}

export async function getById(id, userId) {
  await delay(300);
  const items = readStorage(userId);
  return items.find((item) => item.id === id) || null;
}

export async function save(diagnosis, userId) {
  await delay(300);
  const items = readStorage(userId);
  const existing = items.findIndex((item) => item.id === diagnosis.id);
  if (existing >= 0) {
    items[existing] = diagnosis;
  } else {
    items.push(diagnosis);
  }
  writeStorage(items, userId);
  return diagnosis;
}

export async function remove(id, userId) {
  await delay(300);
  const items = readStorage(userId);
  const filtered = items.filter((item) => item.id !== id);
  writeStorage(filtered, userId);
  return true;
}

export async function clearAll(userId) {
  await delay(300);
  writeStorage([], userId);
  return true;
}
