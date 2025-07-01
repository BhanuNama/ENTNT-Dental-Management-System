import React, { useRef, useState } from 'react';
import { Upload, X, FileText, Image, File, Download } from 'lucide-react';
import { FileAttachment } from '../types';
import { Card } from './Card';

interface FileUploadProps {
  files: FileAttachment[];
  onFilesChange: (files: FileAttachment[]) => void;
  maxFiles?: number;
  disabled?: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({ 
  files, 
  onFilesChange, 
  maxFiles = 5,
  disabled = false
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFileSelect = (selectedFiles: FileList | null) => {
    if (!selectedFiles || disabled) return;

    const newFiles: FileAttachment[] = [];
    
    for (let i = 0; i < selectedFiles.length && files.length + newFiles.length < maxFiles; i++) {
      const file = selectedFiles[i];
      const reader = new FileReader();
      
      reader.onload = () => {
        const fileAttachment: FileAttachment = {
          id: Date.now().toString() + i,
          name: file.name,
          type: file.type,
          url: reader.result as string,
          size: file.size,
          uploadedAt: new Date().toISOString()
        };
        newFiles.push(fileAttachment);
        
        if (newFiles.length === selectedFiles.length || files.length + newFiles.length >= maxFiles) {
          onFilesChange([...files, ...newFiles]);
        }
      };
      
      reader.readAsDataURL(file);
    }
  };

  const removeFile = (fileId: string) => {
    if (disabled) return;
    onFilesChange(files.filter(f => f.id !== fileId));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return Image;
    if (type.includes('pdf')) return FileText;
    return File;
  };

  const getFileTypeColor = (type: string) => {
    if (type.startsWith('image/')) return 'text-blue-500';
    if (type.includes('pdf')) return 'text-red-500';
    return 'text-gray-500';
  };

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <div
        className={`
          border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 cursor-pointer
          ${dragOver 
            ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20' 
            : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-900/10'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          ${files.length >= maxFiles ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        onDragOver={(e: React.DragEvent) => {
          e.preventDefault();
          if (!disabled && files.length < maxFiles) {
          setDragOver(true);
          }
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e: React.DragEvent) => {
          e.preventDefault();
          setDragOver(false);
          if (!disabled && files.length < maxFiles) {
          handleFileSelect(e.dataTransfer.files);
          }
        }}
      >
        <div className="text-center">
          <div className={`
            mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-all duration-300
            ${dragOver 
              ? 'bg-blue-100 dark:bg-blue-900/30 scale-110' 
              : 'bg-gray-100 dark:bg-gray-800 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30'
            }
          `}>
            <Upload className={`
              h-8 w-8 transition-all duration-300
              ${dragOver ? 'text-blue-600' : 'text-gray-400 group-hover:text-blue-600'}
            `} />
          </div>
          
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Upload Files
          </h3>
          
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Drag & drop files here, or{' '}
          <button
            type="button"
              onClick={() => {
                if (!disabled && files.length < maxFiles) {
                  fileInputRef.current?.click();
                }
              }}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold underline decoration-2 underline-offset-2 transition-colors"
          >
            browse
          </button>
        </p>
          
          <div className="flex items-center justify-center gap-4 text-xs text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1">
              <File className="h-3 w-3" />
              Max {maxFiles} files
            </span>
            <span className="flex items-center gap-1">
              <Download className="h-3 w-3" />
              Up to 10MB each
            </span>
          </div>
          
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => handleFileSelect(e.target.files)}
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
            disabled={disabled || files.length >= maxFiles}
        />
         </div>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Uploaded Files ({files.length}/{maxFiles})
            </h4>
            {files.length > 0 && !disabled && (
              <button
                type="button"
                onClick={() => onFilesChange([])}
                className="text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium transition-colors"
              >
                Clear All
              </button>
            )}
          </div>
          
          <div className="grid gap-3">
          {files.map((file) => {
            const FileIcon = getFileIcon(file.type);
              const iconColor = getFileTypeColor(file.type);
              
            return (
                <Card key={file.id} variant="subtle" padding="sm" hover className="group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1 min-w-0">
                      <div className={`p-2 rounded-lg bg-white dark:bg-gray-700 shadow-sm group-hover:shadow-md transition-shadow`}>
                        <FileIcon className={`h-5 w-5 ${iconColor}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                          {file.name}
                        </p>
                        <div className="flex items-center gap-3 mt-1">
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {formatFileSize(file.size)}
                          </p>
                          <p className="text-xs text-gray-400 dark:text-gray-500">
                            {new Date(file.uploadedAt).toLocaleDateString()}
                          </p>
                        </div>
                  </div>
                </div>
                    
                    {!disabled && (
                <button
                  type="button"
                  onClick={() => removeFile(file.id)}
                        className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100"
                >
                  <X className="h-4 w-4" />
                </button>
                    )}
              </div>
                </Card>
            );
          })}
          </div>
        </div>
      )}
      
      {files.length === 0 && (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3">
            <FileText className="h-8 w-8 text-gray-400" />
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-sm">No files uploaded yet</p>
        </div>
      )}
    </div>
  );
};