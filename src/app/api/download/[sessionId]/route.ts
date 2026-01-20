import { NextRequest, NextResponse } from "next/server";
import { getZipPath, cleanupSession } from "@/lib/extractor";
import * as fs from "fs/promises";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> },
) {
  try {
    const { sessionId } = await params;

    // Validate sessionId format (UUID)
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(sessionId)) {
      return NextResponse.json(
        { error: "Invalid session ID" },
        { status: 400 },
      );
    }

    const zipPath = getZipPath(sessionId);

    try {
      const zipContent = await fs.readFile(zipPath);

      // Schedule cleanup after a delay (5 minutes)
      setTimeout(
        async () => {
          try {
            await cleanupSession(sessionId);
          } catch {
            // Ignore cleanup errors
          }
        },
        5 * 60 * 1000,
      );

      return new NextResponse(zipContent, {
        headers: {
          "Content-Type": "application/zip",
          "Content-Disposition": `attachment; filename="goodnotes_audio_${sessionId.slice(0, 8)}.zip"`,
        },
      });
    } catch {
      return NextResponse.json(
        { error: "Download not found or expired" },
        { status: 404 },
      );
    }
  } catch (error) {
    console.error("Download error:", error);
    return NextResponse.json(
      { error: "Failed to download file" },
      { status: 500 },
    );
  }
}
