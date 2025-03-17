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
        <div className="flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#e11d48"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-8 h-8"
          >
            <path
              d="M6.5 12c.94-3.46 4.94-6 8.5-6 0 0 3 0 3 3s-2 3-2 3 1-1 1-3c0-3-7-3-10 6-3-9-10-9-10-6 0 2 1 3 1 3s-2 0-2-3 3-3 3-3c3.56 0 7.56 2.54 8.5 6"
              fill="#e11d48"
              fillOpacity="0.2"
            />
            <circle cx="19" cy="11.5" r="0.5" fill="#000" />
            <path d="M2 9c-1 1-1.5 3-1.5 3s0.5 2 1.5 3" />
            <path d="M10 8c0 0 0.5-1.5 1.5-1.5" />
            <path d="M10 16c0 0 0.5 1.5 1.5 1.5" />
            <path d="M18 12v.5" />
            <path d="M18 13.5v.5" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-white">Red Snapper</h1>
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
