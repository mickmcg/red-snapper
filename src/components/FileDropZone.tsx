import React, { useState, useRef, useCallback } from "react";
import { Upload, FileUp, AlertCircle } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";

interface FileDropZoneProps {
  onFileSelect?: (file: File) => void;
  isUploading?: boolean;
  error?: string | null;
}

const FileDropZone = ({
  onFileSelect = () => {},
  isUploading = false,
  error = null,
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

      const files = e.dataTransfer.files;
      if (files && files.length > 0) {
        const file = files[0];
        if (file.name.endsWith(".zip")) {
          onFileSelect(file);
        }
      }
    },
    [onFileSelect],
  );

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        onFileSelect(files[0]);
      }
    },
    [onFileSelect],
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
        accept=".zip"
        className="hidden"
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
            Drag & Drop Zip File Here
          </h3>
          <p className="text-sm text-muted-foreground mb-4 text-center">
            or click the button below to browse files
          </p>
          <Button onClick={handleButtonClick}>
            <Upload className="mr-2 h-4 w-4" />
            Select Zip File
          </Button>
        </>
      )}
    </Card>
  );
};

export default FileDropZone;
