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
      <div className="flex items-center">
        <h1 className="text-2xl font-bold text-white">Red Snapper</h1>
        <ThemeToggle />
      </div>

      <div className="flex items-center gap-4">
        <Button
          onClick={onOpenZipFile}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Upload className="mr-2 h-4 w-4" />
          Open Zip File
        </Button>
      </div>
    </header>
  );
};

export default Header;
