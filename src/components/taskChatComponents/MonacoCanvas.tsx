import React, { useEffect, useRef, useState, useCallback, forwardRef } from "react";
import Editor from "@monaco-editor/react";
import { io, Socket } from "socket.io-client";
import { Eye, EyeOff, ChevronLeft, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@clerk/clerk-react";
import { TaskExecutionLogStatusEnum, TaskExecutionLogTypeEnum } from "@/api-client";

interface MonacoCanvasProps {
  value: string;
  setValue: (val: string) => void;
  taskId?: string;
  executeTaskRef?: React.MutableRefObject<((message?: string) => void) | null>;
  isVisible: boolean;
  onSocketConnected?: (connected: boolean) => void;
  filesFromApi?: { path: string; content: string; [key: string]: any }[];
  onLogsUpdate?: (logs: string[]) => void;
  onSummaryUpdate?: (summary: string[]) => void;
  onClose?: () => void;
  inputMessage?: string;
  onFilesGenerated?: (files: any[]) => void;
}

interface FileItem {
  path: string;
  content: string;
  timestamp: string;
}

const SOCKET_URL = "http://localhost:3000/ws/v1/tasks";
const DEFAULT_AGENT_ID = "codebot";
const availableBots = ["@goose", "@orbital_cli", "@gemini_cli", "@claude_code"];

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

const extractBotMentions = (content: string) => {
  if (!content) return [];
  return availableBots.filter(bot => content.includes(bot));
};

const MonacoCanvas = forwardRef(({
  value,
  setValue,
  taskId,
  executeTaskRef,
  isVisible,
  onSocketConnected,
  filesFromApi = [],
  onLogsUpdate,
  onSummaryUpdate,
  onClose,
  inputMessage,
  onFilesGenerated
}: MonacoCanvasProps, _ref) => {
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [agentId] = useState(DEFAULT_AGENT_ID);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [hasTriggeredExecution, setHasTriggeredExecution] = useState(false);

  const [width, setWidth] = useState(50);
  const [isResizing, setIsResizing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewContent, setPreviewContent] = useState('');
  const resizeRef = useRef<HTMLDivElement>(null);

  const [consoleLogs, setConsoleLogs] = useState<string[]>([]);
  const [summaryLogs, setSummaryLogs] = useState<string[]>([]);

  const { getToken } = useAuth();

  useEffect(() => {
    if (onLogsUpdate) {
      onLogsUpdate(consoleLogs);
    }
  }, [consoleLogs, onLogsUpdate]);

  useEffect(() => {
    if (onSummaryUpdate) {
      onSummaryUpdate(summaryLogs);
    }
  }, [summaryLogs, onSummaryUpdate]);

  useEffect(() => {
    if (filesFromApi && filesFromApi.length > 0) {
      const mapped: FileItem[] = filesFromApi.map((f) => ({
        path: f.path,
        content: f.content,
        timestamp: f.created_at || new Date().toISOString(),
      }));
      setFiles(mapped);
      setSelectedFile(mapped[0]?.path || null);
      setShowPreview(false);
    }
  }, [filesFromApi]);

  useEffect(() => {
    let isMounted = true;
    let socket: Socket | null = null;

    const connectSocket = async () => {
      const sessionToken = await getToken();
      if (!isMounted) return;

      socket = io(SOCKET_URL, {
        transports: ["websocket"],
        forceNew: true,
        auth: {
          token: sessionToken || undefined,
        },
      });
      socketRef.current = socket;

      socket.on("connect", () => {
        setConnected(true);
        onSocketConnected?.(true);
      });

      socket.on("disconnect", () => {
        setConnected(false);
        onSocketConnected?.(false);
      });

      socket.on("connect_error", () => {
        setConnected(false);
        onSocketConnected?.(false);
      });

      socket.on('execution_result', (data) => {
        console.log(data);
        if (
          data &&
          (data.type === TaskExecutionLogTypeEnum.Agent || data.type === TaskExecutionLogTypeEnum.Sandbox)
        ) {
          if (typeof data.content === "string") {
            setConsoleLogs(prev => [...prev, data.content]);
          }
        }
        if (data && data.type === TaskExecutionLogTypeEnum.Summary) {
          setSummaryLogs(prev => [...prev, data.content || ""]);
          console.log("Summary received:", data.content);
        }

        const { taskId: resultTaskId, status, message, summary: unusedSummary, timestamp } = data;

        if (
          resultTaskId === taskId &&
          status === TaskExecutionLogStatusEnum.InProgress &&
          typeof message === "string"
        ) {
          if (value !== message) {
            setValue(message);
          }
        }

        if (
          resultTaskId === taskId &&
          status === TaskExecutionLogStatusEnum.File &&
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
            let updatedFiles;
            if (existingIndex >= 0) {
              updatedFiles = [...prevFiles];
              updatedFiles[existingIndex] = newFile;
            } else {
              updatedFiles = [...prevFiles, newFile];
            }

            if (onFilesGenerated) {
              onFilesGenerated(updatedFiles);
            }

            return updatedFiles;
          });

          setSelectedFile(prev => prev || message.path);
        }
      });
    };

    connectSocket();

    return () => {
      isMounted = false;
      if (socketRef.current && socketRef.current.connected) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setConnected(false);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskId, setValue, onFilesGenerated, getToken]);

  const handleFileSelect = (filePath: string) => {
    setSelectedFile(filePath);
    const file = files.find(f => f.path === filePath);
    if (file) {
      setValue(file.content);
    }
  };

  const clearCanvasState = useCallback(() => {
    setFiles([]);
    setSelectedFile(null);
    setShowPreview(false);
    setPreviewContent('');
    setValue("// Type your code here...");
  }, [setValue]);

  const handleExecuteTask = useCallback((messageOverride?: string) => {
    if (!taskId || !agentId) {
      return;
    }

    clearCanvasState();

    setHasTriggeredExecution(true);
    setConsoleLogs([]);
    setSummaryLogs([]);

    const executeAfterConnection = () => {
      if (!socketRef.current || !socketRef.current.connected) {
        setTimeout(executeAfterConnection, 500);
        return;
      }

      try {
        const messageToSend = messageOverride || inputMessage || "";
        const mentions = extractBotMentions(messageToSend);

        socketRef.current.emit("execute", {
          taskId,
          agentId,
          message: messageToSend,
          mentions
        });
      } catch (error) {
        console.error("Error executing task:", error);
      }
    };

    if (socketRef.current?.connected) {
      executeAfterConnection();
    } else {
      setTimeout(executeAfterConnection, 1000);
    }
  }, [taskId, agentId, inputMessage, clearCanvasState]);

  useEffect(() => {
    if (executeTaskRef) {
      executeTaskRef.current = handleExecuteTask;
    }
  }, [handleExecuteTask, executeTaskRef]);

  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setConnected(false);
      }
    };
  }, []);

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

  const isHtmlFile = (filePath: string) => {
    return filePath && (filePath.endsWith('.html') || filePath.endsWith('.htm'));
  };

  const currentFileContent = selectedFile
    ? files.find((f) => f.path === selectedFile)?.content || ""
    : value;
  const currentFileName = selectedFile || (files[0]?.path ?? "current-file");

  const editorLanguage = selectedFile ? getLanguage(selectedFile) : getLanguage(currentFileName);

  const handleTogglePreview = () => {
    if (!showPreview) {
      setPreviewContent(currentFileContent);
    }
    setShowPreview(!showPreview);
  };

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

      <div
        className="flex flex-col bg-gray-50 h-full"
        style={{ width: `${width}%`, minWidth: '260px', maxWidth: '80%' }}
      >
        {/* Header with close button */}
        <div className="font-semibold text-gray-700 p-2 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: statusColor }}
            ></div>
            <span className="text-sm">{statusText}</span>
            {files.length > 0 && (
              <span className="text-xs text-gray-500">({files.length} files)</span>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleTogglePreview}
              className="flex items-center space-x-1"
            >
              {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              <span className="text-xs">{showPreview ? 'Hide' : 'Preview'}</span>
            </Button>
            {onClose && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="flex items-center space-x-1"
                aria-label="Close MonacoCanvas"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        <div className="flex-1 rounded-lg border border-gray-200 overflow-hidden m-2 flex">
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
});

export default MonacoCanvas;