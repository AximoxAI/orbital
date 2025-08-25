"use client"

import { X, Maximize2, Minimize2, Video } from "lucide-react"
import { Button } from "@/components/ui/button"
import type React from "react"
import { useState } from "react"
import VideoCallModal from "./VideoCallModal"

const TaskChatHeader = ({ taskName, isFullPage, onClose, onMaximize, onMinimize, users }) => {
  const [showVideoModal, setShowVideoModal] = useState(false)

  const handleVideoClick = () => {
    setShowVideoModal(true)
  }

  const handleCloseVideoModal = () => {
    setShowVideoModal(false)
  }

  return (
    <>
      {/* Header */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-gray-200 bg-gradient-to-r from-white to-gray-50 px-4 py-4">
        <div className="min-w-0 flex-1">
          <h3 className="mb-1 truncate text-base font-bold text-gray-900 sm:text-lg">Task Discussion</h3>
          <p className="truncate text-xs font-medium text-gray-600 sm:text-sm">{taskName}</p>
        </div>
        <div className="flex flex-shrink-0 items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={isFullPage ? onMinimize : onMaximize}
            className="transition-colors duration-200 hover:bg-gray-100"
            aria-label={isFullPage ? "Minimize" : "Maximize"}
          >
            {isFullPage ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
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

      {/* Users section */}
      <div className="w-full max-w-[1500px] border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white px-8 py-2">
        <div className="flex items-center justify-between">
          {/* Avatars row */}
          <div className="scrollbar-hide flex gap-8 overflow-x-auto pb-2">
            {users.map((user) => (
              <div
                key={user.id}
                className="group min-w-[90px] cursor-pointer transition-all duration-200 hover:scale-105 flex flex-col items-center justify-center"
              >
                <div className="relative mb-3">
                  <img
                    src={user.avatar || "/placeholder.svg"}
                    alt={user.name}
                    className="h-10 w-10 rounded-full border-3 border-white object-cover shadow-lg transition-all duration-200 group-hover:shadow-xl"
                  />
                  {user.isOnline && (
                    <div className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-3 border-white bg-green-500 shadow-sm"></div>
                  )}
                </div>
                <span className="max-w-[90px] truncate text-center text-sm font-medium text-gray-700 transition-colors duration-200 group-hover:text-gray-900">
                  {user.name}
                </span>
              </div>
            ))}
          </div>
          {/* Only show Join Call button in full screen mode */}
          {isFullPage && (
            <Button
              variant="default"
              size="sm"
              className="ml-4 flex-shrink-0 bg-slate-600 text-white shadow-sm hover:bg-slate-700"
              onClick={handleVideoClick}
              aria-label="Start Video Call"
            >
              <Video className="mr-2 h-4 w-4" />
              Join Call
            </Button>
          )}
        </div>
      </div>

      {/* Video Modal */}
      {showVideoModal && (
        <VideoCallModal
          taskName={taskName}
          onClose={handleCloseVideoModal}
        />
      )}
    </>
  )
}

export default TaskChatHeader