import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { X as CloseIcon, Maximize2, Minimize2, GitCompare } from "lucide-react";
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
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const drawerWidth = 1400;

  // Update window width on resize
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Auto fullscreen if window is narrower than drawer width
  useEffect(() => {
    if (windowWidth < drawerWidth) {
      setIsFullScreen(true);
    }
  }, [windowWidth, drawerWidth]);

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  if (!isOpen) return null;

  return (
    <div
      className={cn(
        "fixed inset-y-0 right-0 z-50 flex flex-col bg-background border-l border-border shadow-xl transition-all duration-300 ease-in-out",
        isFullScreen || windowWidth < drawerWidth ? "w-full" : "w-[1400px]",
        !isOpen && "translate-x-full",
      )}
    >
      <div className="flex justify-between items-center p-4 border-b border-border bg-background">
        <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
          <GitCompare className="h-5 w-5" />
          Compare Snapshot Files
        </h2>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleFullScreen}
            className="h-9 w-9"
            title={isFullScreen ? "Exit Fullscreen" : "Fullscreen"}
            disabled={windowWidth < drawerWidth}
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
          selectedFiles={selectedFiles || []}
          hideHeader={false}
        />
      </div>
    </div>
  );
};

export default CompareDrawer;
