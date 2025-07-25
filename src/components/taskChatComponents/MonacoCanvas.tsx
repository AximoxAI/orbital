import React, { useEffect, useRef, useState, useCallback } from "react";
import Editor from "@monaco-editor/react";
import { io, Socket } from "socket.io-client";
import { Eye, EyeOff, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MonacoCanvasProps {
  value: string;
  setValue: (val: string) => void;
  taskId?: string;
  executeTaskRef?: React.MutableRefObject<(() => void) | null>;
  isVisible: boolean;
  onSocketConnected?: (connected: boolean) => void;
  onLogMessage?: (msg: {
    status: string;
    message: string;
    summary?: string;
    timestamp?: string;
    filePath?: string;
  }) => void;
}

interface FileItem {
  path: string;
  content: string;
  timestamp: string;
}

const SOCKET_URL = "http://localhost:3000/ws/v1/tasks";
const DEFAULT_AGENT_ID = "codebot";

// Simple function to get language from file extension
const getLanguage = (filePath: string) => {
  if (!filePath) return "plaintext";
  const ext = filePath.split('.').pop()?.toLowerCase();

  if (ext === 'js' || ext === 'jsx') return 'javascript';
  if (ext === 'ts' || ext === 'tsx') return 'typescript';
  if (ext === 'py') return 'python';
  if (ext === 'html') return 'html';
  if (ext === 'css') return 'css';
  if (ext === 'json') return 'json';
  if (ext === 'md') return 'markdown';
  if (ext === 'xml') return 'xml';
  if (ext === 'sql') return 'sql';

  return 'plaintext';
};

const MonacoCanvas = ({
  value,
  setValue,
  taskId,
  executeTaskRef,
  isVisible,
  onSocketConnected,
  onLogMessage,
}: MonacoCanvasProps) => {
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [agentId] = useState(DEFAULT_AGENT_ID);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [hasTriggeredExecution, setHasTriggeredExecution] = useState(false);

  // New states for resizing and preview
  const [width, setWidth] = useState(30); // Width as percentage
  const [isResizing, setIsResizing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewContent, setPreviewContent] = useState('');
  const resizeRef = useRef<HTMLDivElement>(null);

  // Helper for sending logs to TaskChat
  function addCanvasLog(step: {
    status: string;
    message: string;
    summary?: string;
    timestamp?: string;
    filePath?: string;
  }) {
    if (onLogMessage) onLogMessage(step);
  }

  // Socket.io connection and listeners
  useEffect(() => {
    if (!isVisible || !hasTriggeredExecution) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setConnected(false);
        onSocketConnected?.(false);
      }
      return;
    }

    if (socketRef.current && socketRef.current.connected) {
      return;
    }

    const socket = io(SOCKET_URL, {
      transports: ["websocket"],
      forceNew: true,
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      setConnected(true);
      onSocketConnected?.(true);
      addCanvasLog({
        status: "connection",
        message: "✅ Connected to task execution gateway"
      });
    });

    socket.on("disconnect", () => {
      setConnected(false);
      onSocketConnected?.(false);
      addCanvasLog({
        status: "connection",
        message: "❌ Disconnected from server"
      });
    });

    socket.on("connect_error", (error: any) => {
      setConnected(false);
      onSocketConnected?.(false);
      addCanvasLog({
        status: "error",
        message: `❌ Connection error: ${error.message}`
      });
    });

    socket.on('execution_result', (data) => {
      const { taskId: resultTaskId, status, message, summary, timestamp } = data;
      // Log step for every status
      addCanvasLog({
        status,
        message: typeof message === "object" && message?.path
          ? `📄 File content received: ${message.path}`
          : typeof message === "string"
            ? message
            : "",
        summary,
        timestamp,
        filePath: typeof message === "object" && message?.path ? message.path : undefined
      });

      if (
        resultTaskId === taskId &&
        status === "in_progress" &&
        typeof message === "string"
      ) {
        if (value !== message) {
          setValue(message);
        }
      }

      if (
        resultTaskId === taskId &&
        status === "file" &&
        message &&
        typeof message === "object" &&
        message.content &&
        message.path
      ) {
        const newFile: FileItem = {
          path: message.path,
          content: message.content,
          timestamp: timestamp || new Date().toISOString()
        };

        setFiles(prevFiles => {
          const existingIndex = prevFiles.findIndex(f => f.path === message.path);
          if (existingIndex >= 0) {
            const updated = [...prevFiles];
            updated[existingIndex] = newFile;
            return updated;
          }
          return [...prevFiles, newFile];
        });

        setSelectedFile(prev => prev || message.path);
      }
    });

    return () => {
      if (socket && socket.connected) {
        socket.disconnect();
      }
    };
  }, [isVisible, hasTriggeredExecution]);

  // Handle file selection
  const handleFileSelect = (filePath: string) => {
    setSelectedFile(filePath);
    const file = files.find(f => f.path === filePath);
    if (file) {
      setValue(file.content);
    }
  };

  // Execute task function
  const handleExecuteTask = useCallback(() => {
    if (!taskId || !agentId) {
      addCanvasLog({ status: "error", message: "Please provide both Task ID and Agent ID" });
      return;
    }

    setHasTriggeredExecution(true);

    const executeAfterConnection = () => {
      if (!socketRef.current || !socketRef.current.connected) {
        addCanvasLog({ status: "waiting", message: "⏳ Waiting for socket connection..." });
        setTimeout(executeAfterConnection, 500);
        return;
      }
      addCanvasLog({
        status: "execution",
        message: `🚀 Sending execution request for task "${taskId}" with agent "${agentId}"...`
      });
      try {
        socketRef.current.emit("execute", { taskId, agentId });
      } catch (error: any) {
        addCanvasLog({ status: "error", message: `❌ Failed to send request: ${error.message}` });
      }
    };

    if (socketRef.current?.connected) {
      executeAfterConnection();
    } else {
      setTimeout(executeAfterConnection, 1000);
    }
  }, [taskId, agentId]);

  useEffect(() => {
    if (executeTaskRef) {
      executeTaskRef.current = handleExecuteTask;
    }
  }, [handleExecuteTask]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setConnected(false);
      }
    };
  }, []);

  // Resize functionality
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;

      const containerWidth = window.innerWidth;
      const newWidth = Math.max(20, Math.min(80, ((containerWidth - e.clientX) / containerWidth) * 100));
      setWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing]);

  // Preview functionality
  const isHtmlFile = (filePath: string) => {
    return filePath && (filePath.endsWith('.html') || filePath.endsWith('.htm'));
  };

  const currentFileContent = selectedFile ? files.find(f => f.path === selectedFile)?.content || '' : value;
  const currentFileName = selectedFile || 'current-file';

  // Determine the appropriate language for syntax highlighting
  const editorLanguage = selectedFile ? getLanguage(selectedFile) : getLanguage(currentFileName);

  const handleTogglePreview = () => {
    if (!showPreview) {
      setPreviewContent(currentFileContent);
    }
    setShowPreview(!showPreview);
  };

  // Update preview content when file content changes
  useEffect(() => {
    if (showPreview) {
      setPreviewContent(currentFileContent);
    }
  }, [currentFileContent, showPreview]);

  if (!isVisible) {
    return null;
  }

  const statusColor = connected ? "#28a745" : "#dc3545";
  const statusText = connected ? "Connected" : "Disconnected";

  return (
    <>
      {/* Resize handle */}
      <div
        ref={resizeRef}
        className="w-1 bg-gray-200 hover:bg-blue-400 cursor-col-resize transition-colors duration-150 relative group"
        onMouseDown={handleMouseDown}
      >
        <div className="absolute inset-y-0 -left-1 -right-1 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-3 h-8 bg-blue-400 rounded-full flex items-center justify-center">
            <ChevronLeft className="w-2 h-2 text-white" />
            <ChevronRight className="w-2 h-2 text-white -ml-1" />
          </div>
        </div>
      </div>

      {/* Monaco Canvas */}
      <div
        className="flex flex-col bg-gray-50 h-full"
        style={{ width: `${width}%`, minWidth: '260px', maxWidth: '80%' }}
      >
        {/* Header with status and preview button */}
        <div className="font-semibold text-gray-700 p-2 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: statusColor }}
            ></div>
            <span className="text-sm">{statusText}</span>
          </div>

          {(isHtmlFile(currentFileName) || currentFileContent.includes('<html') || currentFileContent.includes('<!DOCTYPE')) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleTogglePreview}
              className="flex items-center space-x-1"
            >
              {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              <span className="text-xs">{showPreview ? 'Hide' : 'Preview'}</span>
            </Button>
          )}
        </div>

        {/* Main content area */}
        <div className="flex-1 rounded-lg border border-gray-200 overflow-hidden m-2 flex">
          {/* File List Sidebar */}
          {files.length > 0 && !showPreview && (
            <div className="w-48 bg-gray-50 border-r border-gray-200 flex flex-col">
              <div className="text-xs text-gray-600 font-medium p-2 border-b border-gray-200 bg-white">
                Files ({files.length})
              </div>
              <div className="flex-1 overflow-y-auto">
                {files.map((file) => (
                  <div
                    key={file.path}
                    className={`px-2 py-2 text-sm cursor-pointer hover:bg-blue-50 border-b border-gray-100 last:border-b-0 ${
                      selectedFile === file.path ? 'bg-blue-100 text-blue-800' : 'text-gray-700'
                    }`}
                    onClick={() => handleFileSelect(file.path)}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">📄</span>
                      <span className="truncate" title={file.path}>{file.path}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Editor or Preview */}
          <div className="flex-1">
            {showPreview ? (
              <div className="h-full flex flex-col">
                <div className="bg-gray-100 px-3 py-1 text-xs text-gray-600 border-b border-gray-200">
                  Preview: {currentFileName}
                </div>
                <iframe
                  srcDoc={previewContent}
                  className="flex-1 w-full border-0"
                  sandbox="allow-scripts allow-same-origin"
                  title="HTML Preview"
                />
              </div>
            ) : (
              <Editor
                height="100%"
                language={editorLanguage}
                value={currentFileContent}
                theme="vs-light"
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  wordWrap: 'on',
                  lineNumbers: 'on',
                  folding: true,
                  renderWhitespace: 'selection'
                }}
                onChange={v => !selectedFile && setValue(v || "")}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default MonacoCanvas;