"use client"

import { X, Maximize2, Minimize2, Video, UserPlus, UserMinus, Tag, Plus, Check, GitBranch } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { useState } from "react"
import VideoCallModal from "./VideoCallModal"

const AVAILABLE_TAGS = ["Bug", "Feature", "Urgent", "Blocked", "Frontend", "Backend", "Design", "Research"]

interface User {
  id: string
  name: string
  avatar: string
  isOnline: boolean
  email?: string
}

interface TaskChatHeaderProps {
  taskName: string
  isFullPage: boolean
  onClose: () => void
  onMaximize: () => void
  onMinimize: () => void
  users: User[]
  onAddUser: (userId: string) => void
  onRemoveUser: (userId: string) => void
  availableUsers: User[]
  onOpenRepoGraph: () => void
  onCallStart?: () => void
  onCallEnd?: () => void
}

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
  onOpenRepoGraph,
  onCallStart,
  onCallEnd,
}: TaskChatHeaderProps) => {
  const [showVideoModal, setShowVideoModal] = useState(false)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [showTagsPopover, setShowTagsPopover] = useState(false)

  // Users available to add
  const usersToAdd = availableUsers.filter((u) => !users.some((chatUser) => chatUser.id === u.id))

  // Tags available to pick
  const tagsToPick = AVAILABLE_TAGS.filter((tag) => !selectedTags.includes(tag))

  const handleTagSelect = (tag: string) => {
    setSelectedTags((prev) => [...prev, tag])
  }

  const handleTagRemove = (tag: string) => {
    setSelectedTags((prev) => prev.filter((t) => t !== tag))
  }

  const handleCloseVideoModal = () => {
    setShowVideoModal(false)
  }

  return (
    <>
      {/* Header */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-gray-200 bg-gradient-to-r from-white to-gray-50 px-4 py-4">
        <div className="min-w-0 flex-1">
          <h3 className="mb-1 truncate text-base font-bold text-gray-900 sm:text-lg flex items-center gap-2">
            Task Discussion
            {/* Render selected tags after Task Discussion */}
            {selectedTags.length > 0 && (
              <span className="flex flex-wrap gap-2 ml-2">
                {selectedTags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 border border-slate-200 hover:bg-slate-200 transition-colors"
                  >
                    {tag}
                    <button
                      className="ml-2 text-xs text-slate-500 hover:text-slate-700 hover:bg-slate-300 rounded-full p-0.5 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleTagRemove(tag)
                      }}
                      tabIndex={-1}
                      aria-label={`Remove ${tag} tag`}
                      type="button"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </span>
            )}
          </h3>
          <p className="truncate text-xs font-medium text-gray-600 sm:text-sm">{taskName}</p>
        </div>
        <div className="flex items-center gap-2">
          {isFullPage && (
            <Button
              variant="secondary"
              size="sm"
              className="flex-shrink-0"
              onClick={onOpenRepoGraph}
              aria-label="Open Repo Graph"
            >
              <GitBranch className="mr-2 h-4 w-4" />
              Repo Graph
            </Button>
          )}
          <Popover open={showTagsPopover} onOpenChange={setShowTagsPopover}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="transition-colors duration-200 hover:bg-gray-100"
                aria-label="Add tags"
              >
                <Tag className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80 p-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-slate-900">Select Tags</h4>
                  <span className="text-xs text-slate-500">{selectedTags.length} selected</span>
                </div>

                {tagsToPick.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="rounded-full bg-slate-100 p-3 mb-3">
                      <Check className="h-6 w-6 text-slate-600" />
                    </div>
                    <p className="text-sm text-slate-600 font-medium">All tags selected</p>
                    <p className="text-xs text-slate-500 mt-1">Remove tags to add different ones</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    {tagsToPick.map((tag) => (
                      <button
                        key={tag}
                        className="group relative flex items-center justify-center rounded border-2 border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-slate-100 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
                        style={{ minWidth: 64, minHeight: 26, padding: 0, width: 90, height: 20, maxWidth: 200 }}
                        onClick={() => handleTagSelect(tag)}
                      >
                        <span className="text-xs font-medium text-slate-700 group-hover:text-slate-900">{tag}</span>
                        <div className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="rounded-full bg-slate-600 p-0.5">
                            <Plus className="h-2 w-2 text-white" />
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {selectedTags.length > 0 && (
                  <div className="pt-3 border-t border-slate-200">
                    <p className="text-xs text-slate-600 mb-2">Selected tags:</p>
                    <div className="flex flex-wrap gap-1">
                      {selectedTags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center rounded-md bg-slate-600 px-2 py-1 text-xs font-medium text-white"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </PopoverContent>
          </Popover>
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
              <div key={user.id} className="group min-w-[90px] flex flex-col items-center justify-center relative">
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
                  className={`h-8 w-8 flex items-center justify-center border-2 border-dashed border-gray-300 hover:bg-gray-100 ml-2 focus:outline-none rounded-md`}
                  style={{ fontSize: 14, minWidth: 32, minHeight: 32 }}
                  aria-label="Add user"
                >
                  <UserPlus className="h-4 w-4 text-gray-500" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                {usersToAdd.length === 0 ? (
                  <div className="px-3 py-2 text-sm text-gray-500">No users to add</div>
                ) : (
                  usersToAdd.map((u) => (
                    <DropdownMenuItem
                      key={u.id}
                      onSelect={() => onAddUser(u.id)}
                      className="flex items-center gap-2 cursor-pointer py-1 px-2"
                      style={{ minHeight: 28 }}
                    >
                      <img src={u.avatar || "/placeholder.svg"} alt={u.name} className="h-6 w-6 rounded-full" />
                      <span className="text-xs">{u.name}</span>
                    </DropdownMenuItem>
                  ))
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="flex items-center gap-3">
            {isFullPage && (
              <Button
                variant="default"
                size="sm"
                className="ml-2 flex-shrink-0 bg-slate-600 text-white shadow-sm hover:bg-slate-700"
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
          onClose={handleCloseVideoModal}
          onCallStart={() => {
            onCallStart?.()
          }}
          onCallEnd={() => {
            onCallEnd?.()
            handleCloseVideoModal()
          }}
        />
      )}
    </>
  )
}

export default TaskChatHeader