"use client";

import { useState } from "react";
import UploadZone from "@/components/UploadZone";

interface UploadResult {
  sessionId: string;
  totalFiles: number;
  extractedAudios: number;
  audioFiles: string[];
}

export default function Home() {
  const [result, setResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleUploadComplete = (uploadResult: UploadResult) => {
    setResult(uploadResult);
    setError(null);
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
    setResult(null);
  };

  const handleDownload = async () => {
    if (!result) return;

    setIsDownloading(true);
    try {
      const response = await fetch(`/api/download/${result.sessionId}`);

      if (!response.ok) {
        throw new Error("Download failed");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `goodnotes_audio_${result.sessionId.slice(0, 8)}.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch {
      setError("Failed to download file");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-16">
        {/* Header */}
        <header className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
              <svg
                className="w-7 h-7 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                />
              </svg>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              GoodNotes Audio Extractor
            </h1>
          </div>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            Extract audio recordings from your GoodNotes files and download them
            as a ZIP archive
          </p>
        </header>

        {/* Main content */}
        <main className="max-w-2xl mx-auto">
          {/* Glassmorphism card */}
          <div className="backdrop-blur-xl bg-white/5 rounded-3xl p-8 shadow-2xl border border-white/10">
            {!result ? (
              <>
                <UploadZone
                  onUploadComplete={handleUploadComplete}
                  onError={handleError}
                />

                {error && (
                  <div className="mt-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 flex items-center gap-3">
                    <svg
                      className="w-5 h-5 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span>{error}</span>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center">
                {/* Success icon */}
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center">
                  <svg
                    className="w-10 h-10 text-green-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>

                {/* Stats */}
                <h2 className="text-2xl font-semibold text-white mb-2">
                  Extraction Complete!
                </h2>
                <p className="text-gray-400 mb-6">
                  Found{" "}
                  <span className="text-blue-400 font-semibold">
                    {result.extractedAudios}
                  </span>{" "}
                  audio file{result.extractedAudios !== 1 ? "s" : ""} from{" "}
                  <span className="text-purple-400 font-semibold">
                    {result.totalFiles}
                  </span>{" "}
                  GoodNotes file{result.totalFiles !== 1 ? "s" : ""}
                </p>

                {/* Audio file list */}
                {result.audioFiles.length > 0 && (
                  <div className="mb-6 max-h-40 overflow-y-auto rounded-xl bg-gray-800/50 p-4">
                    <ul className="space-y-2 text-left">
                      {result.audioFiles.map((file, index) => (
                        <li
                          key={index}
                          className="flex items-center gap-2 text-gray-300 text-sm"
                        >
                          <svg
                            className="w-4 h-4 text-blue-400 flex-shrink-0"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                            />
                          </svg>
                          <span className="truncate">{file}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex gap-4 justify-center">
                  <button
                    onClick={handleDownload}
                    disabled={isDownloading || result.extractedAudios === 0}
                    className={`
                      px-8 py-3 rounded-xl font-medium transition-all duration-200
                      ${
                        result.extractedAudios === 0
                          ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                          : "bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-lg hover:shadow-purple-500/30 hover:scale-105 active:scale-95"
                      }
                      ${isDownloading ? "opacity-50 cursor-wait" : ""}
                    `}
                  >
                    {isDownloading ? (
                      <span className="flex items-center gap-2">
                        <svg
                          className="w-5 h-5 animate-spin"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                          />
                        </svg>
                        Downloading...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                          />
                        </svg>
                        Download ZIP
                      </span>
                    )}
                  </button>

                  <button
                    onClick={handleReset}
                    className="px-6 py-3 rounded-xl font-medium text-gray-300 bg-gray-700/50 hover:bg-gray-700 transition-all duration-200"
                  >
                    Extract More
                  </button>
                </div>

                {result.extractedAudios === 0 && (
                  <p className="mt-4 text-yellow-400/80 text-sm">
                    No audio files found in the uploaded GoodNotes files.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Footer info */}
          <div className="mt-8 text-center text-gray-500 text-sm">
            <p>
              Files are processed locally and automatically deleted after
              download.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
