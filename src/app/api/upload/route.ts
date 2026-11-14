import { NextResponse } from "next/server";
// The UI no longer uploads documents. Do not buffer legacy requests on Render.
export async function POST() {
  return NextResponse.json(
    { error: "Server uploads are discontinued. Use the homepage for local extraction." },
    { status: 410 },
  );
}
