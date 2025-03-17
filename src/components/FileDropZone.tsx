import React, { useState, useRef, useCallback } from "react";
import { Upload, FileUp, AlertCircle } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";

interface FileDropZoneProps {
  onFileSelect?: (files: File[]) => void;
  isUploading?: boolean;
  error?: string | null;
  multiple?: boolean;
}

const FileDropZone = ({
  onFileSelect = () => {},
  isUploading = false,
  error = null,
  multiple = false,
}: FileDropZoneProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const droppedFiles = e.dataTransfer.files;
      if (droppedFiles && droppedFiles.length > 0) {
        const validFiles = Array.from(droppedFiles).filter(
          (file) =>
            file.name.endsWith(".zip") ||
            file.name.endsWith(".tar.gz") ||
            file.name.endsWith(".tgz"),
        );

        if (validFiles.length > 0) {
          if (multiple) {
            onFileSelect(validFiles);
          } else {
            onFileSelect([validFiles[0]]);
          }
        } else {
          console.error("Unsupported file format");
        }
      }
    },
    [onFileSelect],
  );

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = e.target.files;
      if (selectedFiles && selectedFiles.length > 0) {
        const filesArray = Array.from(selectedFiles);
        if (multiple) {
          onFileSelect(filesArray);
        } else {
          onFileSelect([filesArray[0]]);
        }
      }
    },
    [onFileSelect, multiple],
  );

  const handleButtonClick = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, []);

  return (
    <Card
      className={`w-full h-[200px] flex flex-col items-center justify-center p-6 border-2 border-dashed transition-colors ${
        isDragging
          ? "border-primary bg-primary/10"
          : "border-gray-300 dark:border-gray-700 bg-background"
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInputChange}
        accept=".zip,.tar.gz,.tgz,application/gzip,application/x-gzip"
        className="hidden"
        multiple={multiple}
      />

      {isUploading ? (
        <div className="flex flex-col items-center gap-3">
          <div className="animate-pulse">
            <Upload className="h-12 w-12 text-primary" />
          </div>
          <p className="text-lg font-medium">Uploading zip file...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center gap-3 text-destructive">
          <AlertCircle className="h-12 w-12" />
          <p className="text-lg font-medium">{error}</p>
          <Button variant="outline" onClick={handleButtonClick}>
            Try Again
          </Button>
        </div>
      ) : (
        <>
          <FileUp className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">
            Drag & drop snapshot files here
          </h3>
          <p className="text-sm text-muted-foreground mb-4 text-center">
            or click the button below to browse {multiple ? "multiple " : ""}
            files (.zip, .tar.gz)
          </p>
          <Button onClick={handleButtonClick}>
            <Upload className="mr-2 h-4 w-4" />
            Select snapshot file
          </Button>
        </>
      )}
    </Card>
  );
};

export default FileDropZone;
