import React, { useState } from "react";
import { Button } from "./ui/button";
import { X as CloseIcon, Maximize2, Minimize2 } from "lucide-react";
import { cn } from "../lib/utils";
import CompareZipFiles from "./CompareZipFiles";

interface ZipFile {
  id: string;
  filename: string;
  lastOpened: Date;
  size: number;
  lineCount: number;
  numFiles?: number;
  metadata?: Record<string, string>;
}

interface CompareDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  zipFiles: ZipFile[];
  selectedFiles?: ZipFile[];
}

const CompareDrawer: React.FC<CompareDrawerProps> = ({
  isOpen = false,
  onClose,
  zipFiles = [],
  selectedFiles = [],
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
        isFullScreen ? "w-full" : "w-[1400px]",
        !isOpen && "translate-x-full",
      )}
    >
      <div className="flex justify-between items-center p-4 border-b border-border bg-background">
        <h2 className="text-xl font-semibold text-foreground">
          Compare Snapshot Files
        </h2>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleFullScreen}
            className="h-9 w-9"
            title={isFullScreen ? "Exit Fullscreen" : "Fullscreen"}
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
            <CloseIcon className="h-5 w-5" />
          </Button>
        </div>
      </div>
      <div className="flex-1 overflow-hidden bg-background">
        <CompareZipFiles
          zipFiles={zipFiles}
          isOpen={true}
          onClose={onClose}
          selectedFiles={selectedFiles}
          hideHeader={true}
        />
      </div>
    </div>
  );
};

export default CompareDrawer;
