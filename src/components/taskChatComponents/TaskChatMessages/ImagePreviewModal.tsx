"use client"

import type React from "react"
import { useState } from "react"
import { X, Download, Copy } from "lucide-react"

interface ImagePreviewModalProps {
  isOpen: boolean
  onClose: () => void
  imageUrl?: string
  imageName: string
}

const ImagePreviewModal: React.FC<ImagePreviewModalProps> = ({ isOpen, onClose, imageUrl, imageName }) => {
  const [copied, setCopied] = useState(false)

  if (!isOpen || !imageUrl) return null

  const handleDownload = () => {
    const link = document.createElement("a")
    link.href = imageUrl
    link.download = imageName || "image"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleCopyImageUrl = () => {
    navigator.clipboard.writeText(imageUrl).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="relative bg-slate-900 rounded-2xl shadow-2xl max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-slate-200 rounded-lg transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5 text-slate-800" />
        </button>

        {/* Image container */}
        <div className="flex-1 flex items-center justify-center overflow-auto bg-black/30">
          <img src={imageUrl || "/placeholder.svg"} alt={imageName} className="max-w-full max-h-full object-contain" />
        </div>

        {/* Footer with filename and actions */}
        <div className="border-t border-slate-700 bg-slate-200 p-4 flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-800 truncate">{imageName}</p>
          </div>

          <div className="flex items-center gap-2 ml-4">
            {/* Copy URL button */}
            <button
              onClick={handleCopyImageUrl}
              className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
              title="Copy image URL"
            >
              <Copy className="w-4 h-4 text-slate-800 " />
            </button>

            {/* Download button */}
            <button
              onClick={handleDownload}
              className="p-2  rounded-lg transition-colors"
              title="Download image"
            >
              <Download className="w-4 h-4 text-slate-800 " />
            </button>

            {/* Copied feedback */}
            {copied && <span className="text-xs text-emerald-400 ml-2">Copied!</span>}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ImagePreviewModal
