import { delay } from './delay';

const STORAGE_KEY = 'ze-praga-history';

function readStorage() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function writeStorage(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export async function getAll() {
  await delay(300);
  const items = readStorage();
  return items.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}

export async function getById(id) {
  await delay(300);
  const items = readStorage();
  return items.find((item) => item.id === id) || null;
}

export async function save(diagnosis) {
  await delay(300);
  const items = readStorage();
  const existing = items.findIndex((item) => item.id === diagnosis.id);
  if (existing >= 0) {
    items[existing] = diagnosis;
  } else {
    items.push(diagnosis);
  }
  writeStorage(items);
  return diagnosis;
}

export async function remove(id) {
  await delay(300);
  const items = readStorage();
  const filtered = items.filter((item) => item.id !== id);
  writeStorage(filtered);
  return true;
}
