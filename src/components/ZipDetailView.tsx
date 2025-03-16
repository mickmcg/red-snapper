import React, { useState, useEffect } from "react";
import { getOutFilesForZip } from "../lib/indexedDB";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Button } from "./ui/button";
import { X, FileText, Download, Maximize2, Minimize2 } from "lucide-react";
import FileContentViewer from "./FileContentViewer";
import FileDrawer from "./FileDrawer";
import { ScrollArea } from "./ui/scroll-area";

interface ZipFile {
  name: string;
  size: number;
  lastOpened: Date;
  lineCount: number;
  numFiles?: number;
  metadata?: Record<string, string>;
}

interface OutFile {
  name: string;
  content: string;
  lineCount: number;
}

interface ZipDetailViewProps {
  zipFile?: ZipFile;
  onClose?: () => void;
  isOpen?: boolean;
}

const ZipDetailView: React.FC<ZipDetailViewProps> = ({
  zipFile = {
    name: "",
    size: 0,
    lastOpened: new Date(),
    lineCount: 0,
    numFiles: 0,
  },
  onClose = () => {},
  isOpen = true,
}) => {
  const [activeTab, setActiveTab] = useState<string>("");
  const [outFiles, setOutFiles] = useState<OutFile[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedFile, setSelectedFile] = useState<OutFile | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Load .out files from the zip
  useEffect(() => {
    if (isOpen && zipFile) {
      setIsLoading(true);

      // Fetch the files from IndexedDB
      const fetchOutFiles = async () => {
        try {
          // Try to get files from IndexedDB
          const dbFiles = await getOutFilesForZip(zipFile.name);

          // If we have files in the database, use them
          if (dbFiles && dbFiles.length > 0) {
            const outFilesFromDB: OutFile[] = dbFiles.map((file) => ({
              name: file.filename,
              content: file.content,
              lineCount: file.lineCount,
            }));

            setOutFiles(outFilesFromDB);
            if (outFilesFromDB.length > 0) {
              setActiveTab(outFilesFromDB[0].name);
            }
          } else {
            // No files found in DB
            setOutFiles([]);
          }

          setIsLoading(false);
        } catch (error) {
          console.error("Error fetching .out files:", error);
          setIsLoading(false);
        }
      };

      fetchOutFiles();
    }
  }, [isOpen, zipFile?.name]);

  if (!isOpen) return null;

  const activeFile = outFiles.find((file) => file.name === activeTab);
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div
      className={`fixed inset-y-0 right-0 z-40 bg-background shadow-xl flex flex-col transition-all duration-300 ease-in-out ${isOpen ? (isFullscreen ? "w-full" : "w-[1400px]") : "w-0 opacity-0"}`}
    >
      {selectedFile && (
        <FileDrawer
          file={selectedFile}
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
        />
      )}
      <div className="flex justify-between items-center p-4 border-b border-border bg-background">
        <div>
          <h2 className="text-xl font-semibold text-foreground">
            {zipFile.name}
          </h2>
          <p className="text-sm text-muted-foreground mb-2">
            {formatFileSize(zipFile.size)} • {zipFile.numFiles || 0} files •
            Last opened: {zipFile.lastOpened.toLocaleString()}
          </p>
          <div className="flex flex-wrap gap-2">
            {zipFile.metadata?.SNAP_VERSION && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                Version: {zipFile.metadata.SNAP_VERSION}
              </span>
            )}
            {zipFile.metadata?.SNAP_HOSTNAME && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                Host: {zipFile.metadata.SNAP_HOSTNAME}
              </span>
            )}
            {zipFile.metadata?.SNAP_IPADDR && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300">
                IP: {zipFile.metadata.SNAP_IPADDR}
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleFullscreen}
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          >
            {isFullscreen ? (
              <Minimize2 className="h-5 w-5" />
            ) : (
              <Maximize2 className="h-5 w-5" />
            )}
          </Button>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* File list sidebar */}
        <div className="w-64 border-r border-border bg-muted/30">
          <div className="p-3 border-b border-border">
            <h3 className="font-medium text-foreground">Files</h3>
          </div>
          <ScrollArea className="h-[calc(100%-3rem)]">
            <div className="p-2">
              {isLoading ? (
                <div className="flex justify-center p-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                <ul className="space-y-1">
                  {outFiles.map((file) => (
                    <li key={file.name}>
                      <button
                        className={`w-full text-left px-3 py-2 rounded flex items-center ${activeTab === file.name ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground"}`}
                        onClick={() => setActiveTab(file.name)}
                      >
                        <FileText className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span className="truncate">{file.name}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : outFiles.length > 0 ? (
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="h-full flex flex-col"
            >
              <TabsList className="bg-muted/30 border-b border-border px-4 h-12 justify-start overflow-x-auto">
                {outFiles.map((file) => (
                  <TabsTrigger
                    key={file.name}
                    value={file.name}
                    className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground"
                  >
                    {file.name}
                  </TabsTrigger>
                ))}
              </TabsList>

              <ScrollArea className="flex-1">
                {outFiles.map((file) => (
                  <TabsContent
                    key={file.name}
                    value={file.name}
                    className="flex-1 p-0 m-0 h-full"
                  >
                    <FileContentViewer
                      fileName={file.name}
                      content={file.content}
                      lineCount={file.lineCount}
                    />
                  </TabsContent>
                ))}
              </ScrollArea>
            </Tabs>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              No .out files found in this zip archive
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ZipDetailView;
