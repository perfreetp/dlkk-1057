export function saveToStorage<T>(key: string, data: T): void {
  try {
    const serialized = JSON.stringify(data);
    localStorage.setItem(key, serialized);
  } catch (error) {
    console.error(`Failed to save ${key} to storage:`, error);
  }
}

export function loadFromStorage<T>(key: string): T | null {
  try {
    const serialized = localStorage.getItem(key);
    if (serialized === null) return null;
    return JSON.parse(serialized) as T;
  } catch (error) {
    console.error(`Failed to load ${key} from storage:`, error);
    return null;
  }
}

export function removeFromStorage(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Failed to remove ${key} from storage:`, error);
  }
}

export function clearStorage(): void {
  try {
    localStorage.clear();
  } catch (error) {
    console.error('Failed to clear storage:', error);
  }
}
