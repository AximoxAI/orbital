import { X, FileText } from "lucide-react"
import type { FileItem } from "./AttachFileButton"

interface AttachedFilesListProps {
  files: FileItem[]
  onRemove: (fileId: string) => void
  removingFileId: string | null
}

const AttachedFilesList = ({ files, onRemove, removingFileId }: AttachedFilesListProps) => {
  if (files.length === 0) return null

  return (
    <div className="mb-2">
      <div className="flex flex-wrap gap-2">
        {files.map((fileItem) => (
          <div
            key={fileItem.id}
            className={`flex items-center gap-2 px-3 py-1. 5 bg-slate-50 border border-slate-200 rounded-lg text-sm transition-all duration-150 ${
              removingFileId === fileItem.id ? "opacity-0 scale-90" : "opacity-100 scale-100"
            }`}
          >
            <FileText className="w-3 h-3 text-slate-500" />
            <span className="text-slate-700 text-xs max-w-[150px] truncate">
              {fileItem.file.name}
            </span>
            <button
              onClick={() => onRemove(fileItem.id)}
              className="text-slate-500 hover:text-slate-700 ml-1 transition-colors duration-150"
              disabled={removingFileId !== null}
              aria-label="Remove file"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default AttachedFilesList