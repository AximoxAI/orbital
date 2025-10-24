import type { ReactNode } from "react";

export interface MonacoCanvasProps {
    value: string;
    setValue: (val: string) => void;
    taskId?: string;
    executeTaskRef?: React.MutableRefObject<((message?: string) => void) | null>;
    isVisible: boolean;
    onSocketConnected?: (connected: boolean) => void;
    filesFromApi?: { path: string; content: string; [key: string]: any }[];
    onLogsUpdate?: (logs: string[]) => void;
    onSummaryUpdate?: (summary: string[]) => void;
    onAgentOutputUpdate?: (agentOutput: string[]) => void;
    onClose?: () => void;
    inputMessage?: string;
    onFilesGenerated?: (files: FileItem[]) => void;
    customPreview?: ReactNode;
    showCustomPreview?: boolean;
  }
  
  export interface FileItem {
    path: string;
    content: string;
    timestamp: string;
  }
  
  export type FileNode = {
    type: "file";
    name: string;
    path: string;
  };
  export type FolderNode = {
    type: "folder";
    name: string;
    path: string;
    children: (FileNode | FolderNode)[];
  };