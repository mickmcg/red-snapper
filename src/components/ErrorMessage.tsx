import React from "react";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";

interface ErrorMessageProps {
  title?: string;
  message?: string;
  variant?: "default" | "destructive";
  onClose?: () => void;
}

const ErrorMessage = ({
  title = "Error",
  message = "An unexpected error occurred. Please try again.",
  variant = "destructive",
  onClose,
}: ErrorMessageProps) => {
  return (
    <div className="w-full max-w-md mx-auto bg-background">
      <Alert variant={variant} className="border-2 break-words">
        <AlertCircle className="h-5 w-5" />
        <AlertTitle className="ml-2">{title}</AlertTitle>
        <AlertDescription className="ml-2 mt-2">{message}</AlertDescription>
        {onClose && (
          <button
            onClick={onClose}
            className="ml-auto text-sm text-muted-foreground hover:text-foreground"
            aria-label="Close error message"
          >
            Dismiss
          </button>
        )}
      </Alert>
    </div>
  );
};

export default ErrorMessage;
