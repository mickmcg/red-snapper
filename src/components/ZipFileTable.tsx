import React, {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { ArrowUpDown, File, Eye, Trash2, Search, Check, X } from "lucide-react";

interface ZipFile {
  id: string;
  filename: string;
  lastOpened: Date;
  size: number;
  lineCount: number;
  numFiles?: number;
  metadata?: Record<string, string>;
}

interface ZipFileTableProps {
  zipFiles?: ZipFile[];
  onZipFileClick?: (zipFile: ZipFile) => void;
  onDeleteZipFile?: (zipFile: ZipFile) => void;
  onCompareFiles?: (zipFiles: ZipFile[]) => void;
}

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

const ZipFileTable = forwardRef<
  { toggleSelectionMode: () => void },
  ZipFileTableProps
>(
  (
    {
      zipFiles = [],
      onZipFileClick = () => {},
      onDeleteZipFile = () => {},
      onCompareFiles = () => {},
    },
    ref,
  ) => {
    const [sortColumn, setSortColumn] = useState<keyof ZipFile>("lastOpened");
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredZipFiles, setFilteredZipFiles] = useState<ZipFile[]>([]);
    const [selectionMode, setSelectionMode] = useState<boolean>(false);
    const [selectedZipFiles, setSelectedZipFiles] = useState<ZipFile[]>([]);

    // Expose the toggleSelectionMode method to parent components
    useImperativeHandle(ref, () => ({
      toggleSelectionMode: () => setSelectionMode((prev) => !prev),
    }));

    const handleSort = (column: keyof ZipFile) => {
      if (sortColumn === column) {
        setSortDirection(sortDirection === "asc" ? "desc" : "asc");
      } else {
        setSortColumn(column);
        setSortDirection("asc");
      }
    };

    const toggleSelection = (zipFile: ZipFile, e: React.MouseEvent) => {
      e.stopPropagation();
      if (selectedZipFiles.some((file) => file.id === zipFile.id)) {
        setSelectedZipFiles(
          selectedZipFiles.filter((file) => file.id !== zipFile.id),
        );
      } else if (selectedZipFiles.length < 2) {
        setSelectedZipFiles([...selectedZipFiles, zipFile]);
      }
    };

    const handleCompare = () => {
      if (selectedZipFiles.length === 2) {
        onCompareFiles(selectedZipFiles);
        setSelectionMode(false);
        setSelectedZipFiles([]);
      }
    };

    const cancelSelection = () => {
      setSelectionMode(false);
      setSelectedZipFiles([]);
    };

    useEffect(() => {
      // Filter files based on search term
      const filtered = zipFiles.filter((file) => {
        const searchLower = searchTerm.toLowerCase();
        return (
          file.filename.toLowerCase().includes(searchLower) ||
          (file.metadata?.SNAP_VERSION || "")
            .toLowerCase()
            .includes(searchLower) ||
          (file.metadata?.SNAP_HOSTNAME || "")
            .toLowerCase()
            .includes(searchLower) ||
          (file.metadata?.SNAP_IPADDR || "").toLowerCase().includes(searchLower)
        );
      });

      // Sort filtered files
      const sorted = [...filtered].sort((a, b) => {
        const valueA = a[sortColumn];
        const valueB = b[sortColumn];

        if (valueA < valueB) return sortDirection === "asc" ? -1 : 1;
        if (valueA > valueB) return sortDirection === "asc" ? 1 : -1;
        return 0;
      });

      setFilteredZipFiles(sorted);
    }, [zipFiles, searchTerm, sortColumn, sortDirection]);

    // Reset selection when exiting selection mode
    useEffect(() => {
      if (!selectionMode) {
        setSelectedZipFiles([]);
      }
    }, [selectionMode]);

    return (
      <div className="w-full bg-background rounded-md shadow-sm border">
        <div className="p-4 border-b flex justify-between items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search files by name or metadata..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 w-full"
            />
          </div>
          {selectionMode && (
            <div className="flex items-center gap-2 ml-4">
              <div className="text-sm text-muted-foreground">
                {selectedZipFiles.length}/2 files selected
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={cancelSelection}
                className="flex items-center gap-1"
              >
                <X className="h-4 w-4" />
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleCompare}
                disabled={selectedZipFiles.length !== 2}
                className="flex items-center gap-1"
              >
                <Check className="h-4 w-4" />
                Compare
              </Button>
            </div>
          )}
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              {selectionMode && (
                <TableHead className="w-[50px]">Select</TableHead>
              )}
              <TableHead className="w-[300px]">
                <Button
                  variant="ghost"
                  onClick={() => handleSort("filename")}
                  className="flex items-center gap-1 font-medium"
                >
                  Filename
                  <ArrowUpDown className="h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort("lastOpened")}
                  className="flex items-center gap-1 font-medium"
                >
                  Last Opened
                  <ArrowUpDown className="h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort("size")}
                  className="flex items-center gap-1 font-medium"
                >
                  File Size
                  <ArrowUpDown className="h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort("numFiles")}
                  className="flex items-center gap-1 font-medium"
                >
                  Num Files
                  <ArrowUpDown className="h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  className="flex items-center gap-1 font-medium"
                >
                  SNAP_VERSION
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  className="flex items-center gap-1 font-medium"
                >
                  SNAP_HOSTNAME
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  className="flex items-center gap-1 font-medium"
                >
                  SNAP_IPADDR
                </Button>
              </TableHead>
              <TableHead className="w-[80px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredZipFiles.length > 0 ? (
              filteredZipFiles.map((zipFile) => (
                <TableRow
                  key={zipFile.id}
                  className={`${selectionMode ? "" : "cursor-pointer"} hover:bg-muted/50 ${selectedZipFiles.some((file) => file.id === zipFile.id) ? "bg-muted" : ""}`}
                  onClick={
                    selectionMode ? undefined : () => onZipFileClick(zipFile)
                  }
                >
                  {selectionMode && (
                    <TableCell className="w-[50px]">
                      <div
                        className={`h-5 w-5 rounded border ${selectedZipFiles.some((file) => file.id === zipFile.id) ? "bg-primary border-primary" : "border-muted-foreground"} flex items-center justify-center cursor-pointer`}
                        onClick={(e) => toggleSelection(zipFile, e)}
                      >
                        {selectedZipFiles.some(
                          (file) => file.id === zipFile.id,
                        ) && (
                          <Check className="h-3 w-3 text-primary-foreground" />
                        )}
                      </div>
                    </TableCell>
                  )}
                  <TableCell className="font-medium flex items-center gap-2">
                    <File className="h-5 w-5 text-blue-500" />
                    {zipFile.filename}
                  </TableCell>
                  <TableCell>{formatDate(zipFile.lastOpened)}</TableCell>
                  <TableCell>{formatBytes(zipFile.size)}</TableCell>
                  <TableCell>
                    {(zipFile.numFiles || 0).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    {zipFile.metadata
                      ? zipFile.metadata["SNAP_VERSION"] || "N/A"
                      : "N/A"}
                  </TableCell>
                  <TableCell>
                    {zipFile.metadata
                      ? zipFile.metadata["SNAP_HOSTNAME"] || "N/A"
                      : "N/A"}
                  </TableCell>
                  <TableCell>
                    {zipFile.metadata
                      ? zipFile.metadata["SNAP_IPADDR"] || "N/A"
                      : "N/A"}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteZipFile(zipFile);
                        }}
                        className="flex items-center gap-1 text-red-500 hover:text-red-600 hover:bg-red-100/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={selectionMode ? 9 : 8}
                  className="text-center py-10 text-muted-foreground"
                >
                  {zipFiles.length > 0
                    ? `No files match "${searchTerm}". Try a different search term.`
                    : "No zip files have been loaded yet."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    );
  },
);

export default ZipFileTable;
