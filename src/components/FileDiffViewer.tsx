import React, { useState, useEffect, useRef } from "react";
import { ScrollArea } from "./ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

interface FileDiffViewerProps {
  fileName: string;
  firstContent: string;
  secondContent: string;
  firstFileName: string;
  secondFileName: string;
}

interface DiffLine {
  lineNumber1?: number;
  lineNumber2?: number;
  content: string;
  type: "same" | "added" | "removed" | "header";
}

const FileDiffViewer: React.FC<FileDiffViewerProps> = ({
  fileName = "",
  firstContent = "",
  secondContent = "",
  firstFileName = "",
  secondFileName = "",
}) => {
  const [diffLines, setDiffLines] = useState<DiffLine[]>([]);
  const [activeTab, setActiveTab] = useState<string>("diff");

  // Refs for the scroll areas
  const leftScrollRef = useRef<HTMLDivElement>(null);
  const rightScrollRef = useRef<HTMLDivElement>(null);

  // Flag to prevent infinite scroll loop
  const isScrollingSynced = useRef(false);

  useEffect(() => {
    if (fileName && firstContent && secondContent) {
      const diff = computeDiff(firstContent, secondContent);
      setDiffLines(diff);
    } else if (fileName && firstContent) {
      // Only in first file
      const lines = firstContent.split("\n");
      const diff: DiffLine[] = lines.map((line, index) => ({
        lineNumber1: index + 1,
        content: line,
        type: "removed",
      }));
      setDiffLines(diff);
    } else if (fileName && secondContent) {
      // Only in second file
      const lines = secondContent.split("\n");
      const diff: DiffLine[] = lines.map((line, index) => ({
        lineNumber2: index + 1,
        content: line,
        type: "added",
      }));
      setDiffLines(diff);
    }
  }, [fileName, firstContent, secondContent]);

  const computeDiff = (text1: string, text2: string): DiffLine[] => {
    const lines1 = text1.split("\n");
    const lines2 = text2.split("\n");
    const result: DiffLine[] = [];

    // Simple line-by-line diff algorithm
    let i = 0,
      j = 0;

    while (i < lines1.length || j < lines2.length) {
      if (i < lines1.length && j < lines2.length && lines1[i] === lines2[j]) {
        // Lines are the same
        result.push({
          lineNumber1: i + 1,
          lineNumber2: j + 1,
          content: lines1[i],
          type: "same",
        });
        i++;
        j++;
      } else {
        // Try to find the next matching line
        let foundMatch = false;

        // Look ahead in the second file
        for (let k = 1; k <= 3 && j + k < lines2.length; k++) {
          if (i < lines1.length && lines1[i] === lines2[j + k]) {
            // Found a match, add the added lines from the second file
            for (let l = 0; l < k; l++) {
              result.push({
                lineNumber2: j + l + 1,
                content: lines2[j + l],
                type: "added",
              });
            }
            j += k;
            foundMatch = true;
            break;
          }
        }

        if (!foundMatch) {
          // Look ahead in the first file
          for (let k = 1; k <= 3 && i + k < lines1.length; k++) {
            if (j < lines2.length && lines1[i + k] === lines2[j]) {
              // Found a match, add the removed lines from the first file
              for (let l = 0; l < k; l++) {
                result.push({
                  lineNumber1: i + l + 1,
                  content: lines1[i + l],
                  type: "removed",
                });
              }
              i += k;
              foundMatch = true;
              break;
            }
          }
        }

        if (!foundMatch) {
          // No match found within the lookahead, treat as a change
          if (i < lines1.length) {
            result.push({
              lineNumber1: i + 1,
              content: lines1[i],
              type: "removed",
            });
            i++;
          }

          if (j < lines2.length) {
            result.push({
              lineNumber2: j + 1,
              content: lines2[j],
              type: "added",
            });
            j++;
          }
        }
      }
    }

    return result;
  };

  const getLineClass = (type: string) => {
    switch (type) {
      case "added":
        return "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300";
      case "removed":
        return "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300";
      case "header":
        return "bg-accent text-accent-foreground font-medium";
      default:
        return "text-foreground";
    }
  };

  return (
    <div
      className="h-full flex flex-col isolate focus:outline-none"
      onClick={(e) => e.stopPropagation()}
      onWheel={(e) => e.stopPropagation()}
      tabIndex={0}
    >
      <div className="p-4 border-b border-border flex justify-between items-center bg-background">
        <h3 className="font-medium text-foreground">{fileName}</h3>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-auto">
          <TabsList>
            <TabsTrigger value="diff">Diff View</TabsTrigger>
            <TabsTrigger value="side">Side by Side</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="flex-1 overflow-hidden relative">
        {activeTab === "diff" && (
          <div className="h-full overflow-hidden">
            <div className="p-4 h-full overflow-hidden">
              <div
                className="overflow-x-auto overflow-y-auto max-h-full"
                onClick={(e) => e.stopPropagation()}
                onWheel={(e) => e.stopPropagation()}
              >
                <pre className="font-mono text-sm">
                  <table
                    className="border-collapse"
                    style={{ minWidth: "max-content" }}
                  >
                    <tbody>
                      {diffLines.map((line, index) => (
                        <tr
                          key={index}
                          className={`${getLineClass(line.type)}`}
                        >
                          <td
                            className="pr-4 text-right text-muted-foreground select-none"
                            style={{ width: "4rem", minWidth: "4rem" }}
                          >
                            {line.lineNumber1 || " "}
                          </td>
                          <td
                            className="pr-4 text-right text-muted-foreground select-none"
                            style={{ width: "4rem", minWidth: "4rem" }}
                          >
                            {line.lineNumber2 || " "}
                          </td>
                          <td
                            className="pl-4 whitespace-pre"
                            style={{ minWidth: "max-content" }}
                          >
                            {line.content}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </pre>
              </div>
            </div>
          </div>
        )}

        {activeTab === "side" && (
          <div className="flex h-full">
            <div className="w-1/2 border-r border-border overflow-hidden">
              <div className="p-2 border-b border-border bg-card">
                <h4 className="text-sm font-medium text-card-foreground truncate">
                  {firstFileName}
                </h4>
              </div>
              <div
                className="h-[calc(100%-2.5rem)] overflow-x-auto overflow-y-auto"
                ref={leftScrollRef}
                onClick={(e) => e.stopPropagation()}
                onWheel={(e) => e.stopPropagation()}
                onScroll={(e) => {
                  if (isScrollingSynced.current) return;
                  e.stopPropagation();

                  if (rightScrollRef.current && leftScrollRef.current) {
                    isScrollingSynced.current = true;

                    const rightViewport = rightScrollRef.current;
                    if (rightViewport) {
                      rightViewport.scrollTop = leftScrollRef.current.scrollTop;
                      rightViewport.scrollLeft =
                        leftScrollRef.current.scrollLeft;
                    }

                    setTimeout(() => {
                      isScrollingSynced.current = false;
                    }, 50);
                  }
                }}
              >
                <div className="p-4">
                  <pre className="font-mono text-sm">
                    <table
                      className="border-collapse"
                      style={{ minWidth: "max-content" }}
                    >
                      <tbody>
                        {firstContent.split("\n").map((line, index) => (
                          <tr
                            key={index}
                            className={
                              diffLines.some(
                                (l) =>
                                  l.lineNumber1 === index + 1 &&
                                  l.type === "removed",
                              )
                                ? "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300"
                                : "text-foreground"
                            }
                          >
                            <td
                              className="pr-4 text-right text-muted-foreground select-none"
                              style={{ width: "4rem", minWidth: "4rem" }}
                            >
                              {index + 1}
                            </td>
                            <td
                              className="pl-4 whitespace-pre"
                              style={{ minWidth: "max-content" }}
                            >
                              {line}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </pre>
                </div>
              </div>
            </div>
            <div className="w-1/2 overflow-hidden">
              <div className="p-2 border-b border-border bg-card">
                <h4 className="text-sm font-medium text-card-foreground truncate">
                  {secondFileName}
                </h4>
              </div>
              <div
                className="h-[calc(100%-2.5rem)] overflow-x-auto overflow-y-auto"
                ref={rightScrollRef}
                onClick={(e) => e.stopPropagation()}
                onWheel={(e) => e.stopPropagation()}
                onScroll={(e) => {
                  if (isScrollingSynced.current) return;
                  e.stopPropagation();

                  if (leftScrollRef.current && rightScrollRef.current) {
                    isScrollingSynced.current = true;

                    const leftViewport = leftScrollRef.current;
                    if (leftViewport) {
                      leftViewport.scrollTop = rightScrollRef.current.scrollTop;
                      leftViewport.scrollLeft =
                        rightScrollRef.current.scrollLeft;
                    }

                    setTimeout(() => {
                      isScrollingSynced.current = false;
                    }, 50);
                  }
                }}
              >
                <div className="p-4">
                  <pre className="font-mono text-sm">
                    <table
                      className="border-collapse"
                      style={{ minWidth: "max-content" }}
                    >
                      <tbody>
                        {secondContent.split("\n").map((line, index) => (
                          <tr
                            key={index}
                            className={
                              diffLines.some(
                                (l) =>
                                  l.lineNumber2 === index + 1 &&
                                  l.type === "added",
                              )
                                ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
                                : "text-foreground"
                            }
                          >
                            <td
                              className="pr-4 text-right text-muted-foreground select-none"
                              style={{ width: "4rem", minWidth: "4rem" }}
                            >
                              {index + 1}
                            </td>
                            <td
                              className="pl-4 whitespace-pre"
                              style={{ minWidth: "max-content" }}
                            >
                              {line}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </pre>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileDiffViewer;
