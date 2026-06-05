import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const translation = searchParams.get("translation");
  const book        = searchParams.get("book");
  const chapter     = searchParams.get("chapter");
  const provider    = searchParams.get("provider") ?? "getbible";

  try {
    let url: string;
    if (provider === "bibleapi") {
      const ref = searchParams.get("ref") ?? "";
      url = `https://bible-api.com/${encodeURIComponent(ref)}?translation=${translation}`;
    } else {
      url = `https://api.getbible.net/v2/${translation}/${book}/${chapter}.json`;
    }

    const res = await fetch(url, {
      headers: { "Accept": "application/json" },
      cache: "force-cache",
    });

    if (!res.ok) {
      return NextResponse.json({ error: `API error ${res.status}` }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data, {
      headers: { "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=3600" },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? "Error desconocido" }, { status: 500 });
  }
}
