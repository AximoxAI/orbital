import type React from "react"
import { useRef, useState, useEffect, useCallback } from "react"
import { Send, Bot, User, LayoutTemplate, X } from "lucide-react" 
import { Button } from "@/components/ui/button"
import TaskChatTemplateDialog from "./TaskChatTemplateDialog"
import AttachFileButton, { FileItem } from "./AttachFileButton"
import FileAttachmentCard from "./TaskChatMessages/FileAttachmentCard"

const availableBots = ["@goose", "@orbital_cli", "@gemini_cli", "@claude_code"]

const BOT_STYLES = {
  "@goose": {
    bgColor: "bg-pink-50",
    textColor: "text-pink-800",
    selectedBg: "bg-pink-100",
    selectedText: "text-pink-900",
    iconColor: "text-pink-600",
    borderColor: "border-pink-200",
  },
  "@orbital_cli": {
    bgColor: "bg-purple-50",
    textColor: "text-purple-800",
    selectedBg: "bg-purple-100",
    selectedText: "text-purple-900",
    iconColor: "text-purple-600",
    borderColor: "border-purple-200",
  },
  "@gemini_cli": {
    bgColor: "bg-blue-50",
    textColor: "text-blue-800",
    selectedBg: "bg-blue-100",
    selectedText: "text-blue-900",
    iconColor: "text-blue-600",
    borderColor: "border-blue-200",
  },
  "@claude_code": {
    bgColor: "bg-green-50",
    textColor: "text-green-800",
    selectedBg: "bg-green-100",
    selectedText: "text-green-900",
    iconColor: "text-green-600",
    borderColor: "border-green-200",
  },
} as const

const DEFAULT_BOT_STYLE = {
  bgColor: "bg-slate-50",
  textColor: "text-slate-800",
  selectedBg: "bg-slate-100",
  selectedText: "text-slate-900",
  iconColor: "text-slate-600",
  borderColor: "border-slate-200",
}

const USER_STYLE = {
  bgColor: "bg-amber-50",
  textColor: "text-amber-800",
  selectedBg: "bg-amber-100",
  selectedText: "text-amber-900",
  iconColor: "text-amber-600",
  borderColor: "border-amber-200",
}

const ENTITY_STYLES = {
  Node: {
    bgColor: "bg-indigo-50",
    textColor: "text-indigo-700",
    borderColor: "border-indigo-200",
  },
  Template: {
    bgColor: "bg-teal-50",
    textColor: "text-teal-700",
    borderColor: "border-teal-200",
  },
  Connection: {
    bgColor: "bg-slate-100",
    textColor: "text-slate-700",
    borderColor: "border-slate-300",
  },
} as const

const getBotStyles = (bot: string) =>
  BOT_STYLES[bot as keyof typeof BOT_STYLES] || DEFAULT_BOT_STYLE

interface UserType {
  id: string
  name: string
  avatar: string
  isOnline: boolean
  email?: string
}
interface PreviewableFileItem extends FileItem {
  previewUrl?: string
}

interface ChatInputProps {
  newMessage: string
  setNewMessage: (message: string) => void
  onSendMessage: () => void
  isFullPage?: boolean
  availableUsers: UserType[]
  files: PreviewableFileItem[]
  setFiles: (files: PreviewableFileItem[]) => void
  mentionToInsert?: string | null
  setMentionToInsert?: (val: string | null) => void
}

function isImageFile(type?: string, name?: string): boolean {
  const lowerType = (type || "").toLowerCase()
  const lowerName = (name || "").toLowerCase()
  return lowerType.includes("image") || /\.(png|jpg|jpeg|gif|webp|bmp|svg)$/.test(lowerName)
}

function getPreviewUrl(fileItem: PreviewableFileItem): string | undefined {
  const type = fileItem.file.type
  if (type && isImageFile(type, fileItem.file.name)) {
    if (fileItem.previewUrl) return fileItem.previewUrl
    const url = URL.createObjectURL(fileItem.file)
    fileItem.previewUrl = url
    return url
  }
  return undefined
}

