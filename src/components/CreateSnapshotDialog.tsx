import React, { useState } from "react";
import { Button } from "./ui/button";
import { X, Monitor, Apple, Terminal, Check } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs";
import { useToast } from "./ui/use-toast";

const CreateSnapshotDialog = () => {
  const [activeTab, setActiveTab] = useState("linux");
  const [copyStatus, setCopyStatus] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  const commandMap = {
    linux:
      "curl -L -o red-snapper-collector.tar.gz https://github.com/mickmcg/red-snapper/raw/refs/heads/main/collector-releases/red-snapper-collector-0.2.tar.gz && tar -xzvf red-snapper-collector.tar.gz && bash red-snapper-collector/snapshot.sh",
    macos:
      "curl -L -o red-snapper-collector.tar.gz https://github.com/mickmcg/red-snapper/raw/refs/heads/main/collector-releases/red-snapper-collector-0.2.tar.gz && tar -xzvf red-snapper-collector.tar.gz && bash red-snapper-collector/snapshot.sh",
    windows:
      "powershell -Command \"Invoke-WebRequest -Uri 'https://github.com/mickmcg/red-snapper/raw/refs/heads/main/collector-releases/red-snapper-collector-0.2.tar.gz' -OutFile 'red-snapper-collector.tar.gz'\" && tar -xzvf red-snapper-collector.tar.gz && .\\red-snapper-collector\\snapshot.bat",
  };

  const copyToClipboard = (text: string, os: string) => {
    navigator.clipboard.writeText(text);

    // Show visual feedback
    setCopyStatus({ ...copyStatus, [os]: true });

    // Show toast notification
    toast({
      title: "Command copied",
      description: "The command has been copied to your clipboard.",
      duration: 2000,
    });

    // Reset the copy status after a short delay
    setTimeout(() => {
      setCopyStatus({ ...copyStatus, [os]: false });
    }, 1500);
  };

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
              onClick={() => (window as any).createSnapshotDialog?.close()}
              className="h-9 w-9"
            >
              <X className="h-5 w-5 dark:text-white" />
            </Button>
          </div>
          <div className="p-6">
            <p className="mb-4 text-foreground">
              In order to create a snapshot that can be opened with Red Snapper,
              you need to run the following command on the system you want to
              analyze:
            </p>

            <Tabs
              defaultValue="linux"
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid grid-cols-3 mb-4 w-full">
                <TabsTrigger value="linux" className="flex items-center gap-2">
                  <Terminal className="h-4 w-4" />
                  Linux
                </TabsTrigger>
                <TabsTrigger value="macos" className="flex items-center gap-2">
                  <Apple className="h-4 w-4" />
                  macOS
                </TabsTrigger>
                <TabsTrigger
                  value="windows"
                  className="flex items-center gap-2"
                >
                  <Monitor className="h-4 w-4" />
                  Windows
                </TabsTrigger>
              </TabsList>

              {Object.entries(commandMap).map(([os, command]) => (
                <TabsContent key={os} value={os} className="mt-0">
                  <div className="bg-muted p-4 rounded-md mb-4 overflow-x-auto relative group">
                    <pre className="text-sm font-mono text-foreground whitespace-pre-wrap">
                      {command}
                    </pre>
                    <button
                      onClick={() => copyToClipboard(command, os)}
                      className={`absolute top-2 right-2 p-1.5 rounded-md ${copyStatus[os] ? "bg-green-500/20 text-green-500" : "bg-primary/10 hover:bg-primary/20 text-primary"} transition-colors`}
                      aria-label="Copy to clipboard"
                    >
                      {copyStatus[os] ? (
                        <Check className="h-4 w-4" />
                      ) : (
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
                          <rect
                            width="14"
                            height="14"
                            x="8"
                            y="8"
                            rx="2"
                            ry="2"
                          />
                          <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                        </svg>
                      )}
                    </button>
                  </div>
                </TabsContent>
              ))}
            </Tabs>

            <p className="text-sm text-muted-foreground mb-6">
              This will download the collector scripts, extract them, and run
              the main script to gather system information. The resulting
              snapshot file can then be uploaded to Red Snapper for analysis.
            </p>
            <div className="flex justify-end">
              <Button
                onClick={() => (window as any).createSnapshotDialog?.close()}
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
