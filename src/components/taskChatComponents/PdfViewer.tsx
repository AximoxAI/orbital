import React from "react"

interface PdfViewerProps {
  url: string
  filename?: string
  isVisible: boolean
  onClose: () => void
}

const PdfViewer: React.FC<PdfViewerProps> = ({ url, filename, isVisible, onClose }) => {
  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-[60] bg-black/40 flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-900 text-slate-50 shadow-md">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            PDF Viewer
          </span>
          {filename && (
            <span className="text-xs text-slate-200 truncate max-w-xs" title={filename}>
              {filename}
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          className="text-xs px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 transition-colors"
        >
          Close
        </button>
      </div>

      {/* PDF frame */}
      <div className="flex-1 bg-slate-900">
        <iframe
          src={url}
          title={filename || "PDF"}
          className="w-full h-full border-none"
          // For some browsers you can also use: `sandbox="allow-same-origin allow-scripts allow-forms"`
        />
      </div>
    </div>
  )
}

export default PdfViewer