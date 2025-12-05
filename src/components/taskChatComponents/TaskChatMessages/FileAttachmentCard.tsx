import React from "react"
import { FileText, Image as ImageIcon, FileCode, FileSpreadsheet, FileArchive, File as GenericFile } from "lucide-react"

export interface Attachment {
  id?: string
  name: string
  size?: number
  type?: string
  url?: string
}

interface FileAttachmentCardProps {
  file: Attachment
  onClick?: (file: Attachment) => void
  className?: string
}

function formatSize(bytes?: number) {
  if (!bytes || bytes < 0) return ""
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function pickIcon(type?: string, name?: string) {
  const lowerType = (type || "").toLowerCase()
  const lowerName = (name || "").toLowerCase()

  if (lowerType.includes("pdf") || lowerName.endsWith(".pdf")) return FileText
  if (lowerType.includes("image") || /\.(png|jpg|jpeg|gif|webp|bmp)$/.test(lowerName)) return ImageIcon
  if (lowerType.includes("json") || lowerName.endsWith(".json")) return FileCode
  if (lowerType.includes("spreadsheet") || /\.(csv|xlsx|xls)$/.test(lowerName)) return FileSpreadsheet
  if (lowerType.includes("zip") || lowerType.includes("archive") || /\.(zip|tar|gz|rar|7z)$/.test(lowerName)) return FileArchive
  if (/\.(ts|tsx|js|jsx|py|rb|go|rs|php|java|c|cpp|cs|swift|kt|m|sh|sql|yml|yaml|toml|ini|md)$/.test(lowerName)) return FileCode

  return GenericFile
}

/**
 * Compact Claude-style file card:
 * - Reduced width more while keeping the same height
 * - Slate color for the preview hint
 */
const FileAttachmentCard: React.FC<FileAttachmentCardProps> = ({ file, onClick, className = "" }) => {
  const Icon = pickIcon(file.type, file.name)
  const size = formatSize(file.size)

  return (
    <button
      type="button"
      onClick={() => onClick?.(file)}
      className={`group w-full max-w-[180px] text-left rounded-xl border border-slate-200 bg-white shadow-sm hover:shadow-md hover:border-slate-300 transition-all focus:outline-none focus:ring-2 focus:ring-blue-300 ${className}`}
    >
      <div className="flex items-start gap-2.5 p-2.5">
        {/* keep height as it is */}
        <div className="flex items-center justify-center rounded-lg border border-slate-200 bg-slate-50 h-10 w-10 flex-shrink-0">
          <Icon className="w-5 h-5 text-slate-600" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-slate-800 truncate">
            {file.name}
          </div>
          <div className="mt-0.5 text-xs text-slate-500 flex items-center gap-2">
            {file.type && <span className="truncate">{file.type}</span>}
            {file.type && size && <span className="text-slate-300">•</span>}
            {size && <span>{size}</span>}
          </div>
        </div>
      </div>

      <div className="px-2.5 pb-2.5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-slate-500">Click to open preview</span>
          {/* slate color for preview hint */}
        </div>
      </div>
    </button>
  )
}

export default FileAttachmentCard