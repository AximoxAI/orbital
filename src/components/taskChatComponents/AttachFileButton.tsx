import { useState } from "react"
import { Paperclip, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import FileUploadDialog from "./FileUploadDialog"
import { uploadFileToS3 } from "@/utils/s3Client"

interface UploadedFile {
  name: string
  size: number
  type: string
  uploadedAt: string
  id: string
  url: string
}

interface AttachFileButtonProps {
  onFilesSelect: (files: UploadedFile[]) => void
  attachedS3Files: UploadedFile[]
  variant?: "outline" | "ghost" | "default"
  size?: "sm" | "icon" | "default"
  className?: string
}

const AttachFileButton = ({
  onFilesSelect,
  attachedS3Files,
  variant = "ghost",
  size = "sm",
  className = "",
}: AttachFileButtonProps) => {
  const [showFileUploadDialog, setShowFileUploadDialog] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  const handleFilesSelect = async (files: File[]) => {
    setIsUploading(true)
    setShowFileUploadDialog(false)

    try {
      const uploadedFiles: UploadedFile[] = []
      
      for (const file of files) {
        const { key, url } = await uploadFileToS3(file, "task-attachments")
        
        const uploadedFile: UploadedFile = {
          name: file.name,
          size: file.size,
          type: file.type,
          uploadedAt: new Date().toISOString(),
          id: key,
          url: url,
        }
        
        uploadedFiles.push(uploadedFile)
      }
      
      onFilesSelect([...attachedS3Files, ...uploadedFiles])
    } catch (error) {
      console.error('Error uploading files to S3:', error)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={() => setShowFileUploadDialog(true)}
        className={`flex items-center border-[1px] gap-1 transition-all duration-150 ${className}`}
        aria-label="Attach Files"
        disabled={isUploading}
      >
        {isUploading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Paperclip className="h-4 w-4" />
        )}
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