"use client"
import { X, Maximize2, Minimize2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface UserType {
  id: string
  name: string
  avatar: string
  isOnline: boolean
}

interface TaskChatHeaderProps {
  taskName: string
  isFullPage: boolean
  onClose: () => void
  onMaximize: () => void
  onMinimize: () => void
  users: UserType[]
}

const TaskChatHeader = ({ taskName, isFullPage, onClose, onMaximize, onMinimize, users }: TaskChatHeaderProps) => {
  return (
    <>
      {/* Header */}
      <div className="px-4 py-4 border-b border-gray-200 bg-gradient-to-r from-white to-gray-50 flex flex-wrap items-center gap-y-2 gap-x-4">
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-base sm:text-lg text-gray-900 mb-1 truncate">Task Discussion</h3>
          <p className="text-xs sm:text-sm text-gray-600 truncate font-medium">{taskName}</p>
        </div>
        <div className="flex items-center space-x-2 flex-shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={isFullPage ? onMinimize : onMaximize}
            className="hover:bg-gray-100 transition-colors duration-200"
            aria-label={isFullPage ? "Minimize" : "Maximize"}
          >
            {isFullPage ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="hover:bg-gray-100 transition-colors duration-200"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* User Avatars Section */}
      <div className="w-full max-w-6xl px-8 py-2 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
        <div className="flex gap-8 overflow-x-auto pb-2 scrollbar-hide justify-start">
          {users.map((user) => (
            <div
              key={user.id}
              className="flex flex-col items-center justify-center min-w-[90px] cursor-pointer group transition-all duration-200 hover:scale-105"
            >
              <div className="relative mb-3">
                <img
                  src={user.avatar || "/placeholder.svg"}
                  alt={user.name}
                  className="w-10 h-10 rounded-full object-cover border-3 border-white shadow-lg group-hover:shadow-xl transition-all duration-200"
                />
                {user.isOnline && (
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-3 border-white rounded-full shadow-sm"></div>
                )}
              </div>
              <span className="text-sm text-gray-700 text-center max-w-[90px] truncate font-medium group-hover:text-gray-900 transition-colors duration-200">
                {user.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

export default TaskChatHeader
