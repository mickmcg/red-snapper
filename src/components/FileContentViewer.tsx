import React, { useState, useEffect } from "react";
import { ScrollArea } from "../components/ui/scroll-area";
import { Card } from "../components/ui/card";

interface FileContentViewerProps {
  content?: string;
  fileName?: string;
  lineCount?: number;
  isLoading?: boolean;
}

const FileContentViewer: React.FC<FileContentViewerProps> = ({
  content = "No content to display. Select a file to view its contents.",
  fileName = "No file selected",
  lineCount = 0,
  isLoading = false,
}) => {
  const [lines, setLines] = useState<string[]>([]);

  useEffect(() => {
    if (content) {
      setLines(content.split("\n"));
    } else {
      setLines([]);
    }
  }, [content]);

  return (
    <Card className="w-full h-full bg-background border-border overflow-hidden">
      <div className="p-4 border-b border-border bg-background flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium text-foreground">{fileName}</h3>
          <p className="text-sm text-muted-foreground">{lineCount} lines</p>
        </div>
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
