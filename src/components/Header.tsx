import React from "react";
import { Button } from "./ui/button";
import { Upload } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

interface HeaderProps {
  onOpenZipFile?: () => void;
}

const Header = ({ onOpenZipFile = () => {} }: HeaderProps) => {
  return (
    <header className="w-full h-20 bg-slate-900 dark:bg-slate-950 border-b border-slate-800 flex items-center justify-between px-6 shadow-md">
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
            <path d="M6.5 12c.94-3.46 4.94-6 8.5-6 0 0 3 0 3 3s-2 3-2 3 1-1 1-3c0-3-7-3-10 6-3-9-10-9-10-6 0 2 1 3 1 3s-2 0-2-3 3-3 3-3c3.56 0 7.56 2.54 8.5 6" />
            <path d="M18 12v.5" />
            <path d="M18 13.5v.5" />
            <path d="M19 11.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0Z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-white">Red Snapper</h1>
        <ThemeToggle />
      </div>

      <div className="flex items-center gap-4">
        <Button
          onClick={() => window.createSnapshotDialog?.showModal()}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          Create a snapshot
        </Button>
      </div>
    </header>
  );
};

export default Header;
