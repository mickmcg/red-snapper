import React, { useState } from "react";
import { Maximize2, Minimize2, X } from "lucide-react";
import { Button } from "./ui/button";
import FileContentViewer from "./FileContentViewer";
import { cn } from "../lib/utils";

interface OutFile {
  name: string;
  content: string;
  lineCount: number;
}

interface FileDrawerProps {
  file?: OutFile;
  isOpen: boolean;
  onClose: () => void;
}

const FileDrawer: React.FC<FileDrawerProps> = ({
  file = {
    name: "",
    content: "",
    lineCount: 0,
  },
  isOpen,
  onClose,
}) => {
  const [isFullScreen, setIsFullScreen] = useState(false);

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  if (!isOpen) return null;

  return (
    <div
      className={cn(
        "fixed inset-y-0 right-0 z-50 flex flex-col bg-background border-l border-border shadow-xl transition-all duration-300 ease-in-out",
        isFullScreen ? "w-full" : "w-[600px]",
        !isOpen && "translate-x-full",
      )}
    >
      <div className="flex justify-between items-center p-4 border-b border-border bg-background">
        <h2 className="text-xl font-semibold text-foreground">{file.name}</h2>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleFullScreen}
            className="h-9 w-9"
          >
            {isFullScreen ? (
              <Minimize2 className="h-5 w-5" />
            ) : (
              <Maximize2 className="h-5 w-5" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>
      <div className="flex-1 overflow-hidden bg-background">
        <FileContentViewer
          fileName={file.name}
          content={file.content}
          lineCount={file.lineCount}
        />
      </div>
      <div className="p-4 border-t border-border bg-background">
        <div className="flex justify-between items-center">
          <p className="text-sm text-muted-foreground">
            {file.lineCount} lines
          </p>
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FileDrawer;
