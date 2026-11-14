import JSZip from "jszip";

const MIN_AUDIO_SIZE = 1024 * 1024;
export type ExtractionStage = "reading" | "extracting" | "packaging";

export interface ExtractionProgress {
  stage: ExtractionStage;
  percent: number;
  detail: string;
}
export interface ClientExtractionResult {
  sessionId: string;
  totalFiles: number;
  extractedAudios: number;
  audioFiles: string[];
  zipBlob: Blob;
}

export async function extractAudioInBrowser(
  files: File[],
  report: (progress: ExtractionProgress) => void,
): Promise<ClientExtractionResult> {
  if (!files.length) throw new Error("Select at least one .goodnotes file.");

  const outputZip = new JSZip();
  const audioFiles: string[] = [];
  const usedNames = new Set<string>();
  for (const [fileIndex, sourceFile] of files.entries()) {
    const label = "File " + (fileIndex + 1) + "/" + files.length +
      ": " + sourceFile.name;
    report({
      stage: "reading",
      percent: Math.round(5 + (70 * fileIndex) / files.length),
      detail: label,
    });

    let zip: JSZip;
    try {
      zip = await JSZip.loadAsync(await sourceFile.arrayBuffer());
    } catch {
      throw new Error("Cannot read " + sourceFile.name +
        ". Check that it is a valid GoodNotes export.");
    }
    const entries = Object.entries(zip.files)
      .filter(([name, entry]) => name.startsWith("attachments/") && !entry.dir)
      .sort(([a], [b]) => a.localeCompare(b));

    let audioIndex = 0;
    for (const [entryIndex, [, entry]] of entries.entries()) {
      const update = (percent: number) => report({
        stage: "extracting",
        percent: Math.min(75, Math.round(5 + 70 *
          (fileIndex + (entryIndex + percent / 100) / entries.length) / files.length)),
        detail: label + " — attachment " + (entryIndex + 1) +
          "/" + entries.length,
      });
      update(0);
      const bytes = await entry.async("uint8array", (meta) => update(meta.percent));
      // Keep the original heuristic: attachments over 1 MB are recordings.
      if (bytes.byteLength <= MIN_AUDIO_SIZE) continue;

      audioIndex++;
      const basename = sourceFile.name.replace(/\.goodnotes$/i, "")
        .replace(/[<>:"/\\|?*\x00-\x1f]/g, "_");
      const stem = basename + "_Audio_" + audioIndex;
      let filename = stem + ".mp4";
      let suffix = 2;
      while (usedNames.has(filename.toLowerCase())) {
        filename = stem + "_" + suffix++ + ".mp4";
      }
      usedNames.add(filename.toLowerCase());
      outputZip.file(filename, bytes, { binary: true, compression: "STORE" });
      audioFiles.push(filename);
    }
    report({
      stage: "extracting",
      percent: Math.round(5 + (70 * (fileIndex + 1)) / files.length),
      detail: label + " — scanned " + entries.length + " attachments",
    });
  }

  report({ stage: "packaging", percent: 75, detail: "Creating ZIP…" });
  // MP4 is already compressed; STORE saves browser CPU.
  const zipBlob = await outputZip.generateAsync(
    { type: "blob", compression: "STORE", streamFiles: true },
    (meta) => report({
      stage: "packaging",
      percent: Math.min(99, Math.round(75 + meta.percent * 0.24)),
      detail: meta.currentFile
        ? "Adding " + meta.currentFile : "Finishing ZIP…",
    }),
  );

  return {
    sessionId: crypto.randomUUID(),
    totalFiles: files.length,
    extractedAudios: audioFiles.length,
    audioFiles,
    zipBlob,
  };
}
