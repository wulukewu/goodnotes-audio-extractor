import JSZip from "jszip";
import { v4 as uuidv4 } from "uuid";
import * as fs from "fs/promises";
import * as path from "path";

const UPLOADS_DIR = path.join(process.cwd(), "uploads");
const OUTPUT_DIR = path.join(process.cwd(), "output");

// Minimum file size to consider as audio (1MB)
const MIN_AUDIO_SIZE = 1024 * 1024;

export interface ExtractionResult {
  sessionId: string;
  totalFiles: number;
  extractedAudios: number;
  zipPath: string;
  audioFiles: string[];
}

/**
 * Ensures required directories exist
 */
export async function ensureDirectories(): Promise<void> {
  await fs.mkdir(UPLOADS_DIR, { recursive: true });
  await fs.mkdir(OUTPUT_DIR, { recursive: true });
}

/**
 * Extracts audio files from a GoodNotes file
 * GoodNotes files are ZIP archives containing an 'attachments' folder with audio files
 */
export async function extractAudioFromGoodnotes(
  fileBuffer: Buffer,
  fileName: string,
): Promise<ExtractionResult> {
  const sessionId = uuidv4();
  const sessionDir = path.join(OUTPUT_DIR, sessionId);
  await fs.mkdir(sessionDir, { recursive: true });

  const audioFiles: string[] = [];
  let audioCount = 0;

  try {
    // Load the GoodNotes file as a ZIP
    const zip = await JSZip.loadAsync(fileBuffer);

    // Find all files in the attachments folder
    const attachmentFiles: { name: string; file: JSZip.JSZipObject }[] = [];

    zip.forEach((relativePath, file) => {
      if (relativePath.startsWith("attachments/") && !file.dir) {
        attachmentFiles.push({ name: relativePath, file });
      }
    });

    // Filter and extract audio files (files > 1MB are likely audio)
    for (const { name, file } of attachmentFiles) {
      const content = await file.async("nodebuffer");

      if (content.length > MIN_AUDIO_SIZE) {
        audioCount++;
        const baseName = path.basename(fileName, ".goodnotes");
        const newFileName = `${baseName}_Audio_${audioCount}.mp4`;
        const outputPath = path.join(sessionDir, newFileName);

        await fs.writeFile(outputPath, content);
        audioFiles.push(newFileName);
      }
    }

    // Create a ZIP file with all extracted audio files
    const outputZip = new JSZip();

    for (const audioFile of audioFiles) {
      const audioPath = path.join(sessionDir, audioFile);
      const audioContent = await fs.readFile(audioPath);
      outputZip.file(audioFile, audioContent);
    }

    const zipContent = await outputZip.generateAsync({ type: "nodebuffer" });
    const zipPath = path.join(sessionDir, "extracted_audio.zip");
    await fs.writeFile(zipPath, zipContent);

    return {
      sessionId,
      totalFiles: 1,
      extractedAudios: audioCount,
      zipPath,
      audioFiles,
    };
  } catch (error) {
    // Clean up on error
    try {
      await fs.rm(sessionDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
    throw error;
  }
}

/**
 * Extracts audio from multiple GoodNotes files
 */
export async function extractAudioFromMultipleFiles(
  files: { buffer: Buffer; name: string }[],
): Promise<ExtractionResult> {
  const sessionId = uuidv4();
  const sessionDir = path.join(OUTPUT_DIR, sessionId);
  await fs.mkdir(sessionDir, { recursive: true });

  const allAudioFiles: string[] = [];
  let totalAudioCount = 0;

  try {
    for (const { buffer, name } of files) {
      const zip = await JSZip.loadAsync(buffer);

      const attachmentFiles: { name: string; file: JSZip.JSZipObject }[] = [];

      zip.forEach((relativePath, file) => {
        if (relativePath.startsWith("attachments/") && !file.dir) {
          attachmentFiles.push({ name: relativePath, file });
        }
      });

      // Sort by file name to maintain order
      attachmentFiles.sort((a, b) => a.name.localeCompare(b.name));

      let fileAudioCount = 0;
      for (const { file } of attachmentFiles) {
        const content = await file.async("nodebuffer");

        if (content.length > MIN_AUDIO_SIZE) {
          fileAudioCount++;
          totalAudioCount++;
          const baseName = path.basename(name, ".goodnotes");
          const newFileName = `${baseName}_Audio_${fileAudioCount}.mp4`;
          const outputPath = path.join(sessionDir, newFileName);

          await fs.writeFile(outputPath, content);
          allAudioFiles.push(newFileName);
        }
      }
    }

    // Create a ZIP file with all extracted audio files
    const outputZip = new JSZip();

    for (const audioFile of allAudioFiles) {
      const audioPath = path.join(sessionDir, audioFile);
      const audioContent = await fs.readFile(audioPath);
      outputZip.file(audioFile, audioContent);
    }

    const zipContent = await outputZip.generateAsync({ type: "nodebuffer" });
    const zipPath = path.join(sessionDir, "extracted_audio.zip");
    await fs.writeFile(zipPath, zipContent);

    return {
      sessionId,
      totalFiles: files.length,
      extractedAudios: totalAudioCount,
      zipPath,
      audioFiles: allAudioFiles,
    };
  } catch (error) {
    try {
      await fs.rm(sessionDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
    throw error;
  }
}

/**
 * Gets the path to the ZIP file for a session
 */
export function getZipPath(sessionId: string): string {
  return path.join(OUTPUT_DIR, sessionId, "extracted_audio.zip");
}

/**
 * Cleans up a session's files
 */
export async function cleanupSession(sessionId: string): Promise<void> {
  const sessionDir = path.join(OUTPUT_DIR, sessionId);
  await fs.rm(sessionDir, { recursive: true, force: true });
}
