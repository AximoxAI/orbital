import React, { useRef, useEffect, useState } from "react"
import { useAutoAnimate } from "@formkit/auto-animate/react"

import { MessageAvatar } from "./MessageAvatar"
import { MessageContent } from "./MessageContent"
import { TaskSuggestion } from "./TaskSuggestion"
import { MessageType, TaskExecutionLog } from "./types"

interface UserType {
  id: string
  name: string
  avatar: string
  isOnline: boolean
  email?: string
}

interface MessagesListProps {
  messages: MessageType[]
  loading: boolean
  isFullPage: boolean
  logs: string[]
  logsOpen: boolean
  setLogsOpen: (open: boolean) => void
  showMonacoCanvas: boolean
  summary: string[]
  agentOutput: string[]
  onShowGeneratedFiles: (messageId: string) => void
  executionLogs?: TaskExecutionLog[]
  executionLogsOpen?: boolean
  setExecutionLogsOpen?: (open: boolean) => void
  executionLogsMessageId?: string
  activeRetrieveProjectId?: string
  liveRetrieveProjectLogs?: string[]
  liveRetrieveProjectSummary?: string[]
  liveAgentOutput?: string[]
  isUserSkeletonVisible?: boolean
  messagesWithFiles?: Set<string>
  chatUsers?: UserType[] // <-- NEW PROP
  onSuggestionClick: (suggestion: string) => void // <-- NEW PROP
  onRetryClick?: (parentMessageContent: string) => void // <-- NEW PROP
}

const UserMessageSkeleton = () => (
  <div className="flex justify-center w-full animate-slide-in">
    <div className="flex gap-3 w-full max-w-4xl">
      <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0 bg-slate-300 animate-pulse" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2 mb-1">
          <span className="text-sm font-semibold text-slate-900 font-inter">

          </span>
          <span className="text-xs text-slate-400 font-medium font-inter">

          </span>
        </div>
        <div className="border border-slate-200 rounded-xl w-fit bg-white p-2 flex items-center h-auto">
          <div className="text-slate-900 font-normal font-inter p-2 m-0 leading-tight flex items-center">
            <span className="inline-block bg-slate-200 rounded h-4 w-32 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  </div>
)

const MessagesList = ({
  messages,
  loading,
  isFullPage,
  logs,
  logsOpen,
  setLogsOpen,
  showMonacoCanvas,
  summary = [],
  agentOutput = [],
  onShowGeneratedFiles,
  executionLogs = [],
  executionLogsOpen = false,
  setExecutionLogsOpen,
  executionLogsMessageId,
  activeRetrieveProjectId,
  liveRetrieveProjectLogs,
  liveRetrieveProjectSummary = [],
  liveAgentOutput = [],
  isUserSkeletonVisible = false,
  messagesWithFiles = new Set(),
  chatUsers = [],
  onSuggestionClick,
  onRetryClick // <-- NEW PROP
}: MessagesListProps) => {
  const [parent] = useAutoAnimate<HTMLDivElement>()
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const [renderedSkeleton, setRenderedSkeleton] = useState(false)

  const allMessages = messages
    .filter((msg) => !msg.status && msg.type !== "system")
    .sort((a, b) => {
      const timeA =
        a.timestamp && a.timestamp !== "Just now" ? new Date(a.timestamp).getTime() : Number(a.id.split(".")[0])
      const timeB =
        b.timestamp && b.timestamp !== "Just now" ? new Date(b.timestamp).getTime() : Number(b.id.split(".")[0])
      return timeA - timeB
    })

  const latestHumanIdx = allMessages
    .map((msg, idx) => (msg.type === "human" ? idx : -1))
    .filter((idx) => idx !== -1)
    .pop()

  const followingBotIdx = allMessages.findIndex(
    (msg, idx) => latestHumanIdx !== undefined && idx > latestHumanIdx && msg.type === "ai",
  )

  // Helper to get parent user message content for a bot message
  function getParentUserMessageContent(idx: number): string | undefined {
    for (let i = idx - 1; i >= 0; i--) {
      if (allMessages[i].type === "human") {
        return allMessages[i].content
      }
    }
    return undefined
  }

  const renderMessage = (message: MessageType, idx: number) => (
    <React.Fragment key={message.id}>
      <div className="flex justify-center w-full animate-slide-in">
        <div className="flex gap-3 w-full max-w-4xl">
          <MessageAvatar 
          //@ts-ignore
          type={message.type} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <span className="text-sm font-semibold text-slate-900 font-inter">
                {message.type === "human" ? "You" : message.author}
              </span>
              <span className="text-xs text-slate-400 font-medium font-inter">
                {message.timestamp}
              </span>
            </div>
            <MessageContent
              message={message}
              isFullPage={isFullPage}
              onShowGeneratedFiles={onShowGeneratedFiles}
              messageIndex={idx}
              latestHumanIdx={latestHumanIdx}
              followingBotIdx={followingBotIdx}
              logs={logs}
              logsOpen={logsOpen}
              setLogsOpen={setLogsOpen}
              showMonacoCanvas={showMonacoCanvas}
              summary={summary}
              agentOutput={agentOutput}
              executionLogs={executionLogs}
              executionLogsOpen={executionLogsOpen}
              setExecutionLogsOpen={setExecutionLogsOpen}
              executionLogsMessageId={executionLogsMessageId}
              activeRetrieveProjectId={activeRetrieveProjectId}
              liveRetrieveProjectLogs={liveRetrieveProjectLogs}
              liveRetrieveProjectSummary={liveRetrieveProjectSummary}
              liveAgentOutput={liveAgentOutput}
              hasFilesForMessage={messagesWithFiles.has(message.id)}
              chatUsers={chatUsers}
              onSuggestionClick={onSuggestionClick}
              onRetryClick={onRetryClick}
              parentMessageContent={getParentUserMessageContent(idx)}
            />
            {message.taskSuggestion && (
              <TaskSuggestion taskSuggestion={message.taskSuggestion} isFullPage={isFullPage} />
            )}
          </div>
        </div>
      </div>
    </React.Fragment>
  )

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [allMessages.length, loading, isUserSkeletonVisible])

  useEffect(() => {
    if (isUserSkeletonVisible) {
      setRenderedSkeleton(true)
    } else {
      setRenderedSkeleton(false)
    }
  }, [isUserSkeletonVisible])

  if (isFullPage) {
    return (
      <div className="flex-1 overflow-y-auto bg-slate-50 scrollbar-thin font-inter" ref={scrollRef}>
        <div className="flex flex-col items-center w-full h-full">
          <div className="w-full max-w-4xl px-6 py-5 space-y-4" ref={parent}>
            {loading ? (
              <div className="text-center text-slate-500 py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                <span className="font-medium font-inter">Loading messages...</span>
              </div>
            ) : (
              <>
                {allMessages.map(renderMessage)}
                {isUserSkeletonVisible && renderedSkeleton && (
                  <UserMessageSkeleton />
                )}
              </>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 scrollbar-thin font-inter" ref={scrollRef}>
      <div className="flex flex-col items-center w-full">
        <div className="w-full max-w-4xl px-6 py-5 space-y-4" ref={parent}>
          {loading ? (
            <div className="text-center text-slate-500 py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600 mx-auto mb-3"></div>
              <span className="font-medium font-inter">Loading messages...</span>
            </div>
          ) : (
            <>
              {allMessages.map(renderMessage)}
              {isUserSkeletonVisible && renderedSkeleton && (
                <UserMessageSkeleton />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default MessagesList