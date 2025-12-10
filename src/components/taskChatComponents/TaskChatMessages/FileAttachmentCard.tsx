"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { FileText, ImageIcon, FileCode, FileSpreadsheet, FileArchive, BeerIcon as GenericFile } from "lucide-react"
import ImagePreviewModal from "./ImagePreviewModal"
import { UploadsApi, Configuration } from "@/api-client"

const BACKEND_URL = import.meta.env.VITE_BACKEND_API_KEY

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

function isImageFile(type?: string, name?: string): boolean {
  const lowerType = (type || "").toLowerCase()
  const lowerName = (name || "").toLowerCase()
  return lowerType.includes("image") || /\.(png|jpg|jpeg|gif|webp|bmp|svg)$/.test(lowerName)
}

function pickIcon(type?: string, name?: string) {
  const lowerType = (type || "").toLowerCase()
  const lowerName = (name || "").toLowerCase()

  if (lowerType.includes("pdf") || lowerName.endsWith(".pdf")) return FileText
  if (isImageFile(type, name)) return ImageIcon
  if (lowerType.includes("json") || lowerName.endsWith(".json")) return FileCode
  if (lowerType.includes("spreadsheet") || /\.(csv|xlsx|xls)$/.test(lowerName)) return FileSpreadsheet
  if (lowerType.includes("zip") || lowerType.includes("archive") || /\.(zip|tar|gz|rar|7z)$/.test(lowerName))
    return FileArchive
  if (/\.(ts|tsx|js|jsx|py|rb|go|rs|php|java|c|cpp|cs|swift|kt|m|sh|sql|yml|yaml|toml|ini|md)$/.test(lowerName))
    return FileCode

  return GenericFile
}

const CARD_DIMENSIONS = "w-full max-w-[180px] h-36" // keep dimensions fixed for all

const FileAttachmentCard: React.FC<FileAttachmentCardProps> = ({ file, onClick, className = "" }) => {
  const Icon = pickIcon(file.type, file.name)
  const size = formatSize(file.size)
  const [showImageModal, setShowImageModal] = useState(false)
  const [imageUrl, setImageUrl] = useState<string | undefined>(file.url)
  const [isLoadingUrl, setIsLoadingUrl] = useState(false)
  const [urlError, setUrlError] = useState(false)

  const isImage = isImageFile(file.type, file.name)
  const hasImagePreview = isImage && imageUrl && !urlError

  // Fetch the file URL if we have an ID but no URL
  useEffect(() => {
    async function fetchFileUrl() {
      if (!file.id || imageUrl || !isImage) return

      setIsLoadingUrl(true)
      setUrlError(false)

      try {
        const configuration = new Configuration({
          basePath: BACKEND_URL,
        })
        const uploadsApi = new UploadsApi(configuration)
        const res = await uploadsApi.uploadControllerGetFile(file.id)
        
        if (res.data.view_url) {
          setImageUrl(res.data.view_url)
        } else {
          setUrlError(true)
        }
      } catch (error) {
        setUrlError(true)
      } finally {
        setIsLoadingUrl(false)
      }
    }

    fetchFileUrl()
  }, [file.id, imageUrl, isImage])

  const handleCardClick = () => {
    if (hasImagePreview) {
      setShowImageModal(true)
    } else {
      onClick?.(file)
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={handleCardClick}
        disabled={isLoadingUrl}
        className={`group ${CARD_DIMENSIONS} rounded-xl border border-slate-200 bg-white shadow-sm hover:shadow-md hover:border-slate-300 transition-all focus:outline-none focus:ring-2 focus:ring-blue-300 overflow-hidden disabled:opacity-60 disabled:cursor-not-allowed text-left p-0 ${className}`}
        aria-label={file.name}
        style={{ padding: 0 }}
      >
        {/* Image File: show image full card */}
        {hasImagePreview ? (
          <div className="relative w-full h-full bg-slate-100 overflow-hidden">
            <img
              src={imageUrl}
              alt={file.name}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
              onError={(e) => {
                e.currentTarget.style.display = "none"
                setUrlError(true)
              }}
            />
          </div>
        ) : (
          // Non-image files OR image files with no preview/loading/error: show details
          <div className="flex flex-col h-full justify-center items-center">
            {/* Show loading skeleton for images loading preview */}
            {isImage && isLoadingUrl && (
              <div className="relative w-full h-24 bg-slate-100 overflow-hidden border-b border-slate-200 flex items-center justify-center">
                <div className="animate-pulse text-slate-400 text-xs">Loading preview...</div>
              </div>
            )}

            {/* Icon + info centered vertically */}
            <div className="flex flex-col items-center justify-center gap-2 flex-1 p-2.5 w-full">
              <div className="flex mt-5 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 h-10 w-10">
                <Icon className="w-5 h-5 text-slate-600" />
              </div>
              <div className="flex-1 min-w-0 w-full flex flex-col items-center justify-center">
                <div className="text-sm font-semibold text-slate-800 truncate w-full text-center">{file.name}</div>
                <div className="mt-0.5 text-xs text-slate-500 flex items-center gap-2 justify-center w-full">
                  {file.type && <span className="truncate">{file.type}</span>}
                  {file.type && size && <span className="text-slate-300">•</span>}
                  {size && <span>{size}</span>}
                </div>
                {urlError && isImage && (
                  <div className="mt-1 text-xs text-red-500 text-center w-full">Preview unavailable</div>
                )}
              </div>
            </div>
            <div className="px-2.5 pb-2.5" />
          </div>
        )}
      </button>
      {/* Image modal */}
      {hasImagePreview && (
        <ImagePreviewModal
          isOpen={showImageModal}
          onClose={() => setShowImageModal(false)}
          imageUrl={imageUrl!}
          imageName={file.name}
        />
      )}
    </>
  )
}

export default FileAttachmentCard