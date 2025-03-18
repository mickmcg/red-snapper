import React, { useState, useCallback, useEffect, useRef } from "react";
import JSZip from "jszip";
import * as tar from "tar";
import Header from "./Header";
import FileDropZone from "./FileDropZone";
import ZipFileTable from "./ZipFileTable";
import ZipDetailView from "./ZipDetailView";
import CompareDrawer from "./CompareDrawer";
import ErrorMessage from "./ErrorMessage";
import CreateSnapshotDialog from "./CreateSnapshotDialog";
import { initDB, storeOutFile, deleteOutFilesForZip } from "../lib/indexedDB";
import { getAllZipFiles } from "../lib/getAllZipFiles";
import { Button } from "./ui/button";
import { GitCompare as CompareIcon, Trash2, Clock } from "lucide-react";

interface ZipFile {
  id: string;
  filename: string;
  lastOpened: Date;
  size: number;
  lineCount: number;
  numFiles?: number;
  metadata?: Record<string, string>;
}

const Home = () => {
  const zipFileTableRef = useRef(null);
  // Initialize IndexedDB and load existing zip files when component mounts
  useEffect(() => {
    const initializeAndLoadFiles = async () => {
      try {
        await initDB();
        const existingZipFiles = await getAllZipFiles();

        if (existingZipFiles.length > 0) {
          const formattedZipFiles = existingZipFiles.map((zipFile) => ({
            id: `existing-${zipFile.filename}-${Date.now()}`,
            filename: zipFile.filename,
            lastOpened: zipFile.lastOpened,
            size: zipFile.size,
            lineCount: zipFile.lineCount,
            numFiles: zipFile.numFiles,
            metadata: zipFile.metadata,
          }));

          console.log("Loaded zip files with metadata:", formattedZipFiles);
          setZipFiles(formattedZipFiles);
        }
      } catch (err) {
        console.error("Failed to initialize IndexedDB or load files:", err);
        setError(
          "Failed to initialize storage. Some features may not work properly.",
        );
      }
    };

    initializeAndLoadFiles();
  }, []);
  const [selectedZipFile, setSelectedZipFile] = useState<ZipFile | null>(null);
  const [isDetailViewOpen, setIsDetailViewOpen] = useState<boolean>(false);
  const [isCompareViewOpen, setIsCompareViewOpen] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [zipFiles, setZipFiles] = useState<ZipFile[]>([]);
  const [selectedFilesForCompare, setSelectedFilesForCompare] = useState<
    ZipFile[]
  >([]);

  const handleOpenZipFile = useCallback(() => {
    // This would trigger the file input in FileDropZone
    // Implementation handled by the FileDropZone component
  }, []);

  const handleFileSelect = useCallback((files: File[]) => {
    setError(null);
    setIsUploading(true);

    // Process each file sequentially
    const processFiles = async () => {
      for (const file of files) {
        await processFile(file);
      }
      setIsUploading(false);
    };

    processFiles();
  }, []);

  const processFile = async (file: File) => {
    try {
      setError(null);

      // Process the file based on its extension
      const reader = new FileReader();

      return new Promise<void>((resolve, reject) => {
        reader.onload = async (e) => {
          try {
            if (!e.target?.result) {
              throw new Error("Failed to read file");
            }

            let metadataContent = "";
            let metadataMap: Record<string, string> = {};
            let totalLineCount = 0;
            let totalFiles = 0;
            const fileProcessingPromises = [];

            // Handle based on file type
            if (file.name.endsWith(".zip")) {
              // Process zip file
              const zip = new JSZip();
              const contents = await zip.loadAsync(e.target.result);

              // Check if metadata.out exists and contains SNAP_VERSION
              if (!contents.files["metadata.out"]) {
                throw new Error(
                  "Not a valid snapshot file: metadata.out is missing",
                );
              }

              // Get metadata.out content and check for SNAP_VERSION
              metadataContent =
                await contents.files["metadata.out"].async("string");
              if (!metadataContent.includes("SNAP_VERSION=")) {
                throw new Error(
                  "Not a valid snapshot file: SNAP_VERSION is missing in metadata.out",
                );
              }

              // Parse metadata.out content
              metadataContent.split("\n").forEach((line) => {
                const match = line.match(/^([^=]+)=(.*)$/);
                if (match) {
                  metadataMap[match[1].trim()] = match[2].trim();
                }
              });

              console.log("Parsed metadata:", metadataMap);

              // Process each file in the zip
              for (const filename in contents.files) {
                const zipEntry = contents.files[filename];

                // Skip directories
                if (zipEntry.dir) continue;

                // Count all files
                totalFiles++;

                // Only process .out files
                if (filename.endsWith(".out")) {
                  const content = await zipEntry.async("string");
                  const lineCount = content.split("\n").length;
                  totalLineCount += lineCount;

                  // Store the file content in IndexedDB
                  // If this is the metadata.out file, parse and store its metadata
                  const isMetadataFile = filename === "metadata.out";
                  const fileMetadata = isMetadataFile ? metadataMap : undefined;

                  fileProcessingPromises.push(
                    storeOutFile({
                      zipFilename: file.name,
                      filename: filename,
                      content: content,
                      lineCount: lineCount,
                      lastAccessed: new Date(),
                      fileSize: file.size,
                      metadata: fileMetadata,
                    }).catch((err) => {
                      console.error(`Failed to store ${filename}:`, err);
                    }),
                  );
                }
              }
            } else if (
              file.name.endsWith(".tar.gz") ||
              file.name.endsWith(".tgz")
            ) {
              // Process tar.gz file
              const arrayBuffer = e.target.result as ArrayBuffer;

              // Import the processTarGz function
              const { processTarGz, parseMetadata } = await import(
                "../lib/processTarGz"
              );

              // Process the tar.gz file using our utility function
              const extractedFiles = await processTarGz(arrayBuffer);

              // Check if metadata.out exists
              const metadataFile = extractedFiles.find(
                (file) => file.filename === "metadata.out",
              );

              if (!metadataFile) {
                throw new Error(
                  "Not a valid snapshot file: metadata.out is missing",
                );
              }

              // Get metadata content
              metadataContent = metadataFile.content;

              if (!metadataContent.includes("SNAP_VERSION=")) {
                throw new Error(
                  "Not a valid snapshot file: SNAP_VERSION is missing in metadata.out",
                );
              }

              // Parse metadata
              metadataMap = parseMetadata(metadataContent);
              console.log("Parsed metadata from tar.gz:", metadataMap);

              // Process each extracted file
              totalFiles = extractedFiles.length;
              totalLineCount = 0;

              for (const extractedFile of extractedFiles) {
                // Skip directories
                if (extractedFile.isDirectory) continue;

                // Count lines in the file
                const lineCount = extractedFile.content.split("\n").length;
                totalLineCount += lineCount;

                // Store the file in IndexedDB
                const isMetadataFile =
                  extractedFile.filename === "metadata.out";
                const fileMetadata = isMetadataFile ? metadataMap : undefined;

                fileProcessingPromises.push(
                  storeOutFile({
                    zipFilename: file.name,
                    filename: extractedFile.filename,
                    content: extractedFile.content,
                    lineCount: lineCount,
                    lastAccessed: new Date(),
                    fileSize: file.size, // This is the size of the whole tar.gz file
                    metadata: fileMetadata,
                  }).catch((err) => {
                    console.error(
                      `Failed to store ${extractedFile.filename}:`,
                      err,
                    );
                  }),
                );
              }
            } else {
              throw new Error(
                "Unsupported file format. Please upload a .zip or .tar.gz file.",
              );
            }

            // Wait for all file processing to complete
            await Promise.all(fileProcessingPromises);

            // Create the new file entry
            const newZipFile: ZipFile = {
              id: Date.now().toString(),
              filename: file.name,
              lastOpened: new Date(),
              size: file.size,
              lineCount: totalLineCount,
              numFiles: totalFiles,
              metadata: metadataMap,
            };

            setZipFiles((prev) => [newZipFile, ...prev]);
            resolve();
          } catch (err) {
            console.error("Error processing file:", err);
            const errorMessage =
              err instanceof Error
                ? err.message
                : "Failed to process file. Please try again.";
            setError(errorMessage);
            reject(err);
          }
        };

        reader.onerror = () => {
          setError("Failed to read the file. Please try again.");
          reject(new Error("Failed to read the file"));
        };

        // Read the file as an ArrayBuffer
        reader.readAsArrayBuffer(file);
      });
    } catch (err) {
      console.error("Error in processFile:", err);
      setError(
        err instanceof Error ? err.message : "An unknown error occurred",
      );
    }
  };

  const handleZipFileClick = useCallback((zipFile: ZipFile) => {
    setSelectedZipFile(zipFile);
    setIsDetailViewOpen(true);
  }, []);

  const handleDeleteZipFile = useCallback(
    async (zipFile: ZipFile) => {
      try {
        // Delete the zip file's contents from IndexedDB
        await deleteOutFilesForZip(zipFile.filename);

        // Remove the zip file from the state
        setZipFiles((prevFiles) =>
          prevFiles.filter((file) => file.id !== zipFile.id),
        );

        // If the deleted file was being viewed, close the detail view
        if (selectedZipFile && selectedZipFile.id === zipFile.id) {
          setIsDetailViewOpen(false);
          setSelectedZipFile(null);
        }
      } catch (err) {
        console.error("Error deleting zip file:", err);
        setError("Failed to delete zip file. Please try again.");
      }
    },
    [selectedZipFile],
  );

  const handleCloseDetailView = useCallback(() => {
    setIsDetailViewOpen(false);
  }, []);

  const handleOpenCompareView = useCallback(() => {
    if (zipFiles.length >= 2) {
      setIsCompareViewOpen(true);
    }
  }, [zipFiles]);

  const handleCloseCompareView = useCallback(() => {
    setIsCompareViewOpen(false);
    setSelectedFilesForCompare([]);
  }, []);

  const handleDismissError = useCallback(() => {
    setError(null);
  }, []);

  const handleClearAllFiles = useCallback(async () => {
    try {
      // Delete all zip files from IndexedDB
      for (const zipFile of zipFiles) {
        await deleteOutFilesForZip(zipFile.filename);
      }

      // Clear the zip files from state
      setZipFiles([]);

      // Close any open views
      setIsDetailViewOpen(false);
      setSelectedZipFile(null);
      setIsCompareViewOpen(false);
      setSelectedFilesForCompare([]);
    } catch (err) {
      console.error("Error clearing all files:", err);
      setError("Failed to clear all files. Please try again.");
    }
  }, [zipFiles]);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header onOpenZipFile={handleOpenZipFile} />
      <CreateSnapshotDialog />

      <main className="flex-1 w-full px-4 py-8">
        <div className="mb-8">
          <FileDropZone
            onFileSelect={handleFileSelect}
            isUploading={isUploading}
            error={error}
            multiple={true}
          />
        </div>

        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <h3 className="text-xl font-semibold">Recent files</h3>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  if (zipFileTableRef.current) {
                    // @ts-ignore
                    zipFileTableRef.current.toggleSelectionMode();
                  }
                }}
                disabled={zipFiles.length < 2}
                className="flex items-center gap-2"
              >
                <CompareIcon className="h-4 w-4" />
                Compare Files
              </Button>
              {zipFiles.length > 0 && (
                <Button
                  variant="outline"
                  onClick={handleClearAllFiles}
                  className="flex items-center gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4" />
                  Clear History
                </Button>
              )}
            </div>
          </div>
          <ZipFileTable
            ref={zipFileTableRef}
            zipFiles={zipFiles}
            onZipFileClick={handleZipFileClick}
            onDeleteZipFile={handleDeleteZipFile}
            onCompareFiles={(selectedFiles) => {
              // When files are selected for comparison, directly open the compare view with those files
              setSelectedZipFile(null);
              setSelectedFilesForCompare(selectedFiles);
              setIsCompareViewOpen(true);
            }}
            onClearAll={handleClearAllFiles}
          />
        </div>
      </main>

      {isDetailViewOpen && selectedZipFile && (
        <ZipDetailView
          zipFile={{
            name: selectedZipFile.filename,
            size: selectedZipFile.size,
            lastOpened: selectedZipFile.lastOpened,
            lineCount: selectedZipFile.lineCount,
            numFiles: selectedZipFile.numFiles,
            metadata: selectedZipFile.metadata,
          }}
          isOpen={isDetailViewOpen}
          onClose={handleCloseDetailView}
          zipFiles={zipFiles}
        />
      )}

      <CompareDrawer
        zipFiles={zipFiles}
        isOpen={isCompareViewOpen}
        onClose={handleCloseCompareView}
        selectedFiles={selectedFilesForCompare}
      />
    </div>
  );
};

export default Home;
