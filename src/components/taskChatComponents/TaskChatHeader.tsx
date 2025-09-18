import { X, Maximize2, Minimize2, Video, UserPlus, UserMinus } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import React, { useState } from "react"
import VideoCallModal from "./VideoCallModal"

const TaskChatHeader = ({
  taskName,
  isFullPage,
  onClose,
  onMaximize,
  onMinimize,
  users,
  onAddUser,
  onRemoveUser,
  availableUsers,
}) => {
  const [showVideoModal, setShowVideoModal] = useState(false)

  // Users available to add
  const usersToAdd = availableUsers.filter(
    (u) => !users.some(chatUser => chatUser.id === u.id)
  )

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
          <div className="scrollbar-hide flex gap-8 overflow-x-auto pb-2 items-center min-h-[80px]">
            {users.map((user) => (
              <div
                key={user.id}
                className="group min-w-[90px] flex flex-col items-center justify-center relative"
              >
                <div className="relative mb-3">
                  <img
                    src={user.avatar || "/placeholder.svg"}
                    alt={user.name}
                    className="h-10 w-10 rounded-full border-3 border-white object-cover shadow-lg transition-all duration-200 group-hover:shadow-xl"
                  />
                  {/* Remove button always visible */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute -top-2 -left-2 h-6 w-6 p-0 bg-white hover:bg-red-100 text-red-500 shadow-md"
                    onClick={() => onRemoveUser(user.id)}
                    aria-label="Remove User"
                    tabIndex={-1}
                  >
                    <UserMinus className="h-4 w-4" />
                  </Button>
                </div>
                <span className="max-w-[90px] truncate text-center text-sm font-medium text-gray-700 group-hover:text-gray-900">
                  {user.name}
                </span>
              </div>
            ))}
            {/* "+" icon with shadcn Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className={`
                    h-10 w-10 flex items-center justify-center border-2 border-dashed border-gray-300 hover:bg-gray-100 ml-2
                    focus:outline-none rounded-md
                  `}
                  aria-label="Add user"
                >
                  <UserPlus className="h-4 w-4 text-gray-500" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                {usersToAdd.length === 0 ? (
                  <div className="px-3 py-2 text-sm text-gray-500">No users to add</div>
                ) : (
                  usersToAdd.map(u => (
                    <DropdownMenuItem
                      key={u.id}
                      onSelect={() => onAddUser(u.id)}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <img src={u.avatar || "/placeholder.svg"} alt={u.name} className="h-7 w-7 rounded-full" />
                      <span className="text-sm">{u.name}</span>
                    </DropdownMenuItem>
                  ))
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="flex items-center gap-3">
            {/* Only show Join Call button in full screen mode */}
            {isFullPage && (
              <Button
                variant="default"
                size="sm"
                className="ml-4 flex-shrink-0 bg-slate-600 text-white shadow-sm hover:bg-slate-700"
                onClick={() => setShowVideoModal(true)}
                aria-label="Start Video Call"
              >
                <Video className="mr-2 h-4 w-4" />
                Join Call
              </Button>
            )}
          </div>
        </div>
      </div>
      {/* Video Modal */}
      {showVideoModal && (
        <VideoCallModal
          taskName={taskName}
          onClose={() => setShowVideoModal(false)}
        />
      )}
    </>
  )
}

export default TaskChatHeader