import React, { useState } from "react"
import { useUser } from "@clerk/clerk-react"
import { Button } from "@/components/ui/button"
import OrbitalHeader from "./OrbitalHeader"
import ChatInput from "../taskChatComponents/TaskChatInput"
import MessagesList from "../taskChatComponents/taskChatMessages"
import { FileItem } from "../taskChatComponents/AttachFileButton"

interface UserType {
  id: string
  name: string
  avatar: string
  isOnline: boolean
  email?:  string
}

interface OrbitalPanelProps {
  isOpen: boolean
  onClose: () => void
}

const STATIC_SUGGESTIONS = [
  "Review authentication module with 92 complexity",
  "Improve coverage for low-tested payment system",
  "Prioritize outdated react-router-dom dependency",
]

const OrbitalPanel = ({
  isOpen,
  onClose,
}: OrbitalPanelProps) => {
  const { user } = useUser()

  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [files, setFiles] = useState<FileItem[]>([])
  const [mentionToInsert, setMentionToInsert] = useState<string | null>(null)
  const [logsOpen, setLogsOpen] = useState(false)
  const [showMonacoCanvas, setShowMonacoCanvas] = useState(false)
  const [executionLogsOpen, setExecutionLogsOpen] = useState(false)
  
  const [availableUsers] = useState<UserType[]>([]) 

  const handleSendMessage = async () => {
    if (!newMessage.trim() && files.length === 0) return

    const tempUserMessage = {
      id: Date.now().toString(),
      type: "human",
      author: user?.username || "You",
      sender_id: user?.username || "me",
      content: newMessage,
      timestamp: new Date().toLocaleString(undefined, {
        hour: "2-digit", 
        minute: "2-digit"
      }),
      isCode: false,
      attachedFiles: files.map(f => ({
          name: f.file.name,
          type: f.file. type,
          size: f. file.size,
          url: "",
          id: f.id || Math.random().toString(), 
          uploadedAt: new Date().toISOString()
      }))
    }

    setMessages((prev) => [...prev, tempUserMessage])
    setNewMessage("")
    setFiles([])
    
  }

  const handleSuggestionClick = (text: string) => {
    setNewMessage(text)
  }
  
  const handleRetryClick = (text: string) => setNewMessage(text)
  const handleFileClick = async () => {} // No-op without backend
  const handleShowGeneratedFiles = async () => {} // No-op

  if (!isOpen) return null

  const containerClasses = "fixed inset-y-0 right-0 w-96 bg-white border-l border-gray-200 shadow-2xl z-50 flex flex-col"

  const showSuggestions = messages.length === 0

  return (
    <div className={containerClasses}>
      <div className="flex flex-col w-full h-full">
        <OrbitalHeader
          onClose={onClose}
          onCallStart={() => console.log("Call clicked (UI only)")}
          onCallEnd={() => console.log("Call ended (UI only)")}
        />

        <MessagesList
          messages={messages}
          loading={false}
          isFullPage={false}
          
          logs={[]}
          logsOpen={logsOpen}
          setLogsOpen={setLogsOpen}
          showMonacoCanvas={showMonacoCanvas}
          summary={[]}
          agentOutput={[]}
          onShowGeneratedFiles={handleShowGeneratedFiles}
          executionLogs={[]}
          executionLogsOpen={executionLogsOpen}
          setExecutionLogsOpen={setExecutionLogsOpen}
          executionLogsMessageId={undefined}
          activeRetrieveProjectId={undefined}
          liveRetrieveProjectLogs={[]}
          liveRetrieveProjectSummary={[]}
          liveAgentOutput={[]}
          isUserSkeletonVisible={false}
          messagesWithFiles={new Set()}
          chatUsers={availableUsers}
          
          onSuggestionClick={handleSuggestionClick}
          onRetryClick={handleRetryClick}
          onFileClick={handleFileClick}
        />

        {showSuggestions && (
          <div className="px-6 pb-4">
            <div className="flex flex-wrap gap-2">
              {STATIC_SUGGESTIONS.map((prompt, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => handleSuggestionClick(prompt)}
                  className="h-auto py-2 px-4 text-sm text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300 rounded-full"
                >
                  {prompt}
                </Button>
              ))}
            </div>
          </div>
        )}

        <ChatInput
          newMessage={newMessage}
          setNewMessage={setNewMessage}
          onSendMessage={handleSendMessage}
          isFullPage={false}
          availableUsers={availableUsers}
          files={files}
          setFiles={setFiles}
          mentionToInsert={mentionToInsert}
          setMentionToInsert={setMentionToInsert}
        />
      </div>
    </div>
  )
}

export default OrbitalPanel