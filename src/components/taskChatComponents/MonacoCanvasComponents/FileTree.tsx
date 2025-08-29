import React, { useState } from "react";
import { Folder, File as FileIcon, ChevronDown, ChevronRight as ChevronRightIcon } from "lucide-react";
import { FileNode, FolderNode } from "./types";

interface FileTreeProps {
  tree: FolderNode;
  selectedFile: string | null;
  onFileSelect: (filePath: string) => void;
}

const FileTree: React.FC<FileTreeProps> = ({ tree, selectedFile, onFileSelect }) => {
  const [treeOpen, setTreeOpen] = useState<Record<string, boolean>>({});

  const renderTree = (node: FolderNode | FileNode, level = 0) => {
    if (node.type === "folder") {
      if (level === 0) return <div>{node.children.map(child => renderTree(child, level + 1))}</div>;
      const open = !!treeOpen[node.path];
      return (
        <div key={node.path}>
          <div
            className={`flex items-center px-2 py-1 cursor-pointer ${open ? "bg-blue-50" : ""}`}
            style={{ paddingLeft: `${level * 16}px` }}
            onClick={() => setTreeOpen(prev => ({ ...prev, [node.path]: !prev[node.path] }))}
          >
            {open ? <ChevronDown className="w-3 h-3 mr-1 text-gray-500" /> : <ChevronRightIcon className="w-3 h-3 mr-1 text-gray-500" />}
            <Folder className="w-4 h-4 mr-1 text-yellow-500" />
            <span className="font-medium text-xs">{node.name}</span>
          </div>
          {open && <div>{node.children.map(child => renderTree(child, level + 1))}</div>}
        </div>
      );
    } else {
      return (
        <div
          key={node.path}
          className={`flex items-center px-2 py-1 text-sm cursor-pointer border-b border-gray-100 last:border-b-0 ${selectedFile === node.path ? "bg-blue-100 text-blue-800" : "text-gray-700"}`}
          style={{ paddingLeft: `${level * 16 + 28}px` }}
          onClick={() => onFileSelect(node.path)}
        >
          <FileIcon className="w-3 h-3 mr-1 text-gray-500" />
          <span className="truncate" title={node.path}>{node.name}</span>
        </div>
      );
    }
  };

  return <>{renderTree(tree)}</>;
};

export default FileTree;