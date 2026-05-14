import { Loader2 } from "lucide-react";

interface LoadingStateProps {
  message?: string;
}

export const LoadingState = ({ message = "Loading..." }: LoadingStateProps) => (
  <div className="flex flex-col items-center justify-center h-full bg-white rounded-lg border">
    <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
    <p className="text-sm text-slate-600">{message}</p>
  </div>
);
