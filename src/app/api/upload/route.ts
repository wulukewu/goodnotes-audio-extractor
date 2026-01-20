import { NextRequest, NextResponse } from "next/server";
import {
  extractAudioFromMultipleFiles,
  ensureDirectories,
} from "@/lib/extractor";

export async function POST(request: NextRequest) {
  try {
    await ensureDirectories();

    const formData = await request.formData();
    const files: { buffer: Buffer; name: string }[] = [];

    // Get all uploaded files
    const entries = formData.getAll("files");

    for (const entry of entries) {
      if (entry instanceof File) {
        // Validate file extension
        if (!entry.name.endsWith(".goodnotes")) {
          return NextResponse.json(
            {
              error: `Invalid file type: ${entry.name}. Only .goodnotes files are allowed.`,
            },
            { status: 400 },
          );
        }

        const buffer = Buffer.from(await entry.arrayBuffer());
        files.push({ buffer, name: entry.name });
      }
    }

    if (files.length === 0) {
      return NextResponse.json({ error: "No files uploaded" }, { status: 400 });
    }

    // Extract audio from all files
    const result = await extractAudioFromMultipleFiles(files);

    return NextResponse.json({
      success: true,
      sessionId: result.sessionId,
      totalFiles: result.totalFiles,
      extractedAudios: result.extractedAudios,
      audioFiles: result.audioFiles,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to process files",
      },
      { status: 500 },
    );
  }
}
