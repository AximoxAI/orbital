import { useEffect, useState, useCallback } from "react";
import { TaskExecutionLogStatusEnum, TaskExecutionLogTypeEnum } from "@/api-client";
import { TaskChatAPI } from "../../apiComponents/TaskChatApi";
import { FileItem } from "./types";

interface UseMonacoSocketProps {
  api: TaskChatAPI | null;
  taskId?: string;
  setValue: (v: string) => void;
  setFiles: React.Dispatch<React.SetStateAction<FileItem[]>>;
  setConsoleLogs: React.Dispatch<React.SetStateAction<string[]>>;
  setSummaryLogs: React.Dispatch<React.SetStateAction<string[]>>;
  setAgentOutputLogs: React.Dispatch<React.SetStateAction<string[]>>;
  onSocketConnected?: (connected: boolean) => void;
  onFilesGenerated?: (files: FileItem[]) => void;
  value: string;
}

export function useMonacoSocket({
  api,
  taskId,
  setValue,
  setFiles,
  setConsoleLogs,
  setSummaryLogs,
  setAgentOutputLogs,
  onSocketConnected,
  onFilesGenerated,
  value,
}: UseMonacoSocketProps) {
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!api || !taskId) return;

    const handleExecutionResult = (data: any) => {
      if (data?.type === TaskExecutionLogTypeEnum.Agent || data?.type === TaskExecutionLogTypeEnum.Sandbox) {
        if (typeof data.content === "string") setConsoleLogs(prev => [...prev, data.content]);
      }
      if (data?.type === TaskExecutionLogTypeEnum.AgentOutput) setAgentOutputLogs(prev => [...prev, data.content || ""]);
      if (data?.type === TaskExecutionLogTypeEnum.Summary) setSummaryLogs(prev => [...prev, data.content || ""]);
      const { taskId: resultTaskId, status, message, timestamp } = data;

      if (resultTaskId === taskId && status === TaskExecutionLogStatusEnum.InProgress && typeof message === "string") {
        if (value !== message) setValue(message);
      }

      if (resultTaskId === taskId && status === TaskExecutionLogStatusEnum.File && message?.content && message?.path) {
        const newFile: FileItem = { path: message.path, content: message.content, timestamp: timestamp || new Date().toISOString() };
        setFiles(prevFiles => {
          const existingIndex = prevFiles.findIndex(f => f.path === message.path);
          const updatedFiles = existingIndex >= 0 ? [...prevFiles] : [...prevFiles, newFile];
          if (existingIndex >= 0) updatedFiles[existingIndex] = newFile;
          onFilesGenerated?.(updatedFiles);
          return updatedFiles;
        });
      }
    };

    api.connectExecutionSocket({
      onConnect: () => { setConnected(true); onSocketConnected?.(true); },
      onDisconnect: () => { setConnected(false); onSocketConnected?.(false); },
      onExecutionResult: handleExecutionResult,
    });

    return () => {
      api.disconnectExecutionSocket();
      setConnected(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [api, taskId, setValue, onFilesGenerated, value]);

  return connected;
}