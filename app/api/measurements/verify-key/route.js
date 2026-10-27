import { NextResponse } from "next/server";

// Protected by the same middleware as measurement writes; no data is changed.
export async function POST() {
  return NextResponse.json({ verified: true }, {
    headers: { "Cache-Control": "no-store" },
  });
}
