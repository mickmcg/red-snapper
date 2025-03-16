import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { getOutFilesForZip } from "../lib/indexedDB";
import { ScrollArea } from "./ui/scroll-area";
import { FileText, ArrowRight, ArrowLeft, Check } from "lucide-react";
import FileDiffViewer from "./FileDiffViewer";

interface ZipFile {
  id: string;
  filename: string;
  lastOpened: Date;
  size: number;
  lineCount: number;
  numFiles?: number;
  metadata?: Record<string, string>;
}

interface CompareZipFilesProps {
  zipFiles: ZipFile[];
  onClose: () => void;
  isOpen: boolean;
  selectedFiles?: ZipFile[];
  hideHeader?: boolean;
}

interface OutFile {
  name: string;
  content: string;
  lineCount: number;
}

interface ComparisonResult {
  fileName: string;
  inFirstOnly: boolean;
  inSecondOnly: boolean;
  different: boolean;
  firstLineCount?: number;
  secondLineCount?: number;
}

const CompareZipFiles: React.FC<CompareZipFilesProps> = ({
  zipFiles = [],
  onClose = () => {},
  isOpen = true,
  selectedFiles = [],
  hideHeader = false,
}) => {
  const [firstZipFile, setFirstZipFile] = useState<ZipFile | null>(null);
  const [secondZipFile, setSecondZipFile] = useState<ZipFile | null>(null);
  const [firstZipFiles, setFirstZipFiles] = useState<OutFile[]>([]);
  const [secondZipFiles, setSecondZipFiles] = useState<OutFile[]>([]);
  const [comparisonResults, setComparisonResults] = useState<
    ComparisonResult[]
  >([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [firstFileContent, setFirstFileContent] = useState<string>("");
  const [secondFileContent, setSecondFileContent] = useState<string>("");
  const [selectionMode, setSelectionMode] = useState<boolean>(false);
  const [diffCounts, setDiffCounts] = useState<Map<string, number>>(new Map());

  // Initialize with selected files if provided
  useEffect(() => {
    if (selectedFiles.length === 2) {
      setFirstZipFile(selectedFiles[0]);
      setSecondZipFile(selectedFiles[1]);
      setSelectionMode(false);
    } else if (zipFiles.length >= 2) {
      setSelectionMode(true);
    }
  }, [selectedFiles, zipFiles]);

  // Load files when zip files are selected
  useEffect(() => {
    const loadZipFiles = async () => {
      if (firstZipFile && secondZipFile) {
        setIsLoading(true);
        try {
          const firstFiles = await getOutFilesForZip(firstZipFile.filename);
          const secondFiles = await getOutFilesForZip(secondZipFile.filename);

          const firstOutFiles = firstFiles.map((file) => ({
            name: file.filename,
            content: file.content,
            lineCount: file.lineCount,
          }));

          const secondOutFiles = secondFiles.map((file) => ({
            name: file.filename,
            content: file.content,
            lineCount: file.lineCount,
          }));

          setFirstZipFiles(firstOutFiles);
          setSecondZipFiles(secondOutFiles);

          // Compare files
          compareFiles(firstOutFiles, secondOutFiles);

          // Exit selection mode once files are loaded
          setSelectionMode(false);
        } catch (error) {
          console.error("Error loading zip files for comparison:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadZipFiles();
  }, [firstZipFile, secondZipFile]);

  // Compare files and generate comparison results
  const compareFiles = (firstFiles: OutFile[], secondFiles: OutFile[]) => {
    const results: ComparisonResult[] = [];
    const firstFileMap = new Map(firstFiles.map((file) => [file.name, file]));
    const secondFileMap = new Map(secondFiles.map((file) => [file.name, file]));
    const newDiffCounts = new Map<string, number>();

    // Check files in first zip
    for (const file of firstFiles) {
      const secondFile = secondFileMap.get(file.name);

      if (!secondFile) {
        // File only in first zip
        results.push({
          fileName: file.name,
          inFirstOnly: true,
          inSecondOnly: false,
          different: false,
          firstLineCount: file.lineCount,
        });
        newDiffCounts.set(file.name, file.lineCount);
      } else {
        // File in both zips, check if content is different
        const isDifferent = file.content !== secondFile.content;
        results.push({
          fileName: file.name,
          inFirstOnly: false,
          inSecondOnly: false,
          different: isDifferent,
          firstLineCount: file.lineCount,
          secondLineCount: secondFile.lineCount,
        });

        if (isDifferent) {
          const diffCount = computeLineDiff(file.content, secondFile.content);
          // Ensure we have at least 1 diff count for different files
          newDiffCounts.set(file.name, diffCount > 0 ? diffCount : 1);
        } else {
          newDiffCounts.set(file.name, 0);
        }
      }
    }

    // Check for files only in second zip
    for (const file of secondFiles) {
      if (!firstFileMap.has(file.name)) {
        results.push({
          fileName: file.name,
          inFirstOnly: false,
          inSecondOnly: true,
          different: false,
          secondLineCount: file.lineCount,
        });
        newDiffCounts.set(file.name, file.lineCount);
      }
    }

    // Sort results: different files first, then files in only one zip, then alphabetically
    results.sort((a, b) => {
      if (a.different && !b.different) return -1;
      if (!a.different && b.different) return 1;
      if (
        (a.inFirstOnly || a.inSecondOnly) &&
        !(b.inFirstOnly || b.inSecondOnly)
      )
        return -1;
      if (
        !(a.inFirstOnly || a.inSecondOnly) &&
        (b.inFirstOnly || b.inSecondOnly)
      )
        return 1;
      return a.fileName.localeCompare(b.fileName);
    });

    setDiffCounts(newDiffCounts);
    setComparisonResults(results);
  };

  // Calculate the actual line differences between two files
  const calculateLineDiff = (fileName: string): number => {
    return diffCounts.get(fileName) || 0;
  };

  // Compute the actual line differences for a file
  const computeLineDiff = (
    firstContent: string,
    secondContent: string,
  ): number => {
    if (!firstContent && !secondContent) return 0;
    if (!firstContent || !secondContent)
      return Math.max(
        firstContent?.split("\n").length || 0,
        secondContent?.split("\n").length || 0,
      );

    const lines1 = firstContent.split("\n");
    const lines2 = secondContent.split("\n");

    let diffCount = 0;
    const maxLen = Math.max(lines1.length, lines2.length);

    for (let i = 0; i < maxLen; i++) {
      if (i >= lines1.length || i >= lines2.length || lines1[i] !== lines2[i]) {
        diffCount++;
      }
    }

    // Ensure we return at least 1 if the files are different but the algorithm didn't catch it
    if (diffCount === 0 && firstContent !== secondContent) {
      diffCount = 1;
    }

    return diffCount;
  };

  // Handle file selection for diff view
  const handleFileSelect = (fileName: string) => {
    setSelectedFile(fileName);

    // Find file contents
    const firstFile = firstZipFiles.find((file) => file.name === fileName);
    const secondFile = secondZipFiles.find((file) => file.name === fileName);

    setFirstFileContent(firstFile?.content || "");
    setSecondFileContent(secondFile?.content || "");
  };

  // Reset selections
  const resetSelections = () => {
    setFirstZipFile(null);
    setSecondZipFile(null);
    setFirstZipFiles([]);
    setSecondZipFiles([]);
    setComparisonResults([]);
    setSelectedFile(null);
    setFirstFileContent("");
    setSecondFileContent("");
    setDiffCounts(new Map());
  };

  if (!isOpen) return null;

  return (
    <div className="h-full bg-background overflow-hidden flex flex-col">
      {selectionMode && !hideHeader ? (
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-4xl mx-auto bg-card rounded-lg border border-border shadow-lg">
            <div className="p-6 border-b border-border">
              <h3 className="text-xl font-medium text-card-foreground mb-2">
                Select Two Zip Files to Compare
              </h3>
              <p className="text-muted-foreground mb-4">
                Choose two files from your previously loaded zip files to
                compare their contents.
              </p>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 gap-6">
                {zipFiles.map((zipFile) => (
                  <div
                    key={zipFile.id}
                    className={`p-4 rounded-lg border ${firstZipFile?.id === zipFile.id ? "border-blue-500 bg-blue-100 dark:bg-blue-950/30" : secondZipFile?.id === zipFile.id ? "border-purple-500 bg-purple-100 dark:bg-purple-950/30" : "border-border hover:border-border/80"} cursor-pointer transition-colors`}
                    onClick={() => {
                      if (firstZipFile?.id === zipFile.id) {
                        setFirstZipFile(null);
                      } else if (secondZipFile?.id === zipFile.id) {
                        setSecondZipFile(null);
                      } else if (!firstZipFile) {
                        setFirstZipFile(zipFile);
                      } else if (!secondZipFile) {
                        setSecondZipFile(zipFile);
                      }
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <FileText className="h-5 w-5 text-blue-500" />
                          <h4 className="font-medium text-card-foreground">
                            {zipFile.filename}
                          </h4>
                        </div>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-muted-foreground">
                          <div>
                            <span className="text-muted-foreground/70">
                              Size:
                            </span>{" "}
                            {(zipFile.size / 1024).toFixed(2)} KB
                          </div>
                          <div>
                            <span className="text-muted-foreground/70">
                              Files:
                            </span>{" "}
                            {zipFile.numFiles}
                          </div>
                          <div>
                            <span className="text-muted-foreground/70">
                              Version:
                            </span>{" "}
                            {zipFile.metadata?.SNAP_VERSION || "N/A"}
                          </div>
                          <div>
                            <span className="text-muted-foreground/70">
                              Hostname:
                            </span>{" "}
                            {zipFile.metadata?.SNAP_HOSTNAME || "N/A"}
                          </div>
                        </div>
                      </div>
                      <div className="ml-4">
                        {firstZipFile?.id === zipFile.id && (
                          <div className="flex items-center justify-center h-6 w-6 rounded-full bg-blue-500 text-white">
                            <span className="text-xs font-bold">1</span>
                          </div>
                        )}
                        {secondZipFile?.id === zipFile.id && (
                          <div className="flex items-center justify-center h-6 w-6 rounded-full bg-purple-500 text-white">
                            <span className="text-xs font-bold">2</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex justify-between">
                <Button variant="outline" onClick={resetSelections}>
                  Reset Selections
                </Button>
                <Button
                  disabled={!firstZipFile || !secondZipFile}
                  onClick={() => {
                    if (firstZipFile && secondZipFile) {
                      // This will trigger the useEffect to load files
                    }
                  }}
                  className="flex items-center gap-2"
                >
                  <Check className="h-4 w-4" />
                  Compare Files
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Selection and comparison area */}
          <div className="w-full md:w-1/3 border-r border-border flex flex-col">
            {!hideHeader && (
              <div className="p-4 border-b border-border">
                <h3 className="font-medium text-foreground mb-4">
                  Selected Zip Files
                </h3>

                {/* First zip file info */}
                <div className="mb-4 p-3 bg-blue-100 dark:bg-blue-950/30 rounded-md border border-blue-300 dark:border-blue-900">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center h-5 w-5 rounded-full bg-blue-500 text-white">
                      <span className="text-xs font-bold">1</span>
                    </div>
                    <span className="font-medium text-foreground">
                      {firstZipFile?.filename}
                    </span>
                  </div>
                </div>

                {/* Second zip file info */}
                <div className="mb-4 p-3 bg-purple-100 dark:bg-purple-950/30 rounded-md border border-purple-300 dark:border-purple-900">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center h-5 w-5 rounded-full bg-purple-500 text-white">
                      <span className="text-xs font-bold">2</span>
                    </div>
                    <span className="font-medium text-foreground">
                      {secondZipFile?.filename}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectionMode(true);
                      setSelectedFile(null);
                      setFirstFileContent("");
                      setSecondFileContent("");
                    }}
                  >
                    Change Files
                  </Button>
                  <div className="text-sm text-muted-foreground">
                    {isLoading
                      ? "Loading files..."
                      : `${comparisonResults.length} files compared`}
                  </div>
                </div>
              </div>
            )}

            {/* Comparison results */}
            {firstZipFile && secondZipFile && !isLoading && (
              <div className="flex-1 overflow-hidden">
                <div className="p-3 border-b border-border">
                  <h3 className="font-medium text-foreground">
                    Comparison Results
                  </h3>
                </div>
                <ScrollArea className="h-[calc(100%-3rem)]">
                  <div className="p-2">
                    <ul className="space-y-1">
                      {comparisonResults.map((result) => (
                        <li key={result.fileName}>
                          <button
                            className={`w-full text-left px-3 py-2 rounded flex items-center ${selectedFile === result.fileName ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground"}`}
                            onClick={() => handleFileSelect(result.fileName)}
                          >
                            <FileText className="h-4 w-4 mr-2 flex-shrink-0" />
                            <div className="flex-1 truncate">
                              {result.fileName}
                            </div>
                            <div className="ml-2 flex items-center">
                              {result.inFirstOnly && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                                  <ArrowLeft className="h-3 w-3 mr-1" /> Only in
                                  first
                                </span>
                              )}
                              {result.inSecondOnly && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300">
                                  <ArrowRight className="h-3 w-3 mr-1" /> Only
                                  in second
                                </span>
                              )}
                              {result.different ? (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300">
                                  {result.firstLineCount !== undefined &&
                                  result.secondLineCount !== undefined
                                    ? `${calculateLineDiff(result.fileName)} line${calculateLineDiff(result.fileName) !== 1 ? "s" : ""} diff`
                                    : "Different"}
                                </span>
                              ) : (
                                !result.inFirstOnly &&
                                !result.inSecondOnly && (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                                    Identical
                                  </span>
                                )
                              )}
                            </div>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                </ScrollArea>
              </div>
            )}
          </div>

          {/* Diff viewer area */}
          <div className="flex-1 overflow-hidden">
            {selectedFile ? (
              <div className="h-full">
                <FileDiffViewer
                  fileName={selectedFile}
                  firstContent={firstFileContent}
                  secondContent={secondFileContent}
                  firstFileName={firstZipFile?.filename || ""}
                  secondFileName={secondZipFile?.filename || ""}
                />
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                {firstZipFile && secondZipFile
                  ? "Select a file from the comparison results to view differences"
                  : "Select two zip files to compare"}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CompareZipFiles;
