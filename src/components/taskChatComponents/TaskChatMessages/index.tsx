import React, { useRef, useEffect, useState, useCallback } from "react"
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
  chatUsers?: UserType[]
  onSuggestionClick: (suggestion: string, parentAgentName?: string) => void
  onRetryClick?: (parentMessageContent: string) => void
}

const UserMessageSkeleton = () => (
  <div className="flex justify-center w-full animate-slide-in">
    <div className="flex gap-3 w-full max-w-4xl">
      <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0 bg-slate-300 animate-pulse" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2 mb-1">
          <span className="text-sm font-semibold text-slate-900 font-inter"></span>
          <span className="text-xs text-slate-400 font-medium font-inter"></span>
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

function preprocessMessagesWithParentContent(messages: MessageType[]) {
  let lastHumanContent: string | undefined = undefined
  let lastHumanIdx: number | undefined = undefined
  return messages.map((msg, idx) => {
    if (msg.type === "human") {
      lastHumanContent = msg.content
      lastHumanIdx = idx
      return { ...msg }
    } else if (msg.type === "ai") {
      let parentAgentName: string | undefined = msg.author
      return { ...msg, parentMessageContent: lastHumanContent, parentAgentName }
    }
    return { ...msg }
  })
}

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
  onRetryClick
}: MessagesListProps) => {
  const [parent] = useAutoAnimate<HTMLDivElement>()
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const [renderedSkeleton, setRenderedSkeleton] = useState(false)
  const shouldAutoScrollRef = useRef(true)
  const scrollTimeoutRef = useRef<NodeJS.Timeout>()

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

  const processedMessages = preprocessMessagesWithParentContent(allMessages)

  const scrollToBottom = useCallback((force = false) => {
    if (!scrollRef.current) return
    const container = scrollRef.current
    const isNearBottom = container.scrollTop + container.clientHeight >= container.scrollHeight - 100
    if (force || isNearBottom || shouldAutoScrollRef.current) {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: 'smooth'
      })
    }
  }, [])

  const handleContentHeightChange = useCallback(() => {
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current)
    }
    scrollTimeoutRef.current = setTimeout(() => {
      scrollToBottom()
    }, 150)
  }, [scrollToBottom])

  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return
    const container = scrollRef.current
    const isNearBottom = container.scrollTop + container.clientHeight >= container.scrollHeight - 100
    shouldAutoScrollRef.current = isNearBottom
  }, [])

  const renderMessage = (message: MessageType, idx: number) => (
    <React.Fragment key={message.id}>
      <div className="flex justify-center w-full animate-slide-in">
        <div className="flex gap-3 w-full max-w-4xl">
          <MessageAvatar type={message.type} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <span className="text-sm font-semibold text-slate-900 font-inter">
                  {message.sender_id}              
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
              parentMessageContent={message.parentMessageContent}
              parentAgentName={message.parentAgentName}
              onContentHeightChange={handleContentHeightChange}
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
    scrollToBottom(true)
  }, [allMessages.length, scrollToBottom])

  useEffect(() => {
    if (!loading || isUserSkeletonVisible) {
      const timer = setTimeout(() => {
        scrollToBottom(true)
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [loading, isUserSkeletonVisible, scrollToBottom])

  useEffect(() => {
    if (isUserSkeletonVisible) {
      setRenderedSkeleton(true)
    } else {
      setRenderedSkeleton(false)
    }
  }, [isUserSkeletonVisible])

  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }
    }
  }, [])

  if (isFullPage) {
    return (
      <div 
        className="flex-1 overflow-y-auto bg-slate-50 scrollbar-thin font-inter" 
        ref={scrollRef}
        onScroll={handleScroll}
      >
        <div className="flex flex-col items-center w-full h-full">
          <div className="w-full max-w-4xl px-6 py-5 space-y-4" ref={parent}>
            {loading ? (
              <div className="text-center text-slate-500 py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                <span className="font-medium font-inter">Loading messages...</span>
              </div>
            ) : (
              <>
                {processedMessages.map(renderMessage)}
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
    <div 
      className="flex-1 overflow-y-auto bg-slate-50 scrollbar-thin font-inter" 
      ref={scrollRef}
      onScroll={handleScroll}
    >
      <div className="flex flex-col items-center w-full">
        <div className="w-full max-w-4xl px-6 py-5 space-y-4" ref={parent}>
          {loading ? (
            <div className="text-center text-slate-500 py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600 mx-auto mb-3"></div>
              <span className="font-medium font-inter">Loading messages...</span>
            </div>
          ) : (
            <>
              {processedMessages.map(renderMessage)}
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