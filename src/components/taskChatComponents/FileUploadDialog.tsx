import React, { useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { UploadCloud, File as FileIcon, X } from 'lucide-react';

interface FileUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFilesSelect: (files: File[]) => void;
}

const FileUploadDialog: React.FC<FileUploadDialogProps> = ({ open, onOpenChange, onFilesSelect }) => {
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (selectedFiles: FileList | null) => {
    if (selectedFiles) {
      setFiles(prev => [...prev, ...Array.from(selectedFiles)]);
    }
  };

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
    if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
      handleFileChange(event.dataTransfer.files);
      event.dataTransfer.clearData();
    }
  }, []);

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (!isDragging) setIsDragging(true);
  }, [isDragging]);

  const handleDragLeave = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleBrowseClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.onchange = (e) => {
      const target = e.target as HTMLInputElement;
      handleFileChange(target.files);
    };
    input.click();
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleConfirm = () => {
    onFilesSelect(files);
    onOpenChange(false);
    setFiles([]);
  };
  
  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf': return '📄';
      case 'pptx': return '📊';
      case 'docx': return '📝';
      default: return '📄';
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Upload Files</DialogTitle>
          <DialogDescription>
            Drag and drop files here or click to browse.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div
            className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors duration-200 ${
              isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <div className="flex flex-col items-center justify-center space-y-2">
                <UploadCloud className="w-12 h-12 text-gray-400" />
                <p className="text-gray-500">
                Drag and drop file, or{' '}
                <Button variant="link" className="p-0 h-auto" onClick={handleBrowseClick}>
                    Browse
                </Button>
                </p>
                <p className="text-xs text-gray-400">Supports TXT, MARKDOWN, MDX, PDF, HTML, XLSX, XLS, DOC, DOCX, CSV, EML, MSG, PPTX, XML, EPUB, PPT, MD, HTM. Max 15MB each.</p>
            </div>
          </div>
          {files.length > 0 && (
            <div className="mt-4 space-y-2 max-h-48 overflow-y-auto">
              <h3 className="font-semibold">Selected files:</h3>
              {files.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-2 border rounded-md bg-gray-50">
                   <div className="flex items-center space-x-2">
                        <span className="text-xl">{getFileIcon(file.name)}</span>
                        <div>
                            <p className="text-sm font-medium">{file.name}</p>
                            <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)}MB</p>
                        </div>
                   </div>
                  <Button variant="ghost" size="sm" onClick={() => removeFile(index)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline"  onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button  onClick={handleConfirm} className='hover:bg-slate-800 hover:text-slate-200 bg-slate-700 text-slate-200' disabled={files.length === 0}>
            Attach Files
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FileUploadDialog;