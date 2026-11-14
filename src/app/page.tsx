"use client";

import { useState } from "react";
import UploadZone from "@/components/UploadZone";
import type { ClientExtractionResult } from "@/lib/client-extractor";

export default function Home() {
  const [result, setResult] = useState<ClientExtractionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleUploadComplete = (uploadResult: ClientExtractionResult) => {
    setResult(uploadResult);
    setError(null);
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
    setResult(null);
  };

  const handleDownload = () => {
    if (!result || result.extractedAudios === 0) return;
    setIsDownloading(true);
    try {
      const url = URL.createObjectURL(result.zipBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "goodnotes_audio_" + result.sessionId.slice(0, 8) + ".zip";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch {
      setError("Could not start the download. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#F5F5F7]">
      {/* Subtle background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#00C7BE]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#FFB340]/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-16">
        {/* Header */}
        <header className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-[#00C7BE] flex items-center justify-center shadow-lg shadow-[#00C7BE]/20">
              <svg
                className="w-8 h-8 text-white"
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
            <h1 className="text-4xl font-bold text-gray-900">
              GoodNotes Audio Extractor
            </h1>
          </div>
          <p className="text-gray-600 text-lg max-w-xl mx-auto">
            Extract audio recordings from your GoodNotes files and download them
            as a ZIP archive
          </p>
        </header>

        {/* Main content */}
        <main className="max-w-2xl mx-auto">
          {/* Clean card */}
          <div className="bg-white rounded-3xl p-8 shadow-xl shadow-gray-200/50 border border-gray-100">
            {!result ? (
              <>
                <UploadZone
                  onUploadComplete={handleUploadComplete}
                  onError={handleError}
                />

                {error && (
                  <div className="mt-6 p-4 rounded-2xl bg-red-50 border border-red-100 text-red-600 flex items-center gap-3">
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
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#34C759]/10 flex items-center justify-center">
                  <svg
                    className="w-10 h-10 text-[#34C759]"
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
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                  Extraction Complete!
                </h2>
                <p className="text-gray-600 mb-6">
                  Found{" "}
                  <span className="text-[#00C7BE] font-semibold">
                    {result.extractedAudios}
                  </span>{" "}
                  audio file{result.extractedAudios !== 1 ? "s" : ""} from{" "}
                  <span className="text-[#FFB340] font-semibold">
                    {result.totalFiles}
                  </span>{" "}
                  GoodNotes file{result.totalFiles !== 1 ? "s" : ""}
                </p>

                {/* Audio file list */}
                {result.audioFiles.length > 0 && (
                  <div className="mb-6 max-h-40 overflow-y-auto rounded-2xl bg-gray-50 p-4 border border-gray-100">
                    <ul className="space-y-2 text-left">
                      {result.audioFiles.map((file, index) => (
                        <li
                          key={index}
                          className="flex items-center gap-2 text-gray-700 text-sm"
                        >
                          <svg
                            className="w-4 h-4 text-[#00C7BE] flex-shrink-0"
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
                      px-8 py-3 rounded-2xl font-medium transition-all duration-200
                      ${
                        result.extractedAudios === 0
                          ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                          : "bg-[#00C7BE] text-white hover:bg-[#00B3AB] hover:shadow-lg hover:shadow-[#00C7BE]/30 hover:scale-105 active:scale-95"
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
                    className="px-6 py-3 rounded-2xl font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-all duration-200"
                  >
                    Extract More
                  </button>
                </div>

                {result.extractedAudios === 0 && (
                  <p className="mt-4 text-[#FFB340] text-sm">
                    No audio files found in the uploaded GoodNotes files.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Footer info */}
          <div className="mt-8 text-center text-gray-500 text-sm">
            <p>
              Files are processed in your browser, never uploaded to the server.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
