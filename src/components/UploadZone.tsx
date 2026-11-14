"use client";

import { useState, useCallback, useRef } from "react";
import {
  extractAudioInBrowser,
  type ClientExtractionResult,
  type ExtractionProgress,
} from "@/lib/client-extractor";

interface UploadZoneProps {
  onUploadComplete: (result: ClientExtractionResult) => void;
  onError: (error: string) => void;
}
const STAGES: Record<ExtractionProgress["stage"], string> = {
  reading: "Opening GoodNotes document…",
  extracting: "Finding and extracting recordings…",
  packaging: "Preparing download ZIP…",
};

export default function UploadZone({ onUploadComplete, onError }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [largeFile, setLargeFile] = useState(false);
  const [progress, setProgress] = useState<ExtractionProgress>({
    stage: "reading", percent: 0, detail: "",
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const busyRef = useRef(false);

  const processFiles = useCallback(async (selection: FileList | File[]) => {
    if (busyRef.current) return;
    const files = Array.from(selection);
    if (!files.length || files.some(
      (file) => !file.name.toLowerCase().endsWith(".goodnotes"),
    )) {
      onError("Please select .goodnotes files only.");
      return;
    }

    busyRef.current = true;
    setIsProcessing(true);
    setLargeFile(files.some((file) => file.size >= 200 * 1024 * 1024));
    setProgress({ stage: "reading", percent: 0, detail: "Starting local extraction…" });
    try {
      const result = await extractAudioInBrowser(files, setProgress);
      onUploadComplete(result);
    } catch (error) {
      console.error("Local extraction failed:", error);
      onError((error instanceof Error ? error.message : "Processing failed.") +
        " If the file is large, try one at a time or use a browser with more available memory.");
    } finally {
      busyRef.current = false;
      setIsProcessing(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }, [onUploadComplete, onError]);

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
    void processFiles(event.dataTransfer.files);
  }, [processFiles]);

  return (
    <div
      onClick={() => { if (!isProcessing) fileInputRef.current?.click(); }}
      onDragOver={(event) => { event.preventDefault(); setIsDragging(true); }}
      onDragLeave={(event) => { event.preventDefault(); setIsDragging(false); }}
      onDrop={handleDrop}
      className={
        "relative overflow-hidden rounded-2xl border-2 border-dashed p-12 " +
        "transition-all duration-300 ease-out " +
        (isDragging
          ? "border-[#00C7BE] bg-[#00C7BE]/5 "
          : "border-gray-200 bg-gray-50 hover:border-[#00C7BE]/50 ") +
        (isProcessing ? "cursor-wait" : "cursor-pointer")
      }
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".goodnotes"
        multiple
        disabled={isProcessing}
        onChange={(event) => {
          if (event.target.files) void processFiles(event.target.files);
        }}
        className="hidden"
      />
      {isProcessing ? (
        <div className="flex flex-col items-center gap-4" aria-live="polite">
          <div className="w-16 h-16 rounded-full border-4 border-gray-200 border-t-[#00C7BE] animate-spin" />
          <p className="text-gray-700 text-lg font-medium text-center">
            {STAGES[progress.stage]}
          </p>
          <p className="text-gray-500 text-sm text-center break-all">
            {progress.detail}
          </p>
          <div
            className="w-full max-w-xs h-2 bg-gray-200 rounded-full overflow-hidden"
            role="progressbar"
            aria-label="Extraction progress"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progress.percent}
          >
            <div
              className="h-full bg-[#00C7BE] transition-all duration-150"
              style={{ width: progress.percent + "%" }}
            />
          </div>
          <p className="text-gray-600 text-sm tabular-nums">{progress.percent}%</p>
          {largeFile && (
            <p className="text-amber-700 text-xs text-center">
              Large file: local processing may require significant browser memory.
            </p>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-[#00C7BE]/10 flex items-center justify-center">
            <svg className="w-10 h-10 text-[#00C7BE]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01.88-7.903A5 5 0 0115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <div className="text-center">
            <p className="text-xl font-medium text-gray-800">
              {isDragging ? "Drop files here" : "Drop GoodNotes files here"}
            </p>
            <p className="text-gray-500 mt-2">or click to browse</p>
          </div>
          <p className="text-sm text-gray-500 text-center">
            .goodnotes files only · Processed in your browser · No upload
          </p>
        </div>
      )}
    </div>
  );
}
