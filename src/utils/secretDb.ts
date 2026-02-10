import initSqlJs, { Database } from 'sql.js';

const DB_NAME = 'secrets.db';

let db: Database | null = null;

/**
 * Initialize SQL.js database
 * - Checks if database exists in IndexedDB
 * - Initializes new database or loads existing one
 */
export async function initializeDatabase(): Promise<void> {
  try {
    const SQL = await initSqlJs({
      locateFile: (file: string) => `/assets/${file}`,
    });

    // Check if database exists
    const existingDb = await loadDatabaseFromIndexedDB(DB_NAME);

    if (existingDb) {
      // Load the existing database
      db = new SQL.Database(existingDb);
    } else {
      // Create new database
      db = new SQL.Database();
      
      // Create schema
      createSchema(db);
      
      // Save to IndexedDB
      await saveDatabaseToIndexedDB(DB_NAME, db.export());
    }


  } catch (error) {
    console.error('[SecretDB] Failed to initialize database:', error);
    throw error;
  }
}

/**
 * Create the database schema
 */
function createSchema(database: Database): void {
  database.run(`
    CREATE TABLE IF NOT EXISTS cached_secrets (
      id TEXT PRIMARY KEY,
      encrypted_value TEXT NOT NULL,
      created_at INTEGER NOT NULL
    );
  `);
}

/**
 * Get encrypted secret from cache by ID
 */
export async function getSecretFromCache(secretId: string): Promise<string | null> {
  if (!db) {
    return null;
  }

  try {
    const result = db.exec(
      'SELECT encrypted_value FROM cached_secrets WHERE id = ?',
      [secretId]
    );

    if (result.length > 0 && result[0].values.length > 0) {
      return result[0].values[0][0] as string;
    }

    return null;
  } catch (error) {
    console.error('[SecretDB] Failed to get secret from cache:', error);
    return null;
  }
}

/**
 * Save encrypted secret to cache
 */
export async function saveSecretToCache(
  secretId: string,
  encryptedValue: string
): Promise<void> {
  if (!db) {
    console.warn('[SecretDB] Database not initialized');
    return;
  }

  try {
    const now = Date.now();
    
    // Use INSERT OR REPLACE to handle both new and existing secrets
    db.run(
      `INSERT OR REPLACE INTO cached_secrets (id, encrypted_value, created_at) 
       VALUES (?, ?, ?)`,
      [secretId, encryptedValue, now]
    );

    // Save to IndexedDB after modification
    await saveDatabaseToIndexedDB(DB_NAME, db.export());
  } catch (error) {
    console.error('[SecretDB] Failed to save secret to cache:', error);
    throw error;
  }
}

/**
 * Delete a specific secret from cache
 */
export async function deleteSecret(secretId: string): Promise<void> {
  if (!db) {
    console.warn('[SecretDB] Database not initialized');
    return;
  }

  try {
    db.run('DELETE FROM cached_secrets WHERE id = ?', [secretId]);
    await saveDatabaseToIndexedDB(DB_NAME, db.export());
  } catch (error) {
    console.error('[SecretDB] Failed to delete secret:', error);
    throw error;
  }
}

/**
 * Clear all cached secrets
 */
export async function clearCache(): Promise<void> {
  if (!db) {
    console.warn('[SecretDB] Database not initialized');
    return;
  }

  try {
    db.run('DELETE FROM cached_secrets');
    await saveDatabaseToIndexedDB(DB_NAME, db.export());
  } catch (error) {
    console.error('[SecretDB] Failed to clear cache:', error);
    throw error;
  }
}



/**
 * Load database from IndexedDB
 */
function loadDatabaseFromIndexedDB(dbName: string): Promise<Uint8Array | null> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('sqljs');
    
    request.onerror = () => reject(request.error);
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains('databases')) {
        db.createObjectStore('databases');
      }
    };
    
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['databases'], 'readonly');
      const store = transaction.objectStore('databases');
      const getRequest = store.get(dbName);
      
      getRequest.onsuccess = () => {
        resolve(getRequest.result || null);
      };
      
      getRequest.onerror = () => reject(getRequest.error);
    };
  });
}

/**
 * Save database to IndexedDB
 */
function saveDatabaseToIndexedDB(dbName: string, data: Uint8Array): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('sqljs');
    
    request.onerror = () => reject(request.error);
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains('databases')) {
        db.createObjectStore('databases');
      }
    };
    
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['databases'], 'readwrite');
      const store = transaction.objectStore('databases');
      const putRequest = store.put(data, dbName);
      
      putRequest.onsuccess = () => resolve();
      putRequest.onerror = () => reject(putRequest.error);
    };
  });
}