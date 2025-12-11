import { X, Video } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"
interface OrbitalHeaderProps {
  onClose: () => void
  onCallStart?: () => void
  onCallEnd?: () => void
}

const OrbitalHeader = ({
  onClose,
}: OrbitalHeaderProps) => {
  const [showVideoModal, setShowVideoModal] = useState(false)

  const handleCloseVideoModal = () => {
    setShowVideoModal(false)
  }

  return (
    <>
      <div className="flex items-center justify-between border-b border-gray-200 bg-gradient-to-r from-white to-gray-50 px-4 py-4">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-bold text-gray-900">Ask Orbital</h3>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="transition-colors duration-200 hover:bg-gray-100"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </>
  )
}

export default OrbitalHeader