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

    if (file.name.toLowerCase().endsWith(".pdf")) {
      const { extractText } = await import("unpdf");
      const { text } = await extractText(new Uint8Array(buffer), { mergePages: false });
      // text is an array of strings (one per page) when mergePages is false
      const fullText = Array.isArray(text) ? text.join("\n\n") : String(text);
      return NextResponse.json({ text: fullText });
    }

    if (file.name.match(/\.docx?$/i)) {
      const mammoth = await import("mammoth");
      const result = await mammoth.extractRawText({ buffer });
      return NextResponse.json({ text: result.value });
    }

    if (file.name.toLowerCase().endsWith(".txt")) {
      return NextResponse.json({ text: buffer.toString("utf-8") });
    }

    return NextResponse.json({ error: "Formato no soportado. Usa PDF, Word o TXT." }, { status: 400 });
  } catch (err: any) {
    console.error("parse-pdf error:", err);
    return NextResponse.json({ error: err.message || "Error procesando el archivo" }, { status: 500 });
  }
}
