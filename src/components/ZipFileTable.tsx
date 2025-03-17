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
import {
  ArrowUpDown,
  File,
  Eye,
  Trash2,
  Search,
  Check,
  X,
  History,
  Apple,
  Terminal,
} from "lucide-react";

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
  onClearAll?: () => void;
}

type SortColumn = keyof ZipFile | string;

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
      onClearAll,
    },
    ref,
  ) => {
    const [sortColumn, setSortColumn] = useState<SortColumn>("lastOpened");
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredZipFiles, setFilteredZipFiles] = useState<ZipFile[]>([]);
    const [selectionMode, setSelectionMode] = useState<boolean>(false);
    const [selectedZipFiles, setSelectedZipFiles] = useState<ZipFile[]>([]);

    // Expose the toggleSelectionMode method to parent components
    useImperativeHandle(ref, () => ({
      toggleSelectionMode: () => setSelectionMode((prev) => !prev),
    }));

    const handleSort = (column: SortColumn) => {
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
          (file.metadata?.SNAP_IPADDR || "")
            .toLowerCase()
            .includes(searchLower) ||
          (file.metadata?.SNAP_OS_NAME || "")
            .toLowerCase()
            .includes(searchLower) ||
          (file.metadata?.SNAP_OS_VERSION || "")
            .toLowerCase()
            .includes(searchLower)
        );
      });

      // Sort filtered files
      const sorted = [...filtered].sort((a, b) => {
        // Handle metadata sorting
        if (
          typeof sortColumn === "string" &&
          sortColumn.startsWith("metadata.")
        ) {
          const metadataKey = sortColumn.split(".")[1];
          const valueA = a.metadata?.[metadataKey] || "";
          const valueB = b.metadata?.[metadataKey] || "";

          if (valueA < valueB) return sortDirection === "asc" ? -1 : 1;
          if (valueA > valueB) return sortDirection === "asc" ? 1 : -1;
          return 0;
        }

        // Handle regular column sorting
        const valueA = a[sortColumn as keyof ZipFile];
        const valueB = b[sortColumn as keyof ZipFile];

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

    // Define column widths consistently for both header and data cells
    const columnWidths = {
      select: "50px",
      filename: "250px",
      lastOpened: "180px",
      size: "100px",
      numFiles: "100px",
      snapVersion: "120px",
      snapHostname: "200px",
      snapIpaddr: "120px",
      snapOsName: "120px",
      snapOsVersion: "120px",
      actions: "80px",
    };

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
        <div className="overflow-x-auto">
          <Table className="w-full">
            <TableHeader>
              <TableRow>
                {selectionMode && (
                  <TableHead style={{ width: columnWidths.select }}>
                    Select
                  </TableHead>
                )}
                <TableHead style={{ width: columnWidths.filename }}>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("filename")}
                    className="flex items-center gap-1 font-medium w-full justify-start px-0"
                  >
                    Filename
                    <ArrowUpDown className="h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead style={{ width: columnWidths.lastOpened }}>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("lastOpened")}
                    className="flex items-center gap-1 font-medium w-full justify-start px-0"
                  >
                    Last Opened
                    <ArrowUpDown className="h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead style={{ width: columnWidths.size }}>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("size")}
                    className="flex items-center gap-1 font-medium w-full justify-start px-0"
                  >
                    File Size
                    <ArrowUpDown className="h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead style={{ width: columnWidths.numFiles }}>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("numFiles")}
                    className="flex items-center gap-1 font-medium w-full justify-start px-0"
                  >
                    Num Files
                    <ArrowUpDown className="h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead style={{ width: columnWidths.snapVersion }}>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("metadata.SNAP_VERSION")}
                    className="flex items-center gap-1 font-medium w-full justify-start px-0"
                  >
                    SNAP_VERSION
                    <ArrowUpDown className="h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead style={{ width: columnWidths.snapHostname }}>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("metadata.SNAP_HOSTNAME")}
                    className="flex items-center gap-1 font-medium w-full justify-start px-0"
                  >
                    SNAP_HOSTNAME
                    <ArrowUpDown className="h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead style={{ width: columnWidths.snapIpaddr }}>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("metadata.SNAP_IPADDR")}
                    className="flex items-center gap-1 font-medium w-full justify-start px-0"
                  >
                    SNAP_IPADDR
                    <ArrowUpDown className="h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead style={{ width: columnWidths.snapOsName }}>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("metadata.SNAP_OS_NAME")}
                    className="flex items-center gap-1 font-medium w-full justify-start px-0"
                  >
                    SNAP_OS_NAME
                    <ArrowUpDown className="h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead style={{ width: columnWidths.snapOsVersion }}>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("metadata.SNAP_OS_VERSION")}
                    className="flex items-center gap-1 font-medium w-full justify-start px-0"
                  >
                    SNAP_OS_VERSION
                    <ArrowUpDown className="h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead
                  style={{ width: columnWidths.actions }}
                  className="text-right"
                >
                  Actions
                </TableHead>
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
                      <TableCell style={{ width: columnWidths.select }}>
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
                    <TableCell style={{ width: columnWidths.filename }}>
                      <div className="flex items-center gap-2">
                        <File className="h-5 w-5 text-blue-500 flex-shrink-0" />
                        <span className="truncate">{zipFile.filename}</span>
                      </div>
                    </TableCell>
                    <TableCell style={{ width: columnWidths.lastOpened }}>
                      {formatDate(zipFile.lastOpened)}
                    </TableCell>
                    <TableCell style={{ width: columnWidths.size }}>
                      {formatBytes(zipFile.size)}
                    </TableCell>
                    <TableCell style={{ width: columnWidths.numFiles }}>
                      {(zipFile.numFiles || 0).toLocaleString()}
                    </TableCell>
                    <TableCell style={{ width: columnWidths.snapVersion }}>
                      {zipFile.metadata
                        ? zipFile.metadata["SNAP_VERSION"] || "N/A"
                        : "N/A"}
                    </TableCell>
                    <TableCell style={{ width: columnWidths.snapHostname }}>
                      {zipFile.metadata
                        ? zipFile.metadata["SNAP_HOSTNAME"] || "N/A"
                        : "N/A"}
                    </TableCell>
                    <TableCell style={{ width: columnWidths.snapIpaddr }}>
                      {zipFile.metadata
                        ? zipFile.metadata["SNAP_IPADDR"] || "N/A"
                        : "N/A"}
                    </TableCell>
                    <TableCell style={{ width: columnWidths.snapOsName }}>
                      <div className="flex items-center gap-2">
                        {zipFile.metadata &&
                        zipFile.metadata["SNAP_OS_NAME"] ? (
                          zipFile.metadata["SNAP_OS_NAME"] === "macOS" ? (
                            <Apple className="h-4 w-4 text-gray-600" />
                          ) : zipFile.metadata["SNAP_OS_NAME"].includes(
                              "Linux",
                            ) ? (
                            <Terminal className="h-4 w-4 text-gray-600" />
                          ) : null
                        ) : null}
                        <span>
                          {zipFile.metadata
                            ? zipFile.metadata["SNAP_OS_NAME"] || "N/A"
                            : "N/A"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell style={{ width: columnWidths.snapOsVersion }}>
                      {zipFile.metadata
                        ? zipFile.metadata["SNAP_OS_VERSION"] || "N/A"
                        : "N/A"}
                    </TableCell>
                    <TableCell
                      style={{ width: columnWidths.actions }}
                      className="text-right"
                    >
                      <div className="flex items-center justify-end">
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
                    colSpan={selectionMode ? 11 : 10}
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
      </div>
    );
  },
);

export default ZipFileTable;
