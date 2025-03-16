import { Moon, Sun, Laptop } from "lucide-react";
import { Button } from "./ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { useTheme } from "./ThemeProvider";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="h-10 w-10 text-white">
          {theme === "dark" ? (
            <Moon className="h-5 w-5" />
          ) : theme === "light" ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Laptop className="h-5 w-5" />
          )}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-32 p-0" align="end">
        <div className="grid grid-cols-1 gap-2 p-2">
          <Button
            variant={theme === "light" ? "default" : "ghost"}
            className="justify-start font-normal"
            onClick={() => setTheme("light")}
          >
            <Sun className="mr-2 h-4 w-4" />
            Light
          </Button>
          <Button
            variant={theme === "dark" ? "default" : "ghost"}
            className="justify-start font-normal"
            onClick={() => setTheme("dark")}
          >
            <Moon className="mr-2 h-4 w-4" />
            Dark
          </Button>
          <Button
            variant={theme === "system" ? "default" : "ghost"}
            className="justify-start font-normal"
            onClick={() => setTheme("system")}
          >
            <Laptop className="mr-2 h-4 w-4" />
            System
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
