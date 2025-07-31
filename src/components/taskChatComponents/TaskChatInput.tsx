"use client"

import type React from "react"
import { useRef, useState } from "react"
import { Send, Bot } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

const availableBots = ["@goose", "@orbital_cli", "@gemini_cli", "@claude_code"]

const BOT_STYLES = {
  "@goose": {
    bgColor: "bg-gradient-to-r from-pink-50 to-rose-50",
    textColor: "text-pink-800",
    selectedBg: "bg-gradient-to-r from-pink-100 to-rose-100",
    selectedText: "text-pink-900",
    iconColor: "text-pink-600",
    borderColor: "border-pink-200",
  },
  "@orbital_cli": {
    bgColor: "bg-gradient-to-r from-purple-50 to-violet-50",
    textColor: "text-purple-800",
    selectedBg: "bg-gradient-to-r from-purple-100 to-violet-100",
    selectedText: "text-purple-900",
    iconColor: "text-purple-600",
    borderColor: "border-purple-200",
  },
  "@gemini_cli": {
    bgColor: "bg-gradient-to-r from-blue-50 to-cyan-50",
    textColor: "text-blue-800",
    selectedBg: "bg-gradient-to-r from-blue-100 to-cyan-100",
    selectedText: "text-blue-900",
    iconColor: "text-blue-600",
    borderColor: "border-blue-200",
  },
  "@claude_code": {
    bgColor: "bg-gradient-to-r from-green-50 to-emerald-50",
    textColor: "text-green-800",
    selectedBg: "bg-gradient-to-r from-green-100 to-emerald-100",
    selectedText: "text-green-900",
    iconColor: "text-green-600",
    borderColor: "border-green-200",
  },
} as const

const DEFAULT_BOT_STYLE = {
  bgColor: "bg-gradient-to-r from-gray-50 to-slate-50",
  textColor: "text-gray-800",
  selectedBg: "bg-gradient-to-r from-gray-100 to-slate-100",
  selectedText: "text-gray-900",
  iconColor: "text-gray-600",
  borderColor: "border-gray-200",
}

const getBotStyles = (bot: string) => BOT_STYLES[bot as keyof typeof BOT_STYLES] || DEFAULT_BOT_STYLE

interface ChatInputProps {
  newMessage: string
  setNewMessage: (message: string) => void
  onSendMessage: () => void
  isFullPage?: boolean
}

const ChatInput = ({ newMessage, setNewMessage, onSendMessage, isFullPage = false }: ChatInputProps) => {
  const [showBotSuggestions, setShowBotSuggestions] = useState(false)
  const [filteredBots, setFilteredBots] = useState<string[]>([])
  const [selectedBotIndex, setSelectedBotIndex] = useState(0)
  const [mentionStartPos, setMentionStartPos] = useState(0)

  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    const cursorPos = e.target.selectionStart
    setNewMessage(value)

    const textBeforeCursor = value.substring(0, cursorPos)
    const lastAtIndex = textBeforeCursor.lastIndexOf("@")

    if (lastAtIndex !== -1) {
      const textAfterAt = textBeforeCursor.substring(lastAtIndex + 1)
      if (!textAfterAt.includes(" ") && !textAfterAt.includes("\n")) {
        const filtered = availableBots.filter((bot) => bot.toLowerCase().includes(textAfterAt.toLowerCase()))
        if (filtered.length > 0) {
          setFilteredBots(filtered)
          setShowBotSuggestions(true)
          setSelectedBotIndex(0)
          setMentionStartPos(lastAtIndex)
          return
        }
      }
    }
    setShowBotSuggestions(false)
  }

  const selectBot = (bot: string) => {
    if (!textareaRef.current) return

    const beforeMention = newMessage.substring(0, mentionStartPos)
    const afterCursor = newMessage.substring(textareaRef.current.selectionStart)
    const newValue = beforeMention + bot + " " + afterCursor

    setNewMessage(newValue)
    setShowBotSuggestions(false)

    setTimeout(() => {
      if (textareaRef.current) {
        const newCursorPos = beforeMention.length + bot.length + 1
        textareaRef.current.focus()
        textareaRef.current.setSelectionRange(newCursorPos, newCursorPos)
      }
    }, 0)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (showBotSuggestions) {
      if (e.key === "ArrowDown") {
        e.preventDefault()
        setSelectedBotIndex((prev) => (prev < filteredBots.length - 1 ? prev + 1 : 0))
      } else if (e.key === "ArrowUp") {
        e.preventDefault()
        setSelectedBotIndex((prev) => (prev > 0 ? prev - 1 : filteredBots.length - 1))
      } else if (e.key === "Tab" || e.key === "Enter") {
        if (!e.shiftKey) {
          e.preventDefault()
          selectBot(filteredBots[selectedBotIndex])
          return
        }
      } else if (e.key === "Escape") {
        setShowBotSuggestions(false)
      }
    }

    if (e.key === "Enter" && !e.shiftKey && !showBotSuggestions) {
      e.preventDefault()
      onSendMessage()
    }
  }

  // Dynamic positioning for bot suggestions based on view mode
  const suggestionsLeftClass = isFullPage ? "left-1/2 transform -translate-x-1/2 w-[65%] max-w-4xl" : "left-6 right-6"

  return (
    <div className={`${isFullPage ? 'flex justify-center w-full' : ''} mt-4 border-t border-gray-200 bg-gradient-to-r from-white to-gray-50 relative`}>
      {showBotSuggestions && (
        <div className={`absolute bottom-full mb-2 bg-white border border-gray-200 rounded-xl shadow-xl z-10 overflow-hidden ${suggestionsLeftClass}`}>
          {filteredBots.map((bot, index) => {
            const styles = getBotStyles(bot)
            return (
              <div
                key={bot}
                className={`px-4 py-3 cursor-pointer text-sm font-semibold flex items-center space-x-3 transition-all duration-150 ${
                  index === selectedBotIndex
                    ? `${styles.selectedBg} ${styles.selectedText} border-l-4 ${styles.borderColor}`
                    : `hover:${styles.bgColor} ${styles.textColor}`
                }`}
                onClick={() => selectBot(bot)}
              >
                <Bot className={`w-4 h-4 ${styles.iconColor}`} />
                <span>{bot}</span>
              </div>
            )
          })}
        </div>
      )}

      <div className={`${isFullPage ? 'w-[65%] max-w-4xl' : 'w-full'} px-6 py-4`}>
        <div className="flex space-x-4 items-center">
          <Textarea
            ref={textareaRef}
            placeholder="Ask about the task or discuss implementation..."
            value={newMessage}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            className="flex-1 text-base resize-none border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-xl shadow-sm transition-all duration-200"
            rows={2}
          />
          <Button
            onClick={onSendMessage}
            disabled={!newMessage.trim()}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 shadow-md transition-all duration-200 px-6"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

export default ChatInput