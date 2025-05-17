import { StateStore } from "oidc-client-ts";

/**
 * A simple implementation of the StateStore interface that uses localStorage.
 * This is a workaround for the fact that localStorage is not available in some environments (e.g., server-side rendering).
 * @class LocalStorageStateStore
 * @implements {StateStore}
 */
class LocalStorageStateStore implements StateStore {
  constructor() {
    if (typeof localStorage === "undefined") {
      console.warn("localStorage is not available.");
    }
  }

  get(key: string): Promise<string | null> {
    try {
      return Promise.resolve(localStorage.getItem(key));
    } catch (e) {
      console.error("Error accessing localStorage:", e);
      return Promise.resolve(null);
    }
  }

  set(key: string, value: string): Promise<void> {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.error("Error accessing localStorage:", e);
    }
    return Promise.resolve();
  }

  remove(key: string): Promise<string | null> {
    try {
      const value = localStorage.getItem(key);
      localStorage.removeItem(key);
      return Promise.resolve(value);
    } catch (e) {
      console.error("Error accessing localStorage:", e);
    }
    return Promise.resolve(null);
  }

  getAllKeys(): Promise<string[]> {
    try {
      return Promise.resolve(Object.keys(localStorage));
    } catch (e) {
      console.error("Error accessing localStorage:", e);
      return Promise.resolve([]);
    }
  }
}

export default LocalStorageStateStore;
