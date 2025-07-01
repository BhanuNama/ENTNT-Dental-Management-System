// Enhanced localStorage utility with error handling and fallbacks
export class StorageManager {
  private static isStorageAvailable(): boolean {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }

  private static fallbackStorage = new Map<string, string>();

  static setItem(key: string, value: any): boolean {
    try {
      const stringValue = JSON.stringify(value);
      localStorage.setItem(key, stringValue);
      
      // Dispatch custom event for real-time updates
      window.dispatchEvent(new CustomEvent('dataStored', { 
        detail: { 
          key, 
          value, 
          success: true,
          timestamp: new Date().toISOString()
        } 
      }));
      
      // Dispatch a custom cross-tab event
      window.dispatchEvent(new CustomEvent('localStorageChanged', {
        detail: {
          key: key,
          newValue: stringValue,
          timestamp: new Date().toISOString()
        }
      }));
      
      return true;
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
      
      // Dispatch error event
      window.dispatchEvent(new CustomEvent('dataStored', { 
        detail: { 
          key, 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString()
        } 
      }));
      
      return false;
    }
  }

  static getItem<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(key);
      if (item === null) {
        return defaultValue;
      }
      return JSON.parse(item);
    } catch (error) {
      console.error('Failed to read from localStorage:', error);
      return defaultValue;
    }
  }

  static removeItem(key: string): boolean {
    try {
      const oldValue = localStorage.getItem(key);
        localStorage.removeItem(key);
      
      // Dispatch custom event for real-time updates
      window.dispatchEvent(new CustomEvent('dataStored', { 
        detail: { 
          key, 
          value: null, 
          success: true,
          removed: true,
          timestamp: new Date().toISOString()
        } 
      }));
      
      // Dispatch a custom cross-tab event
      window.dispatchEvent(new CustomEvent('localStorageChanged', {
        detail: {
          key: key,
          newValue: null,
          oldValue: oldValue,
          timestamp: new Date().toISOString()
        }
      }));
      
      return true;
    } catch (error) {
      console.error('Failed to remove from localStorage:', error);
      return false;
    }
  }

  static clear(): boolean {
    try {
        localStorage.clear();
      
      // Dispatch custom event for real-time updates
      window.dispatchEvent(new CustomEvent('dataStored', { 
        detail: { 
          key: 'ALL', 
          value: null, 
          success: true,
          cleared: true,
          timestamp: new Date().toISOString()
        } 
      }));
      
      return true;
    } catch (error) {
      console.error('Failed to clear localStorage:', error);
      return false;
    }
  }

  // Check if localStorage is available
  static isAvailable(): boolean {
    try {
      const test = '__localStorage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (error) {
      return false;
    }
  }

  // Get all keys from localStorage
  static getAllKeys(): string[] {
    try {
      return Object.keys(localStorage);
    } catch (error) {
      console.error('Failed to get localStorage keys:', error);
      return [];
    }
  }

  // Get storage size in bytes
  static getStorageSize(): number {
    try {
      let total = 0;
      for (const key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          total += localStorage[key].length + key.length;
        }
      }
      return total;
    } catch (error) {
      console.error('Failed to calculate storage size:', error);
      return 0;
    }
  }

  // Add listener for storage changes
  static addStorageListener(callback: (event: CustomEvent) => void): () => void {
    const handleStorageEvent = (event: CustomEvent) => {
      callback(event);
    };

    window.addEventListener('dataStored', handleStorageEvent as EventListener);
    
    return () => {
      window.removeEventListener('dataStored', handleStorageEvent as EventListener);
    };
  }

  // Add cross-tab storage listener
  static addCrossTabListener(callback: (event: StorageEvent) => void): () => void {
    const handleStorageEvent = (event: StorageEvent) => {
      // Only respond to actual storage events from other tabs
      if (event.storageArea === localStorage) {
        callback(event);
      }
    };

    window.addEventListener('storage', handleStorageEvent);
    
    return () => {
      window.removeEventListener('storage', handleStorageEvent);
    };
  }
}