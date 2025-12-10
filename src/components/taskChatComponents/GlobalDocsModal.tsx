import { useEffect, useState, useMemo } from "react"
import { FileText, Plus, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFileSystem, Item } from "../FileSystemContext";

interface UploadedFile {
  name: string;
  size: number;
  type: string;
  uploadedAt: string;
  id: string;
  url: string;
  originalFile?: File; 
}

const formatSize = (bytes: number) => {
  if (!bytes) return "0 KB"
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

interface GlobalDocsModalProps {
  open: boolean;
  onClose: () => void;
  attachedDocs: UploadedFile[];
  onAttach: (doc: UploadedFile) => void;
}

const GlobalDocsModal = ({
  open,
  onClose,
  attachedDocs,
  onAttach,
}: GlobalDocsModalProps) => {
  
  const { items } = useFileSystem();

  const allDocs = useMemo(() => {
    const extractFiles = (list: Item[]): UploadedFile[] => {
      let results: UploadedFile[] = []
      for (const item of list) {
        if (item.type === "file") {
          results.push({
            id: item.id,
            name: item.name,
            size: item.size || 0,
            type: item.mimeType || "application/octet-stream", 
            uploadedAt: item.createdAt || new Date().toISOString(),
            url: item.url || "",
            originalFile: item.originalFile // <--- PASSING THE REAL FILE
          })
        } else if (item.type === "folder" && item.children) {
          results = [...results, ...extractFiles(item.children)]
        }
      }
      return results
    }
    return extractFiles(items);
  }, [items]); 

  if (!open) return null;
  
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-2xl p-6 relative max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-2xl font-bold transition-colors"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
        <h3 className="text-xl font-bold mb-2 text-gray-900">Add Documents</h3>
        <p className="text-sm text-gray-600 mb-4">
          Select documents from your file library
        </p>
        <div className="space-y-2">
          {allDocs.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500 font-medium">No files found.</p>
              <p className="text-xs text-gray-400 mt-1">Add files in the "Documents" page first.</p>
            </div>
          ) : (
            allDocs.map((doc) => {
              const isAttached = attachedDocs.some(d => d.id === doc.id);
              
              return (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors group"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="flex-shrink-0 w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-slate-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{doc.name}</p>
                      <p className="text-xs text-gray-500">
                        {formatSize(doc.size)} •
                        {typeof doc.uploadedAt === "string" ? new Date(doc.uploadedAt).toLocaleDateString() : ""}
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant={isAttached ? "default" : "outline"}
                    className={`ml-3 flex-shrink-0 transition-all ${
                      isAttached 
                        ? "bg-slate-600 text-white border-slate-600 hover:bg-slate-700" 
                        : "group-hover:bg-slate-600 group-hover:text-white group-hover:border-slate-600"
                    }`}
                    onClick={() => !isAttached && onAttach(doc)}
                    disabled={isAttached}
                  >
                    {isAttached ? (
                      <>
                        <Check className="w-4 h-4 mr-1" />
                        Attached
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-1" />
                        Attach
                      </>
                    )}
                  </Button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default GlobalDocsModal;