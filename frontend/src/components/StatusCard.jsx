import { Check, AlertTriangle, FileText } from "lucide-react"

export function StatusCard({ title, count, status = "default", className = "" , statusText }) {
  const getStatusIcon = () => {
    switch (status) {
      case "completed":
        return <Check className="w-5 h-5 text-green-600" />
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />
      default:
        return null
    }
  }

  const getCardBackground = () => {
    switch (status) {
      case "completed":
      case "warning":
        return "bg-blue-50 border-blue-200"
      default:
        return "bg-gray-50 border-gray-200"
    }
  }

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
        <div>
          {statusText}
        </div>
      </div>
    </div>
  )
}
