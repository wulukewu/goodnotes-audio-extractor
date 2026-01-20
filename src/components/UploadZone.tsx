"use client";

import { useState, useCallback, useRef } from "react";

interface UploadZoneProps {
  onUploadComplete: (result: UploadResult) => void;
  onError: (error: string) => void;
}

interface UploadResult {
  sessionId: string;
  totalFiles: number;
  extractedAudios: number;
  audioFiles: string[];
}

export default function UploadZone({
  onUploadComplete,
  onError,
}: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const processFiles = useCallback(
    async (files: FileList | File[]) => {
      const goodnotesFiles = Array.from(files).filter((file) =>
        file.name.endsWith(".goodnotes"),
      );

      if (goodnotesFiles.length === 0) {
        onError("Please upload .goodnotes files only");
        return;
      }

      setIsUploading(true);
      setProgress(10);

      try {
        const formData = new FormData();
        goodnotesFiles.forEach((file) => {
          formData.append("files", file);
        });

        setProgress(30);

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        setProgress(80);

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Upload failed");
        }

        setProgress(100);
        onUploadComplete(result);
      } catch (error) {
        onError(error instanceof Error ? error.message : "Upload failed");
      } finally {
        setIsUploading(false);
        setProgress(0);
      }
    },
    [onUploadComplete, onError],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = e.dataTransfer.files;
      processFiles(files);
    },
    [processFiles],
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files) {
        processFiles(files);
      }
    },
    [processFiles],
  );

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div
      onClick={handleClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        relative overflow-hidden rounded-2xl border-2 border-dashed p-12
        transition-all duration-300 ease-out cursor-pointer
        ${
          isDragging
            ? "border-[#00C7BE] bg-[#00C7BE]/5 scale-[1.02]"
            : "border-gray-200 bg-gray-50 hover:border-[#00C7BE]/50 hover:bg-[#00C7BE]/5"
        }
        ${isUploading ? "pointer-events-none" : ""}
      `}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".goodnotes"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      {isUploading ? (
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full border-4 border-gray-200 border-t-[#00C7BE] animate-spin" />
          <p className="text-gray-600 text-lg">Processing files...</p>
          <div className="w-full max-w-xs h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#00C7BE] transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4">
          <div
            className={`
            w-20 h-20 rounded-full bg-[#00C7BE]/10
            flex items-center justify-center transition-transform duration-300
            ${isDragging ? "scale-110" : ""}
          `}
          >
            <svg
              className="w-10 h-10 text-[#00C7BE]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
          </div>
          <div className="text-center">
            <p className="text-xl font-medium text-gray-800">
              {isDragging
                ? "Drop your files here"
                : "Drop GoodNotes files here"}
            </p>
            <p className="text-gray-500 mt-2">or click to browse</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>Accepts .goodnotes files only</span>
          </div>
        </div>
      )}
    </div>
  );
}
