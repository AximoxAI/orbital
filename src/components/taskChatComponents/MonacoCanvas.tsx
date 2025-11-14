import React, { useEffect, useRef, useState, useCallback, forwardRef } from "react";
import Editor from "@monaco-editor/react";
import { Eye, EyeOff, ChevronLeft, ChevronRight, X, Github } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@clerk/clerk-react";
import { TaskChatAPI, createTaskChatAPI } from "../apiComponents/TaskChatApi";
import { MonacoCanvasProps, FileItem } from "./MonacoCanvasComponents/types";
import { getLanguage, buildFileTree, extractBotMentions, DEFAULT_AGENT_ID } from "./MonacoCanvasComponents/monacoUtils";
import { useMonacoSocket } from "./MonacoCanvasComponents/useMonacoSocket";
import FileTree from "./MonacoCanvasComponents/FileTree";

const MonacoCanvas = forwardRef((props: MonacoCanvasProps, _ref) => {
  const {
    value, setValue, taskId, executeTaskRef, isVisible, onSocketConnected,
    filesFromApi = [], onLogsUpdate, onSummaryUpdate, onAgentOutputUpdate,
    onClose, inputMessage, onFilesGenerated,
    customPreview, showCustomPreview, 
    onSyncWithGitHub
  } = props;
  const [api, setApi] = useState<TaskChatAPI | null>(null);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [width, setWidth] = useState(50);
  const [isResizing, setIsResizing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewContent, setPreviewContent] = useState('');
  const [consoleLogs, setConsoleLogs] = useState<string[]>([]);
  const [summaryLogs, setSummaryLogs] = useState<string[]>([]);
  const [agentOutputLogs, setAgentOutputLogs] = useState<string[]>([]);
  const resizeRef = useRef<HTMLDivElement>(null);
  const { getToken } = useAuth();
  const connected = useMonacoSocket({
    api, taskId, setValue, setFiles, setConsoleLogs, setSummaryLogs,
    setAgentOutputLogs, onSocketConnected, onFilesGenerated, value
  });

  useEffect(() => { onLogsUpdate?.(consoleLogs); }, [consoleLogs, onLogsUpdate]);
  useEffect(() => { onSummaryUpdate?.(summaryLogs); }, [summaryLogs, onSummaryUpdate]);
  useEffect(() => { onAgentOutputUpdate?.(agentOutputLogs); }, [agentOutputLogs, onAgentOutputUpdate]);
  useEffect(() => {
    if (filesFromApi && filesFromApi.length > 0) {
      const mapped = filesFromApi.map(f => ({
        path: f.path, content: f.content, timestamp: f.created_at || new Date().toISOString(),
      }));
      setFiles(mapped);
      setSelectedFile(mapped[0]?.path || null);
      setShowPreview(false);
    }
  }, [filesFromApi]);

  useEffect(() => {
    const initializeApi = async () => {
      const sessionToken = await getToken();
      setApi(createTaskChatAPI(sessionToken || undefined));
    };
    initializeApi();
  }, [getToken]);

  const handleFileSelect = (filePath: string) => {
    setSelectedFile(filePath);
    const file = files.find(f => f.path === filePath);
    if (file) setValue(file.content);
  };

  const clearCanvasState = useCallback(() => {
    setFiles([]); setSelectedFile(null); setShowPreview(false);
    setPreviewContent(''); setValue("// Type your code here...");
  }, [setValue]);

  const handleExecuteTask = useCallback((messageOverride?: string) => {
    if (!taskId || !api) return;
    clearCanvasState();
    setConsoleLogs([]); setSummaryLogs([]); setAgentOutputLogs([]);
    const executeAfterConnection = () => {
      if (!connected) return setTimeout(executeAfterConnection, 500);
      try {
        const messageToSend = messageOverride || inputMessage || "";
        const mentions = extractBotMentions(messageToSend);
        const mentionAgent = mentions.length > 0 ? mentions[0].replace(/^@/, "") : DEFAULT_AGENT_ID;
        api.executeTask({ taskId, agentId: mentionAgent, message: messageToSend, mentions });
      } catch (error) { }
    };
    if (connected) executeAfterConnection();
    else setTimeout(executeAfterConnection, 1000);
  }, [taskId, inputMessage, clearCanvasState, api, connected]);

  useEffect(() => { if (executeTaskRef) executeTaskRef.current = handleExecuteTask; }, [handleExecuteTask, executeTaskRef]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault(); setIsResizing(true);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      const containerWidth = window.innerWidth;
      const newWidth = Math.max(20, Math.min(80, ((containerWidth - e.clientX) / containerWidth) * 100));
      setWidth(newWidth);
    };
    const handleMouseUp = () => setIsResizing(false);
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

  const currentFileContent = selectedFile ? files.find(f => f.path === selectedFile)?.content || "" : value;
  const currentFileName = selectedFile || (files[0]?.path ?? "current-file");
  const editorLanguage = getLanguage(selectedFile || currentFileName);
  const fileTree = buildFileTree(files);

  const handleTogglePreview = () => {
    if (!showPreview) setPreviewContent(currentFileContent);
    setShowPreview(!showPreview);
  };

  useEffect(() => {
    if (showPreview) setPreviewContent(currentFileContent);
  }, [currentFileContent, showPreview]);

  const handleSyncWithGitHub = useCallback(() => {
    if (onSyncWithGitHub) {
      onSyncWithGitHub();
    }
  }, [onSyncWithGitHub]);

  if (!isVisible) return null;
  const statusColor = connected ? "#28a745" : "#dc3545";
  const statusText = connected ? "Connected" : "Disconnected";
  const isCustomPreview = !!customPreview && !!showCustomPreview;
  const effectivePreview = isCustomPreview || showPreview;

  return (
    <>
      <div ref={resizeRef} className="w-1 bg-gray-200 hover:bg-blue-400 cursor-col-resize transition-colors duration-150 relative group" onMouseDown={handleMouseDown}>
        <div className="absolute inset-y-0 -left-1 -right-1 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-3 h-8 bg-blue-400 rounded-full flex items-center justify-center">
            <ChevronLeft className="w-2 h-2 text-white" />
            <ChevronRight className="w-2 h-2 text-white -ml-1" />
          </div>
        </div>
      </div>
      <div className="flex flex-col bg-gray-50 h-full" style={{ width: `${width}%`, minWidth: '260px', maxWidth: '80%' }}>
        <div className="font-semibold text-gray-700 p-2 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: statusColor }}></div>
            <span className="text-sm">{statusText}</span>
            {files.length > 0 && <span className="text-xs text-gray-500">({files.length} files)</span>}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSyncWithGitHub}
              className="flex items-center space-x-1"
              aria-label="Sync with GitHub"
            >
              <Github className="w-4 h-4" />
              <span className="text-xs">Sync</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={handleTogglePreview} className="flex items-center space-x-1">
              {effectivePreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              <span className="text-xs">{effectivePreview ? 'Hide' : 'Preview'}</span>
            </Button>
            {onClose && <Button variant="ghost" size="sm" onClick={onClose} className="flex items-center space-x-1" aria-label="Close MonacoCanvas"><X className="w-4 h-4" /></Button>}
          </div>
        </div>
        <div className="flex-1 rounded-lg border border-gray-200 overflow-hidden m-2 flex">
          {files.length > 0 && !effectivePreview && (
            <div className="w-48 bg-gray-50 border-r border-gray-200 flex flex-col">
              <div className="text-xs text-gray-600 font-medium p-2 border-b border-gray-200 bg-white">Files ({files.length})</div>
              <div className="flex-1 overflow-y-auto"><FileTree tree={fileTree} selectedFile={selectedFile} onFileSelect={handleFileSelect} /></div>
            </div>
          )}
          <div className="flex-1">
            {effectivePreview ? (
              isCustomPreview ? (
                <div className="h-full w-full overflow-auto bg-[#0B0F1A]">
                  {customPreview}
                </div>
              ) : (
                <div className="h-full flex flex-col">
                  <div className="bg-gray-100 px-3 py-1 text-xs text-gray-600 border-b border-gray-200">Preview: {currentFileName}</div>
                  <iframe srcDoc={previewContent} className="flex-1 w-full border-0" sandbox="allow-scripts allow-same-origin" title="HTML Preview" />
                </div>
              )
            ) : (
              <Editor
                height="100%"
                language={editorLanguage}
                value={currentFileContent}
                theme="vs-light"
                options={{ minimap: { enabled: false }, fontSize: 14, scrollBeyondLastLine: false, automaticLayout: true, wordWrap: 'on', lineNumbers: 'on', folding: true, renderWhitespace: 'selection' }}
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