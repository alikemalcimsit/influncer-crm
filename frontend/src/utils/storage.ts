// Local storage helpers with type safety and error handling

const STORAGE_PREFIX = 'influencer_crm_';

// Generic get item from localStorage
export const getStorageItem = <T>(key: string, defaultValue?: T): T | null => {
  try {
    const item = localStorage.getItem(STORAGE_PREFIX + key);
    return item ? JSON.parse(item) : defaultValue || null;
  } catch (error) {
    console.error(`Error reading from localStorage:`, error);
    return defaultValue || null;
  }
};

// Generic set item to localStorage
export const setStorageItem = <T>(key: string, value: T): boolean => {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Error writing to localStorage:`, error);
    return false;
  }
};

// Remove item from localStorage
export const removeStorageItem = (key: string): boolean => {
  try {
    localStorage.removeItem(STORAGE_PREFIX + key);
    return true;
  } catch (error) {
    console.error(`Error removing from localStorage:`, error);
    return false;
  }
};

// Clear all app data from localStorage
export const clearStorage = (): boolean => {
  try {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(STORAGE_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
    return true;
  } catch (error) {
    console.error(`Error clearing localStorage:`, error);
    return false;
  }
};

// Get all keys from localStorage
export const getStorageKeys = (): string[] => {
  try {
    const keys = Object.keys(localStorage);
    return keys
      .filter(key => key.startsWith(STORAGE_PREFIX))
      .map(key => key.replace(STORAGE_PREFIX, ''));
  } catch (error) {
    console.error(`Error getting localStorage keys:`, error);
    return [];
  }
};

// Check if key exists
export const hasStorageItem = (key: string): boolean => {
  try {
    return localStorage.getItem(STORAGE_PREFIX + key) !== null;
  } catch (error) {
    return false;
  }
};

// Session storage helpers
export const getSessionItem = <T>(key: string, defaultValue?: T): T | null => {
  try {
    const item = sessionStorage.getItem(STORAGE_PREFIX + key);
    return item ? JSON.parse(item) : defaultValue || null;
  } catch (error) {
    console.error(`Error reading from sessionStorage:`, error);
    return defaultValue || null;
  }
};

export const setSessionItem = <T>(key: string, value: T): boolean => {
  try {
    sessionStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Error writing to sessionStorage:`, error);
    return false;
  }
};

export const removeSessionItem = (key: string): boolean => {
  try {
    sessionStorage.removeItem(STORAGE_PREFIX + key);
    return true;
  } catch (error) {
    console.error(`Error removing from sessionStorage:`, error);
    return false;
  }
};

export const clearSessionStorage = (): boolean => {
  try {
    const keys = Object.keys(sessionStorage);
    keys.forEach(key => {
      if (key.startsWith(STORAGE_PREFIX)) {
        sessionStorage.removeItem(key);
      }
    });
    return true;
  } catch (error) {
    console.error(`Error clearing sessionStorage:`, error);
    return false;
  }
};

// Cookie helpers
export const setCookie = (
  name: string,
  value: string,
  days: number = 7
): void => {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${STORAGE_PREFIX}${name}=${value};expires=${expires.toUTCString()};path=/`;
};

export const getCookie = (name: string): string | null => {
  const nameEQ = `${STORAGE_PREFIX}${name}=`;
  const ca = document.cookie.split(';');
  
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  
  return null;
};

export const deleteCookie = (name: string): void => {
  document.cookie = `${STORAGE_PREFIX}${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
};

// Storage size helpers
export const getStorageSize = (): { used: number; total: number } => {
  let used = 0;
  
  try {
    for (const key in localStorage) {
      if (localStorage.hasOwnProperty(key) && key.startsWith(STORAGE_PREFIX)) {
        used += localStorage[key].length + key.length;
      }
    }
  } catch (error) {
    console.error('Error calculating storage size:', error);
  }
  
  // Most browsers limit localStorage to 5MB
  const total = 5 * 1024 * 1024;
  
  return { used, total };
};

export const getStorageSizeFormatted = (): string => {
  const { used, total } = getStorageSize();
  const usedMB = (used / (1024 * 1024)).toFixed(2);
  const totalMB = (total / (1024 * 1024)).toFixed(2);
  return `${usedMB} MB / ${totalMB} MB`;
};

// Storage event listener
export const onStorageChange = (
  key: string,
  callback: (newValue: any, oldValue: any) => void
): (() => void) => {
  const handler = (e: StorageEvent) => {
    if (e.key === STORAGE_PREFIX + key) {
      const newValue = e.newValue ? JSON.parse(e.newValue) : null;
      const oldValue = e.oldValue ? JSON.parse(e.oldValue) : null;
      callback(newValue, oldValue);
    }
  };
  
  window.addEventListener('storage', handler);
  
  // Return cleanup function
  return () => window.removeEventListener('storage', handler);
};
