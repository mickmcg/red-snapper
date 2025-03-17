import React, { useState, useEffect, useCallback, KeyboardEvent } from "react";
import { ScrollArea } from "../components/ui/scroll-area";
import { Card } from "../components/ui/card";

interface FileContentViewerProps {
  content?: string;
  fileName?: string;
  lineCount?: number;
  isLoading?: boolean;
  onNavigate?: (direction: "up" | "down") => void;
}

const FileContentViewer: React.FC<FileContentViewerProps> = ({
  content = "No content to display. Select a file to view its contents.",
  fileName = "No file selected",
  lineCount = 0,
  isLoading = false,
  onNavigate,
}) => {
  const [lines, setLines] = useState<string[]>([]);

  useEffect(() => {
    if (content) {
      setLines(content.split("\n"));
    } else {
      setLines([]);
    }
  }, [content]);

  // We're removing the global keyboard event listener from FileContentViewer
  // to prevent duplicate navigation events

  // Auto-focus the card when component mounts
  useEffect(() => {
    const cardElement = document.querySelector(".file-content-card");
    if (cardElement) {
      (cardElement as HTMLElement).focus();
    }
  }, []);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (onNavigate) {
        // Allow navigation with just arrow keys (no Alt required)
        if (e.key === "ArrowUp") {
          onNavigate("up");
          e.preventDefault();
          console.log("Up arrow pressed on card");
        } else if (e.key === "ArrowDown") {
          onNavigate("down");
          e.preventDefault();
          console.log("Down arrow pressed on card");
        }
      }
    },
    [onNavigate],
  );

  return (
    <Card
      className="w-full h-full bg-background border-border overflow-hidden file-content-card focus:outline-none"
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <div className="p-4 border-b border-border bg-background flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium text-foreground">{fileName}</h3>
          <p className="text-sm text-muted-foreground">{lineCount} lines</p>
          <p className="text-xs text-muted-foreground mt-1">
            Press Up/Down arrow keys to navigate between files
          </p>
        </div>
        {onNavigate && (
          <div className="flex space-x-2">
            <button
              onClick={() => onNavigate("up")}
              className="p-1 rounded hover:bg-muted"
              aria-label="Previous file"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m18 15-6-6-6 6" />
              </svg>
            </button>
            <button
              onClick={() => onNavigate("down")}
              className="p-1 rounded hover:bg-muted"
              aria-label="Next file"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>
          </div>
        )}
      </div>

      <ScrollArea className="h-[calc(100%-4rem)] w-full bg-background">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="p-4 font-mono text-sm bg-background">
            <table className="w-full">
              <tbody>
                {lines.map((line, index) => (
                  <tr key={index} className="hover:bg-muted/50">
                    <td className="text-right pr-4 text-muted-foreground select-none w-12">
                      {index + 1}
                    </td>
                    <td className="text-foreground whitespace-pre">{line}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </ScrollArea>
    </Card>
  );
};

export default FileContentViewer;
