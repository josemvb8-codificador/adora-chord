import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    if (file.name.endsWith(".pdf")) {
      // Dynamically import pdf-parse (Node.js only)
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const pdfParse = require("pdf-parse");
      const data = await pdfParse(buffer);
      return NextResponse.json({ text: data.text });
    }

    if (file.name.match(/\.docx?$/i)) {
      const mammoth = await import("mammoth");
      const result = await mammoth.extractRawText({ buffer });
      return NextResponse.json({ text: result.value });
    }

    if (file.name.endsWith(".txt")) {
      return NextResponse.json({ text: buffer.toString("utf-8") });
    }

    return NextResponse.json({ error: "Formato no soportado" }, { status: 400 });
  } catch (err: any) {
    console.error("parse-pdf error:", err);
    return NextResponse.json({ error: err.message || "Error procesando archivo" }, { status: 500 });
  }
}
