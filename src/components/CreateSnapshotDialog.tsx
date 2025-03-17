import React from "react";
import { Button } from "./ui/button";
import { X } from "lucide-react";

const CreateSnapshotDialog = () => {
  return (
    <dialog id="createSnapshotDialog" className="bg-transparent outline-none">
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div className="bg-background rounded-lg shadow-lg max-w-2xl w-full">
          <div className="flex justify-between items-center p-4 border-b border-border">
            <h2 className="text-xl font-semibold text-foreground">
              Create a Snapshot
            </h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => window.createSnapshotDialog?.close()}
              className="h-9 w-9"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          <div className="p-6">
            <p className="mb-4 text-foreground">
              In order to create a snapshot that can be opened with Red Snapper,
              you need to run the following command on the system you want to
              analyze:
            </p>
            <div className="bg-muted p-4 rounded-md mb-4 overflow-x-auto relative group">
              <pre className="text-sm font-mono text-foreground whitespace-pre-wrap">
                curl -L -o collector.zip
                https://github.com/mickmcg/red-snapper/raw/refs/heads/main/collector.zip
                && unzip -o collector.zip && bash collector/red-snapper.sh
              </pre>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(
                    "curl -L -o collector.zip https://github.com/mickmcg/red-snapper/raw/refs/heads/main/collector.zip && unzip -o collector.zip && bash collector/red-snapper.sh",
                  );
                }}
                className="absolute top-2 right-2 p-1.5 rounded-md bg-primary/10 hover:bg-primary/20 text-primary transition-colors"
                aria-label="Copy to clipboard"
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
                  className="lucide lucide-copy"
                >
                  <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                  <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                </svg>
              </button>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              This will download the collector scripts, extract them, and run
              the main script to gather system information. The resulting
              snapshot file can then be uploaded to Red Snapper for analysis.
            </p>
            <div className="flex justify-end">
              <Button
                onClick={() => window.createSnapshotDialog?.close()}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      </div>
    </dialog>
  );
};

export default CreateSnapshotDialog;
