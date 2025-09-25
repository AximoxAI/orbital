import React, { useState } from "react";
import { RotateCcw, Copy, ThumbsUp, ThumbsDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { TasksApi } from "@/api-client/api";
import { Configuration as OpenApiConfiguration } from "@/api-client/configuration";
import { TaskExecutionLogTypeEnum, TaskExecutionLogStatusEnum } from "@/api-client";

const configuration = new OpenApiConfiguration({
  basePath: import.meta.env.VITE_BACKEND_API_KEY,
});
const tasksApi = new TasksApi(configuration);

interface MessageActionsProps {
  messageId: string;
  parentMessageContent?: string;
  parentAgentName?: string;
  messageContent: string;
  onSuggestionClick: (suggestion: string, parentAgentName?: string) => void;
  onRetryClick?: (parentMessageContent: string) => void;
  shouldShowActions: boolean;
  shouldShowSuggestions: boolean;
  suggestionPrompts?: string[];
}

export const MessageActions: React.FC<MessageActionsProps> = ({
  messageId,
  parentMessageContent,
  parentAgentName,
  messageContent,
  onSuggestionClick,
  onRetryClick,
  shouldShowActions,
  shouldShowSuggestions,
  suggestionPrompts = [
    "Review the codebase structure",
    "Understand key workflows and data flow",
    "Clarify requirements with the team"
  ]
}) => {
  const [likeState, setLikeState] = useState<"none" | "liked" | "disliked">("none");
  const [likeAnim, setLikeAnim] = useState(false);
  const [dislikeAnim, setDislikeAnim] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const { toast } = useToast();

  const handleThumbsUp = () => {
    if (likeState === "liked") return;
    setLikeState("liked");
    setLikeAnim(true);
    setTimeout(() => setLikeAnim(false), 400);
    if (likeState === "disliked") setDislikeAnim(false);
  };

  const handleThumbsDown = () => {
    if (likeState === "disliked") return;
    setLikeState("disliked");
    setDislikeAnim(true);
    setTimeout(() => setDislikeAnim(false), 400);
    if (likeState === "liked") setLikeAnim(false);
  };

  const handleRefresh = () => {
    if (onRetryClick && parentMessageContent) {
      onRetryClick(parentMessageContent);
    }
  };

  const handleCopy = async () => {
    setIsCopying(true);
    let agentOutput = "";
    try {
      const res = await tasksApi.tasksControllerGetExecutionLogs(messageId);
      const logs = Array.isArray(res.data) ? res.data : [res.data];
      const agentOutputLogs = logs.filter(
        (log) =>
          log.type === TaskExecutionLogTypeEnum.AgentOutput &&
          log.status === TaskExecutionLogStatusEnum.Agent &&
          log.content
      );
      if (agentOutputLogs.length > 0) {
        agentOutput = agentOutputLogs[agentOutputLogs.length - 1].content || "";
      }
    } catch (e) {
      agentOutput = "";
    }

    if (!agentOutput.trim()) {
      toast({
        title: "No output to copy",
        description: "There is no agent output available to copy.",
        duration: 2000,
        variant: "destructive",
      });
      setIsCopying(false);
      return;
    }

    try {
      await navigator.clipboard.writeText(agentOutput);
      toast({
        title: "Copied!",
        description: "Content has been copied to clipboard.",
        duration: 2000,
      });
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Could not copy content to clipboard.",
        variant: "destructive",
        duration: 2000,
      });
    }
    setIsCopying(false);
  };

  return (
    <div>
      {shouldShowActions && (
        <div className="flex items-center justify-start gap-2 mt-3 mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            className="h-8 w-8 p-0 text-slate-500 hover:text-slate-700 hover:bg-slate-100"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            disabled={isCopying}
            className="h-8 w-8 p-0 text-slate-500 hover:text-slate-700 hover:bg-slate-100"
          >
            <Copy className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleThumbsUp}
            className={`h-8 w-8 p-0 hover:text-slate-700 hover:bg-slate-100 transition-transform ${
              likeAnim ? "scale-125 duration-300" : ""
            }`}
            style={{
              backgroundColor: likeState === "liked" ? "#64748b" : undefined,
              color: likeState === "liked" ? "#fff" : "#64748b",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <ThumbsUp
              className="h-4 w-4"
              style={{
                backgroundColor: likeState === "liked" ? "#64748b" : "transparent",
                color: likeState === "liked" ? "#fff" : "#64748b",
              }}
            />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleThumbsDown}
            className={`h-8 w-8 p-0 hover:text-slate-700 hover:bg-slate-100 transition-transform ${
              dislikeAnim ? "scale-125 duration-300" : ""
            }`}
            style={{
              backgroundColor: likeState === "disliked" ? "#64748b" : undefined,
              color: likeState === "disliked" ? "#fff" : "#64748b",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <ThumbsDown
              className="h-4 w-4"
              style={{
                backgroundColor: likeState === "disliked" ? "#64748b" : "transparent",
                color: likeState === "disliked" ? "#fff" : "#64748b",
              }}
            />
          </Button>
        </div>
      )}
      {shouldShowSuggestions && (
        <div className="flex flex-wrap gap-2">
          {suggestionPrompts.map((prompt, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              onClick={() => onSuggestionClick(prompt, parentAgentName)}
              className="h-auto py-2 px-4 text-sm text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300 rounded-full"
            >
              {prompt}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
};