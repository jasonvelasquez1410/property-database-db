import React, { useRef } from 'react';
import { Icon } from './Icon';

interface FileUploadControlProps {
  id: string;
  onFileChange: (file: File | null) => void;
  fileName?: string;
  fileUrl?: string;
  acceptedFileTypes?: string;
}

export const FileUploadControl = ({ id, onFileChange, fileName, fileUrl, acceptedFileTypes }: FileUploadControlProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFileChange(e.target.files?.[0] ?? null);
  };
  
  const handleClear = () => {
    if (inputRef.current) inputRef.current.value = '';
    onFileChange(null);
  }

  const isFilePresent = fileName && fileUrl && fileUrl !== '#';

  return (
    <div className="flex items-center gap-2 mt-1 w-full">
      <input 
        type="file" 
        id={id} 
        ref={inputRef} 
        onChange={handleFileSelect} 
        className="hidden" 
        accept={acceptedFileTypes || "application/pdf,image/*,.doc,.docx"}
      />
      {!isFilePresent ? (
        <button 
          type="button" 
          onClick={() => inputRef.current?.click()} 
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-semibold border-2 border-dashed border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-colors"
        >
          <Icon type="upload" className="w-4 h-4"/>
          <span>Upload File</span>
        </button>
      ) : (
        <div className="flex items-center justify-between gap-2 text-sm bg-gray-100 p-1.5 rounded-md w-full ring-1 ring-gray-200">
          <div className="flex items-center gap-2 overflow-hidden">
            <Icon type="document" className="w-5 h-5 text-gray-600 flex-shrink-0" />
            <span className="truncate" title={fileName}>{fileName}</span>
          </div>
          <div className="flex items-center flex-shrink-0">
            <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-semibold px-2">View</a>
            <button 
              type="button" 
              onClick={handleClear} 
              className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100"
              aria-label="Clear file"
            >
              <Icon type="close" className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
