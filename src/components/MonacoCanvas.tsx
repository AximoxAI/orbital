import React, { useEffect, useRef, useState } from "react";
import Editor from "@monaco-editor/react";
import { io, Socket } from "socket.io-client";

interface MonacoCanvasProps {
  value: string;
  setValue: (val: string) => void;
  taskId?: string; // Optional: ID of the task for socket updates
}

interface FileItem {
  path: string;
  content: string;
  timestamp: string;
}

const SOCKET_URL = "http://localhost:3000/ws/v1/tasks";
const DEFAULT_AGENT_ID = "codebot";

const MonacoCanvas = ({ value, setValue, taskId }: MonacoCanvasProps) => {
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [agentId] = useState(DEFAULT_AGENT_ID);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  // --- Socket.io connection and listeners ---
  useEffect(() => {
    // Connect to the socket server
    const socket = io(SOCKET_URL, {
      transports: ["websocket"],
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      setConnected(true);
      console.log("✅ Connected to task execution gateway");
    });

    socket.on("disconnect", () => {
      setConnected(false);
      console.log("❌ Disconnected from server");
    });

    socket.on("connect_error", (error: any) => {
      setConnected(false);
      console.error(`❌ Connection error: ${error.message}`);
    });

    socket.on('execution_result', (data) => {
      const { taskId, status, message, summary, timestamp } = data;
      console.log('📨', data);

      // Update editor value if this is from our taskId, in_progress, and message is string
      if (
        data.taskId === taskId &&
        data.status === "in_progress" &&
        typeof data.message === "string"
      ) {
        if (value !== data.message) {
          setValue(data.message);
        }
      }

      // Handle file content updates - add to file list
      if (
        data.taskId === taskId &&
        data.status === "file" &&
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
          // Check if file already exists, update it
          const existingIndex = prevFiles.findIndex(f => f.path === message.path);
          if (existingIndex >= 0) {
            const updated = [...prevFiles];
            updated[existingIndex] = newFile;
            return updated;
          }
          // Add new file
          return [...prevFiles, newFile];
        });

        // Auto-select the first file if none selected
        setSelectedFile(prev => prev || message.path);
      }

      // Console logs
      if (status === "web_preview_url") {
        console.log(`🌐 Open Live Preview: ${message}`);
      } else if (status === "file_ready") {
        console.log(`⬇️ File ready: ${message}`);
      } else if (status === "file") {
        console.log(`📄 File content received: ${message?.path || 'Unknown file'}`);
      } else if (status === "error") {
        console.error(`❌ Error: ${message}`);
      } else if (status === "running") {
        console.log(`🔄 ${message}`);
      } else if (status === "completed") {
        console.log(`✅ ${message}`);
      } else {
        console.log(`📩 [${status}] ${message}`);
      }

      if (summary) {
        console.log(`📋 Summary: ${summary}`);
      }
      if (timestamp) {
        console.log(`🕒 Completed at: ${timestamp}`);
      }
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [taskId, value, setValue]);

  // Handle file selection
  const handleFileSelect = (filePath: string) => {
    setSelectedFile(filePath);
    const file = files.find(f => f.path === filePath);
    if (file) {
      setValue(file.content);
    }
  };

  // Get file extension for icon/language detection
  const getFileExtension = (path: string) => {
    return path.split('.').pop()?.toLowerCase() || '';
  };

  const getLanguageFromExtension = (ext: string) => {
    const languageMap: { [key: string]: string } = {
      'js': 'javascript',
      'jsx': 'javascript',
      'ts': 'typescript',
      'tsx': 'typescript',
      'css': 'css',
      'html': 'html',
      'json': 'json',
      'md': 'markdown',
      'py': 'python',
      'java': 'java',
      'cpp': 'cpp',
      'c': 'c',
      'php': 'php',
      'rb': 'ruby',
      'go': 'go',
      'rs': 'rust',
      'vue': 'vue',
      'xml': 'xml',
      'yaml': 'yaml',
      'yml': 'yaml'
    };
    return languageMap[ext] || 'plaintext';
  };

  // --- UI: Execute task ---
  const handleExecuteTask = () => {
    if (!taskId || !agentId) {
      console.error("Please provide both Task ID and Agent ID");
      return;
    }
    if (!socketRef.current || !socketRef.current.connected) {
      console.error("❌ Not connected to server. Please wait for connection.");
      return;
    }
    console.log(
      `🚀 Sending execution request for task "${taskId}" with agent "${agentId}"...`
    );
    try {
      socketRef.current.emit("execute", { taskId, agentId });
    } catch (error: any) {
      console.error(`❌ Failed to send request: ${error.message}`);
    }
  };

  // --- UI: Status indicator ---
  const statusColor = connected ? "#28a745" : "#dc3545";
  const statusText = connected ? "Connected" : "Disconnected";

  const selectedFileContent = selectedFile ? files.find(f => f.path === selectedFile)?.content || '' : value;
  const selectedFileExt = selectedFile ? getFileExtension(selectedFile) : 'ts';
  const editorLanguage = getLanguageFromExtension(selectedFileExt);

  return (
    <div className="flex flex-col w-[30%] min-w-[260px] max-w-[600px] bg-gray-50 h-full">
      <div className="font-semibold text-gray-700 p-2 flex items-center">
        Canvas
        <span
          title={statusText}
          style={{
            display: "inline-block",
            width: 10,
            height: 10,
            borderRadius: "50%",
            backgroundColor: statusColor,
            marginLeft: 8,
            marginRight: 4,
          }}
        />
        <span style={{ fontSize: 13, color: "#555" }}>{statusText}</span>
      </div>

      <div className="flex flex-col gap-2 px-2">
        <input
          type="text"
          value={taskId || ""}
          readOnly
          placeholder="Task ID"
          className="border border-gray-300 rounded px-2 py-1 text-sm mb-1 bg-gray-100"
        />
        <div className="flex gap-2">
          <button
            className="bg-blue-600 text-white px-3 py-1 rounded text-sm font-medium hover:bg-blue-700 disabled:bg-gray-400"
            onClick={handleExecuteTask}
            disabled={!connected || !taskId}
            type="button"
          >
            Execute Task
          </button>
        </div>
      </div>

      {/* Editor with File Sidebar */}
      <div className="flex-1 rounded-lg border border-gray-200 overflow-hidden m-2 flex">
        {/* File List Sidebar */}
        {files.length > 0 && (
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

        {/* Editor */}
        <div className="flex-1">
          <Editor
            height="100%"
            defaultLanguage={editorLanguage}
            value={selectedFileContent}
            theme="vs-light"
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              scrollBeyondLastLine: false,
              automaticLayout: true,
              readOnly: !!selectedFile, // Make readonly when viewing files from socket
            }}
            onChange={v => !selectedFile && setValue(v || "")}
          />
        </div>
      </div>
    </div>
  );
};

export default MonacoCanvas;