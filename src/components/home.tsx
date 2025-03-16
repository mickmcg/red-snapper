import React, { useState, useCallback, useEffect, useRef } from "react";
import JSZip from "jszip";
import Header from "./Header";
import FileDropZone from "./FileDropZone";
import ZipFileTable from "./ZipFileTable";
import ZipDetailView from "./ZipDetailView";
import CompareDrawer from "./CompareDrawer";
import ErrorMessage from "./ErrorMessage";
import { initDB, storeOutFile, deleteOutFilesForZip } from "../lib/indexedDB";
import { getAllZipFiles } from "../lib/getAllZipFiles";
import { Button } from "./ui/button";
import { GitCompare as CompareIcon } from "lucide-react";

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

  const handleFileSelect = useCallback((file: File) => {
    setError(null);
    setIsUploading(true);

    // Process the zip file using JSZip
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        if (!e.target?.result) {
          throw new Error("Failed to read file");
        }

        const zip = new JSZip();
        const contents = await zip.loadAsync(e.target.result);

        // Check if metadata.out exists and contains SNAP_VERSION
        if (!contents.files["metadata.out"]) {
          throw new Error("Not a valid snapshot file: metadata.out is missing");
        }

        // Get metadata.out content and check for SNAP_VERSION
        const metadataContent =
          await contents.files["metadata.out"].async("string");
        if (!metadataContent.includes("SNAP_VERSION=")) {
          throw new Error(
            "Not a valid snapshot file: SNAP_VERSION is missing in metadata.out",
          );
        }

        // Parse metadata.out content
        const metadataMap: Record<string, string> = {};
        metadataContent.split("\n").forEach((line) => {
          const match = line.match(/^([^=]+)=(.*)$/);
          if (match) {
            metadataMap[match[1].trim()] = match[2].trim();
          }
        });

        console.log("Parsed metadata:", metadataMap);

        // Count the number of .out files and total lines
        let outFileCount = 0;
        let totalLineCount = 0;
        let totalFiles = 0;

        // Process each file in the zip
        const fileProcessingPromises = [];

        for (const filename in contents.files) {
          const zipEntry = contents.files[filename];

          // Skip directories
          if (zipEntry.dir) continue;

          // Count all files
          totalFiles++;

          // Only process .out files
          if (filename.endsWith(".out")) {
            outFileCount++;
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
                fileSize: file.size, // Store the file size
                metadata: fileMetadata,
              }).catch((err) => {
                console.error(`Failed to store ${filename}:`, err);
              }),
            );
          }
        }

        // Wait for all file processing to complete
        await Promise.all(fileProcessingPromises);

        // Create the new zip file entry
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
        setIsUploading(false);
      } catch (err) {
        console.error("Error processing zip file:", err);
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Failed to process zip file. Please try again.";
        setError(errorMessage);
        setIsUploading(false);
      }
    };

    reader.onerror = () => {
      setError("Failed to read the file. Please try again.");
      setIsUploading(false);
    };

    // Read the file as an ArrayBuffer
    reader.readAsArrayBuffer(file);
  }, []);

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

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header onOpenZipFile={handleOpenZipFile} />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <FileDropZone
            onFileSelect={handleFileSelect}
            isUploading={isUploading}
            error={error}
          />
        </div>

        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">
              Previously loaded zip files
            </h3>
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
