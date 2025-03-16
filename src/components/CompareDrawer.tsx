import React, { useState } from "react";
import { Button } from "./ui/button";
import { X as CloseIcon, Maximize2, Minimize2 } from "lucide-react";
import { Sheet, SheetContent, SheetClose } from "./ui/sheet";
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
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="right"
        className={`${isFullscreen ? "w-screen max-w-full" : "w-[95vw] sm:max-w-[90vw] md:max-w-[90vw] lg:max-w-[90vw]"} p-0 bg-background`}
        hideCloseButton
      >
        <div className="h-full flex flex-col overflow-hidden">
          <div className="flex justify-between items-center p-4 border-b border-border">
            <h2 className="text-xl font-semibold text-foreground">
              Compare Snapshot Files
            </h2>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleFullscreen}
                title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
              >
                {isFullscreen ? (
                  <Minimize2 className="h-4 w-4" />
                ) : (
                  <Maximize2 className="h-4 w-4" />
                )}
              </Button>
              <SheetClose asChild>
                <Button variant="ghost" size="icon">
                  <CloseIcon className="h-4 w-4" />
                </Button>
              </SheetClose>
            </div>
          </div>
          <div className="flex-1 overflow-hidden">
            <CompareZipFiles
              zipFiles={zipFiles}
              isOpen={true}
              onClose={onClose}
              selectedFiles={selectedFiles}
              hideHeader={true}
            />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default CompareDrawer;
