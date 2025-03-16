// Simple IndexedDB wrapper for storing zip file contents

const DB_NAME = "RedSnapperDB";
const DB_VERSION = 1;
const STORE_NAME = "outFiles";

interface OutFileRecord {
  id: string; // Composite key: zipFilename + outFilename
  zipFilename: string;
  filename: string;
  content: string;
  lineCount: number;
  lastAccessed: Date;
  fileSize?: number; // Added fileSize field
  metadata?: Record<string, string>;
}

export const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      reject("Error opening database");
    };

    request.onsuccess = (event) => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = request.result;

      // Create object store for out files
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });

        // Create indexes
        store.createIndex("zipFilename", "zipFilename", { unique: false });
        store.createIndex("filename", "filename", { unique: false });
        store.createIndex("lastAccessed", "lastAccessed", { unique: false });
      }
    };
  });
};

export const storeOutFile = async (
  record: Omit<OutFileRecord, "id">,
): Promise<void> => {
  const db = await initDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], "readwrite");
    const store = transaction.objectStore(STORE_NAME);

    // Create composite ID
    const id = `${record.zipFilename}:${record.filename}`;
    const fullRecord: OutFileRecord = { ...record, id };

    // Special handling for metadata.out file to ensure metadata is stored properly
    if (record.filename === "metadata.out" && record.metadata) {
      // Store metadata and file size in a special record that will be used for the zip file metadata
      const metadataRecord: OutFileRecord = {
        id: `${record.zipFilename}:__metadata__`,
        zipFilename: record.zipFilename,
        filename: "__metadata__",
        content: JSON.stringify(record.metadata),
        lineCount: 0,
        lastAccessed: record.lastAccessed,
        fileSize: (record as any).fileSize, // Store file size in metadata record
        metadata: record.metadata,
      };
      store.put(metadataRecord);
    }

    const request = store.put(fullRecord);

    request.onsuccess = () => resolve();
    request.onerror = () => reject("Error storing file");
  });
};

export const getOutFilesForZip = async (
  zipFilename: string,
): Promise<OutFileRecord[]> => {
  const db = await initDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const index = store.index("zipFilename");

    const request = index.getAll(IDBKeyRange.only(zipFilename));

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject("Error retrieving files");
    };
  });
};

export const deleteOutFilesForZip = async (
  zipFilename: string,
): Promise<void> => {
  const db = await initDB();
  const files = await getOutFilesForZip(zipFilename);

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], "readwrite");
    const store = transaction.objectStore(STORE_NAME);

    let completed = 0;
    let hasError = false;

    files.forEach((file) => {
      const request = store.delete(file.id);

      request.onsuccess = () => {
        completed++;
        if (completed === files.length && !hasError) {
          resolve();
        }
      };

      request.onerror = () => {
        if (!hasError) {
          hasError = true;
          reject("Error deleting files");
        }
      };
    });

    // If there are no files to delete, resolve immediately
    if (files.length === 0) {
      resolve();
    }
  });
};
