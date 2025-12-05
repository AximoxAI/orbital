import { useState } from "react"
import { Paperclip } from "lucide-react"
import { Button } from "@/components/ui/button"
import FileUploadDialog from "./FileUploadDialog"

export interface FileItem {
  file: File
  id: string
}

interface AttachFileButtonProps {
  onFilesSelect: (files: FileItem[]) => void
  files: FileItem[]
  variant?: "outline" | "ghost" | "default"
  size?: "sm" | "icon" | "default"
  className?: string
}

const AttachFileButton = ({
  onFilesSelect,
  files,
  variant = "ghost",
  size = "sm",
  className = "",
}: AttachFileButtonProps) => {
  const [showFileUploadDialog, setShowFileUploadDialog] = useState(false)

  const handleFilesSelect = (selectedFiles: File[]) => {
    if (!selectedFiles || selectedFiles.length === 0) return

    const wrappedFiles: FileItem[] = selectedFiles.map((file) => ({
      file,
      id: `temp-${Date.now()}-${Math.random()}`,
    }))

    onFilesSelect([...files, ...wrappedFiles])
    setShowFileUploadDialog(false)
  }

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={() => setShowFileUploadDialog(true)}
        className={`flex items-center border-[1px] gap-1 transition-all duration-150 ${className}`}
        aria-label="Attach Files"
      >
        <Paperclip className="h-4 w-4" />
      </Button>

      <FileUploadDialog
        open={showFileUploadDialog}
        onOpenChange={setShowFileUploadDialog}
        onFilesSelect={handleFilesSelect}
      />
    </>
  )
}

export default AttachFileButton