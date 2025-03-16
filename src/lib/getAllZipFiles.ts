import { initDB } from "./indexedDB";

interface ZipMetadata {
  filename: string;
  lastOpened: Date;
  size: number;
  lineCount: number;
  numFiles: number;
  metadata?: Record<string, string>;
}

// Extended interface for records from IndexedDB that may include fileSize
interface IndexedDBRecord {
  zipFilename: string;
  lastAccessed: Date;
  lineCount: number;
  fileSize?: number;
  metadata?: Record<string, string>;
}

export const getAllZipFiles = async (): Promise<ZipMetadata[]> => {
  const db = await initDB();
  const STORE_NAME = "outFiles";

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const index = store.index("zipFilename");

    // Get all unique zipFilename values
    const uniqueZipFiles = new Map<string, ZipMetadata>();
    const request = index.openCursor();

    // Type assertion for cursor value
    type CursorValue = IndexedDBRecord;

    request.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest).result;
      if (cursor) {
        const record = cursor.value as CursorValue;
        const zipFilename = record.zipFilename;

        if (!uniqueZipFiles.has(zipFilename)) {
          uniqueZipFiles.set(zipFilename, {
            filename: zipFilename,
            lastOpened: record.lastAccessed,
            size: record.fileSize || 0, // Use stored file size if available
            lineCount: record.lineCount,
            numFiles: 1,
            metadata: record.metadata,
          });
        } else {
          // Update existing entry
          const existing = uniqueZipFiles.get(zipFilename)!;
          existing.numFiles += 1;
          existing.lineCount += record.lineCount;
          if (record.lastAccessed > existing.lastOpened) {
            existing.lastOpened = record.lastAccessed;
          }
          // If this record has metadata and the existing one doesn't, use this record's metadata
          if (record.metadata && !existing.metadata) {
            existing.metadata = record.metadata;
          }
          // If this record has file size and the existing one doesn't, use this record's file size
          if (record.fileSize && existing.size === 0) {
            existing.size = record.fileSize;
          }
        }
        cursor.continue();
      } else {
        // Done iterating
        resolve(Array.from(uniqueZipFiles.values()));
      }
    };

    request.onerror = () => {
      reject("Error retrieving zip files");
    };
  });
};
