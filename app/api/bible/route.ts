import { NextRequest, NextResponse } from "next/server";

// Node runtime — más compatible y soporta bien fetch
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const translation = searchParams.get("translation") ?? "valera";
  const book        = searchParams.get("book")        ?? "19";
  const chapter     = searchParams.get("chapter")     ?? "23";
  const provider    = searchParams.get("provider")    ?? "getbible";

  try {
    let url: string;

    if (provider === "bibleapi") {
      const ref = searchParams.get("ref") ?? "psalms 23";
      url = `https://bible-api.com/${encodeURIComponent(ref)}?translation=${translation}`;
    } else {
      url = `https://api.getbible.net/v2/${translation}/${book}/${chapter}.json`;
    }

    const res = await fetch(url, {
      headers: { Accept: "application/json" },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `Error ${res.status} al obtener el capítulo` },
        { status: res.status }
      );
    }

    const data = await res.json();

    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=3600",
      },
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? "Error de conexión con la API bíblica" },
      { status: 500 }
    );
  }
}
