import React, { useState } from "react";
import { RotateCcw, Copy, ThumbsUp, ThumbsDown } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MessageActionsProps {
  parentMessageContent?: string;
  messageContent: string;
  onSuggestionClick: (suggestion: string) => void;
  onRetryClick?: (parentMessageContent: string) => void;
  shouldShowActions: boolean;
  shouldShowSuggestions: boolean;
  suggestionPrompts?: string[];
}

export const MessageActions: React.FC<MessageActionsProps> = ({
  parentMessageContent,
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
    const textToCopy = parentMessageContent || messageContent;
    await navigator.clipboard.writeText(textToCopy);
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
              onClick={() => onSuggestionClick(prompt)}
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