import { NextResponse } from "next/server";
// Downloads are now Blob URLs generated in the visitor's browser.
export async function GET() {
  return NextResponse.json(
    { error: "Server downloads are discontinued. Use the homepage." },
    { status: 410 },
  );
}
