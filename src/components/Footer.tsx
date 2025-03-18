import { Heart, Github } from "lucide-react";

export function Footer() {
  return (
    <footer className="fixed bottom-0 left-0 right-0 py-2 px-4 bg-background border-t flex items-center justify-between text-xs text-muted-foreground">
      <div className="flex items-center gap-1">
        Made with <Heart className="h-3 w-3 text-red-500 fill-red-500" /> by
        <a
          href="https://www.dbmarlin.com"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-primary transition-colors"
        >
          dbmarlin.com
        </a>
      </div>
      <div className="flex items-center gap-1">
        <Github className="h-3 w-3" />
        <a
          href="https://github.com/mickmcg/red-snapper"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-primary transition-colors"
        >
          v0.1.0
        </a>
      </div>
    </footer>
  );
}
