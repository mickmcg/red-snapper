import React from "react";
import { Button } from "./ui/button";
import { Upload, Code } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

interface HeaderProps {
  onOpenZipFile?: () => void;
}

const Header = ({ onOpenZipFile = () => {} }: HeaderProps) => {
  return (
    <header className="w-full h-20 bg-[#02203E] dark:bg-[#02203E] border-b border-slate-800 flex items-center justify-between px-6 shadow-md">
      <div className="flex items-center gap-3">
        <div className="flex items-center flex gap-4">
          <img
            src="/fish-icon2.svg"
            alt="Red Snapper logo"
            className="w-6 h-6 dark:hidden"
          />
          <img
            src="/fish-icon2-white.svg"
            alt="Red Snapper logo"
            className="w-6 h-6 hidden dark:block"
          />
          <img
            src="/red-snapper-badge.svg"
            alt="Red Snapper badge"
            className="w-24 h-10"
          />
        </div>
        <ThemeToggle />
      </div>

      <div className="flex items-center gap-4">
        <Button
          onClick={() => (window as any).createSnapshotDialog?.showModal()}
          className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
        >
          <Code className="h-4 w-4" />
          Create a snapshot
        </Button>
      </div>
    </header>
  );
};

export default Header;