const ChatInput = ({
  newMessage,
  setNewMessage,
  onSendMessage,
  isFullPage = false,
  availableUsers,
  files,
  setFiles,
  mentionToInsert,
  setMentionToInsert,
}: ChatInputProps) => {
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([])
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(0)
  const [showTemplateDialog, setShowTemplateDialog] = useState(false)

  // Use a ref for the div that acts as the input
  const inputRef = useRef<HTMLDivElement>(null)
  
  // Track where the mention started to know what text to replace
  const mentionRangeRef = useRef<Range | null>(null)

  const userSuggestions = availableUsers.map(
    (u) => "@" + (u.name || u.email || u.id),
  )

  useEffect(() => {
    return () => {
      files.forEach((fileItem) => {
        if (fileItem.previewUrl) {
          URL.revokeObjectURL(fileItem.previewUrl)
        }
      })
    }
    // eslint-disable-next-line
  }, [])

  // Sync: If parent clears newMessage, we must clear the div
  useEffect(() => {
    if (newMessage === "" && inputRef.current && inputRef.current.innerText.trim() !== "") {
      inputRef.current.innerHTML = ""
    }
  }, [newMessage])

  const handleRemoveFile = (indexToRemove: number) => {
    setFiles(files.filter((_, index) => index !== indexToRemove))
  }

  // Helper: Create the "Tag" pill
  const createTagElement = (text: string, type: "bot" | "user" | "entity") => {
    const span = document.createElement("span")
    span.contentEditable = "false" // CRITICAL: This makes it un-editable!
    span.innerText = text

    let styles = DEFAULT_BOT_STYLE
    if (type === "bot") styles = getBotStyles(text)
    else if (type === "user") styles = USER_STYLE
    else if (type === "entity") {
      if (text.startsWith("Node:")) styles = ENTITY_STYLES.Node
      else if (text.startsWith("Template:")) styles = ENTITY_STYLES.Template
      else if (text.startsWith("Connection:")) styles = ENTITY_STYLES.Connection
    }

    // Mimic the tag visual style from MessageContent
    span.className = `inline-flex items-center px-2 py-0.5 rounded-md text-sm font-semibold shadow-sm mx-1 align-middle select-none ${styles.bgColor} ${styles.textColor} border ${styles.borderColor}`
    return span
  }

  const insertTag = useCallback(
    (text: string, type: "bot" | "user" | "entity") => {
      if (!inputRef.current) return

      const span = createTagElement(text, type)
      const space = document.createTextNode("\u00A0") // Non-breaking space

      // Logic: Linear insertion (Insert Tag -> Move Caret -> Insert Space -> Move Caret)
      // This ensures the cursor is strictly AFTER the inserted elements.
      
      const applyLinearInsertion = (range: Range) => {
          range.insertNode(span)
          range.setStartAfter(span)
          range.setEndAfter(span)
          
          range.insertNode(space)
          range.setStartAfter(space)
          range.setEndAfter(space)

          range.collapse(true)
          
          const sel = window.getSelection()
          if (sel) {
              sel.removeAllRanges()
              sel.addRange(range)
          }
      }

      // 1. If we are completing a typed mention (e.g. "@goo"), replace that specific range
      if (mentionRangeRef.current) {
        const range = mentionRangeRef.current
        range.deleteContents()
        applyLinearInsertion(range)
        mentionRangeRef.current = null
      } 
      // 2. Otherwise insert at current caret position (e.g. from template dialog)
      else {
        const sel = window.getSelection()
        if (sel && sel.rangeCount > 0 && inputRef.current.contains(sel.anchorNode)) {
          const range = sel.getRangeAt(0)
          applyLinearInsertion(range)
        } else {
          // 3. Fallback: If lost focus, append to end
          inputRef.current.appendChild(span)
          inputRef.current.appendChild(space)
          
          // Move caret to very end
          const range = document.createRange()
          range.selectNodeContents(inputRef.current)
          range.collapse(false) // collapse to end
          
          const newSel = window.getSelection()
          newSel?.removeAllRanges()
          newSel?.addRange(range)
        }
      }

      setNewMessage(inputRef.current.innerText)
      setShowSuggestions(false)
    },
    [setNewMessage],
  )

  // Handle external insertions (like clicking a Node in the graph)
  useEffect(() => {
    if (mentionToInsert) {
      let type: "bot" | "user" | "entity" = "entity"
      if (mentionToInsert.startsWith("@")) type = "bot"
      insertTag(mentionToInsert, type)
      if (setMentionToInsert) setMentionToInsert(null)
      
      // Refocus input
      setTimeout(() => {
        if (inputRef.current) {
            inputRef.current.focus()
        }
      }, 0)
    }
  }, [mentionToInsert, insertTag, setMentionToInsert])

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    const target = e.currentTarget
    const text = target.innerText
    setNewMessage(text)

    // Mention detection logic adapted for contentEditable
    const sel = window.getSelection()
    if (sel && sel.rangeCount > 0) {
      const range = sel.getRangeAt(0)
      const node = range.startContainer
      
      // We only care if typing in a text node
      if (node.nodeType === Node.TEXT_NODE && node.textContent) {
        const textBeforeCaret = node.textContent.substring(0, range.startOffset)
        const match = textBeforeCaret.match(/@([\w\.\-_]*)$/)

        if (match) {
          const query = match[1]
          const triggerIndex = match.index!
          
          // Save range for replacement
          const triggerRange = document.createRange()
          triggerRange.setStart(node, triggerIndex)
          triggerRange.setEnd(node, range.startOffset)
          mentionRangeRef.current = triggerRange

          const filteredBots = availableBots.filter((bot) =>
            bot.toLowerCase().includes(("@" + query).toLowerCase()),
          )
          const filteredUsers = userSuggestions.filter((user) =>
            user.toLowerCase().includes(("@" + query).toLowerCase()),
          )
          const allFiltered = [...filteredBots, ...filteredUsers]

          if (allFiltered.length > 0) {
            setFilteredSuggestions(allFiltered)
            setShowSuggestions(true)
            setSelectedSuggestionIndex(0)
            return
          }
        }
      }
    }
    setShowSuggestions(false)
    mentionRangeRef.current = null
  }

  const selectSuggestion = (suggestion: string) => {
    const type = availableBots.includes(suggestion) ? "bot" : "user"
    insertTag(suggestion, type)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (showSuggestions) {
      if (e.key === "ArrowDown") {
        e.preventDefault()
        setSelectedSuggestionIndex((prev) =>
          prev < filteredSuggestions.length - 1 ? prev + 1 : 0,
        )
      } else if (e.key === "ArrowUp") {
        e.preventDefault()
        setSelectedSuggestionIndex((prev) =>
          prev > 0 ? prev - 1 : filteredSuggestions.length - 1,
        )
      } else if (e.key === "Tab" || e.key === "Enter") {
        if (!e.shiftKey) {
          e.preventDefault()
          selectSuggestion(filteredSuggestions[selectedSuggestionIndex])
          return
        }
      } else if (e.key === "Escape") {
        setShowSuggestions(false)
      }
    }

    if (e.key === "Enter" && !showSuggestions) {
      if (e.ctrlKey || e.metaKey || (!e.shiftKey && !e.altKey && !e.ctrlKey && !e.metaKey)) {
        if (!e.ctrlKey && !e.metaKey && (e.shiftKey || e.altKey)) {
          return // Allow new line
        }
        e.preventDefault()
        onSendMessage()
      }
    }
  }

  const suggestionsLeftClass = isFullPage
    ? "left-1/2 transform -translate-x-1/2 w-[80%] max-w-6xl"
    : "left-6 right-6"

  const getSuggestionStyles = (suggestion: string, index: number) => {
    const isBot = availableBots.includes(suggestion)
    const styles = isBot ? getBotStyles(suggestion) : USER_STYLE
    const icon = isBot ? Bot : User
    return { styles, icon }
  }

  return (
    <>
      <TaskChatTemplateDialog
        open={showTemplateDialog}
        onOpenChange={setShowTemplateDialog}
        onSelect={(templateId: string, templateName: string) => {
          setShowTemplateDialog(false)
          if (setMentionToInsert) {
            setMentionToInsert(`Template:${templateName}`)
          }
        }}
      />
      <div
        className={`fixed bottom-0 left-0 right-0 ${
          isFullPage ? "flex justify-center" : ""
        } border-t border-gray-200 bg-white relative z-20`}
      >
        {showSuggestions && (
          <div
            className={`absolute bottom-full mb-2 bg-white border border-gray-200 rounded-xl shadow-xl z-10 overflow-hidden ${suggestionsLeftClass}`}
          >
            {filteredSuggestions.map((suggestion, index) => {
              const { styles, icon: IconComponent } = getSuggestionStyles(suggestion, index)
              return (
                <div
                  key={suggestion}
                  className={`px-4 py-3 cursor-pointer text-sm font-semibold flex items-center space-x-3 transition-all duration-150 ${
                    index === selectedSuggestionIndex
                      ? `${styles.selectedBg} ${styles.selectedText} border-l-4 ${styles.borderColor}`
                      : `hover:${styles.bgColor} ${styles.textColor}`
                  }`}
                  onClick={() => selectSuggestion(suggestion)}
                >
                  <IconComponent className={`w-4 h-4 ${styles.iconColor}`} />
                  <span>{suggestion}</span>
                </div>
              )
            })}
          </div>
        )}

        <div className={`${isFullPage ? "w-[60%]" : "w-full"} p-4`}>
          {files && files.length > 0 && (
            <div className="flex flex-wrap gap-3 mb-3">
              {files.map((fileItem, index) => (
                <div key={fileItem.id || fileItem.file.name || index} className="relative group">
                  <FileAttachmentCard
                    file={{
                      id: fileItem.id,
                      name: fileItem.file.name,
                      type: fileItem.file.type,
                      size: fileItem.file.size,
                      url: getPreviewUrl(fileItem),
                    }}
                    onClick={() => {}}
                  />
                  <button
                    onClick={() => handleRemoveFile(index)}
                    className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-md border  transition-colors z-10"
                    title="Remove file"
                  >
                    <X className="w-3 h-3 text-gray-500 " />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center gap-3 border border-gray-200 rounded-2xl p-3 shadow-sm focus-within:border-blue-500 focus-within:shadow-md transition-all duration-200 bg-white">
            {isFullPage && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowTemplateDialog(true)}
                className="flex items-center gap-1"
                aria-label="Open Templates"
              >
                <LayoutTemplate className="h-4 w-4" />
              </Button>
            )}

            {/* Replaced textarea with a Styled Div that looks identical */}
            <div className="flex-1 relative min-h-[60px] max-h-[200px] overflow-y-auto">
                {!newMessage && (
                    <div className="absolute top-0 left-0 text-gray-500 text-sm pointer-events-none p-1">
                        Ask about the task or discuss implementation...   (Ctrl+Enter or Enter to send)
                    </div>
                )}
                <div
                    ref={inputRef}
                    contentEditable
                    onInput={handleInput}
                    onKeyDown={handleKeyDown}
                    // This class string is copied EXACTLY from your original textarea to match the Look & Feel
                    className="w-full h-full outline-none text-sm text-gray-900 bg-transparent whitespace-pre-wrap font-sans p-1"
                    style={{ lineHeight: "1.5" }}
                />
            </div>

            <div className="flex items-center gap-2">
              <AttachFileButton onFilesSelect={setFiles} files={files} variant="ghost" size="sm" />
              <button
                onClick={onSendMessage}
                disabled={!newMessage.trim() && files.length === 0}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white p-2 rounded-lg transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 disabled:hover:translate-y-0 disabled:hover:shadow-none flex-shrink-0"
                title="Send message (Ctrl+Enter or Enter)"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default ChatInput