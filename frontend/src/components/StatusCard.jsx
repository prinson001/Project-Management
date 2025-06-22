import { Check, AlertTriangle, FileText } from "lucide-react";

export function StatusCard({ title, count, status = "default", className = "", statusText }) {
  const getStatusIcon = () => {
    switch (status) {
      case "completed":
        return <Check className="w-5 h-5 text-green-600" />;
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      default:
        return null;
    }
  };

  const getCardBackground = () => {
    switch (status) {
      case "completed":
      case "warning":
        return "bg-blue-50 border-blue-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  const getBadgeStyle = () => {
    switch (status) {
      case "error":
        // return "inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-red-600/10 ring-inset";
        return "inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-gray-500/10 ring-inset"
      case "warning":
        return "inline-flex items-center rounded-md bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-800 ring-1 ring-yellow-600/20 ring-inset";
      case "completed":
        return "inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-green-600/20 ring-inset";
      default:
        return "inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-gray-500/10 ring-inset";
    }
  };

  return (
    <div className={`rounded-lg border p-4 ${getCardBackground()} ${className}`}>
      <div className="flex flex-col justify-between h-full">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <div className="bg-green-100 p-2 rounded">
              <FileText className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900 text-sm leading-tight">{title}</h3>
              <p className="text-2xl font-bold text-gray-900 mt-1">{count}</p>
            </div>
          </div>
          {getStatusIcon()}
        </div>
        <div className="mt-2">
          {statusText && (
            <span className={getBadgeStyle()}>{statusText}</span>
          )}
        </div>
      </div>
    </div>
  );
}