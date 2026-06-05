import { Song } from "@/types";
import { chordToNotation } from "@/lib/chords";
import { getTransposedSong } from "@/store/songs";

const SECTION_LABELS: Record<string, string> = {
  intro: "Intro", verse: "Verso", prechorus: "Pre-Coro", chorus: "Coro",
  bridge: "Puente", interlude: "Interludio", solo: "Solo", outro: "Final",
};

// ─── PDF export ─────────────────────────────────────────────────────────────

export async function exportToPdf(song: Song, semitones: number, notation: "american" | "solfege") {
  const { jsPDF } = await import("jspdf");
  const transposed = getTransposedSong(song, semitones);

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  const W = 210;
  const MARGIN = 18;
  const COL = W - MARGIN * 2;
  let y = MARGIN;

  const pageH = 297;
  function checkPage(needed: number) {
    if (y + needed > pageH - MARGIN) {
      doc.addPage();
      y = MARGIN;
    }
  }

  // ── Header ──
  doc.setFillColor(15, 10, 30);
  doc.rect(0, 0, W, 14, "F");

  // Logo image in header
  try {
    const res = await fetch("/adora-logo-pdf.png");
    const blob = await res.blob();
    const b64: string = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve((reader.result as string).split(",")[1]);
      reader.readAsDataURL(blob);
    });
    // Logo aspect ratio 400:230 — render at height 10mm → width ≈ 17.4mm
    doc.addImage(b64, "PNG", MARGIN, 2, 17.4, 10);
  } catch {
    // Fallback: text only
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.text("Adora", MARGIN, 9);
  }

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(156, 163, 175);
  doc.text("adorachords.app", W - MARGIN, 9, { align: "right" });

  y = 22;

  // ── Title ──
  doc.setTextColor(15, 23, 42);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text(song.title, MARGIN, y);
  y += 7;

  if (song.artist) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(100, 116, 139);
    doc.text(song.artist, MARGIN, y);
    y += 5;
  }

  // ── Meta pills ──
  y += 2;
  const meta = [
    `Tonalidad: ${transposed.key}${song.mode === "minor" ? "m" : ""}`,
    song.capo > 0 ? `Cejilla: ${song.capo}` : null,
    `${song.tempo} BPM`,
    song.timeSignature,
    semitones !== 0 ? `Transposición: ${semitones > 0 ? "+" : ""}${semitones}` : null,
  ].filter(Boolean) as string[];

  doc.setFontSize(8);
  let mx = MARGIN;
  for (const m of meta) {
    const tw = doc.getTextWidth(m) + 6;
    doc.setFillColor(241, 245, 249);
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(mx, y - 3.5, tw, 5.5, 1.5, 1.5, "FD");
    doc.setTextColor(71, 85, 105);
    doc.text(m, mx + 3, y);
    mx += tw + 3;
  }
  y += 8;

  // ── Divider ──
  doc.setDrawColor(226, 232, 240);
  doc.line(MARGIN, y, W - MARGIN, y);
  y += 6;

  // ── Sections ──
  const SECTION_COLORS: Record<string, [number, number, number]> = {
    intro: [56, 189, 248], verse: [148, 163, 184], prechorus: [251, 191, 36],
    chorus: [99, 102, 241], bridge: [251, 113, 133], outro: [148, 163, 184],
    solo: [52, 211, 153], interlude: [192, 132, 252],
  };

  for (const section of transposed.sections) {
    checkPage(16);

    // Section label
    const [r, g, b] = SECTION_COLORS[section.type] || [148, 163, 184];
    doc.setFillColor(r, g, b);
    doc.rect(MARGIN, y - 3, 2.5, 5, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(r, g, b);
    doc.text((SECTION_LABELS[section.type] || section.name).toUpperCase(), MARGIN + 5, y);
    y += 6;

    for (const line of section.lines) {
      checkPage(14);

      // Build chord row respecting pos (character offset above the lyric)
      if (line.chords.length > 0) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(99, 102, 241);

        const CHAR_PX = 1.85; // mm per character at font size 10
        const hasPos = line.chords.some((c) => c.pos !== undefined && c.pos > 0);

        if (hasPos && line.lyrics.trim()) {
          // Place each chord at its horizontal position above the lyric
          const sorted = [...line.chords].sort((a, b) => (a.pos ?? 0) - (b.pos ?? 0));
          for (const cp of sorted) {
            const x = MARGIN + (cp.pos ?? 0) * CHAR_PX;
            doc.text(chordToNotation(cp.chord, notation), Math.min(x, MARGIN + COL - 10), y);
          }
        } else {
          // No position data — fall back to joined string
          const chordStr = line.chords.map((c) => chordToNotation(c.chord, notation)).join("   ");
          doc.text(chordStr, MARGIN, y);
        }
        y += 5;
      }

      // Lyrics line
      if (line.lyrics.trim()) {
        doc.setFont("courier", "normal");
        doc.setFontSize(10);
        doc.setTextColor(15, 23, 42);
        const wrapped = doc.splitTextToSize(line.lyrics, COL);
        doc.text(wrapped, MARGIN, y);
        y += wrapped.length * 5.2;
      } else if (line.chords.length === 0) {
        y += 2; // spacing for empty lines
      }
    }

    y += 4; // gap between sections
  }

  // ── Footer ──
  const totalPages = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setDrawColor(236, 72, 153);
    doc.setLineWidth(0.3);
    doc.line(MARGIN, pageH - 12, W - MARGIN, pageH - 12);
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(236, 72, 153);
    doc.text("Adora", MARGIN, pageH - 7);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(148, 163, 184);
    doc.text(` — ${song.title}`, MARGIN + doc.getTextWidth("Adora"), pageH - 7);
    doc.text(`Página ${i} / ${totalPages}`, W - MARGIN, pageH - 7, { align: "right" });
  }

  doc.save(`${song.title.replace(/\s+/g, "_")}.pdf`);
}

// ─── Word export ─────────────────────────────────────────────────────────────

export async function exportToWord(song: Song, semitones: number, notation: "american" | "solfege") {
  const {
    Document, Packer, Paragraph, TextRun, HeadingLevel,
    AlignmentType, BorderStyle, ShadingType,
  } = await import("docx");

  const transposed = getTransposedSong(song, semitones);

  const children: any[] = [];

  // Title
  children.push(
    new Paragraph({
      children: [new TextRun({ text: song.title, bold: true, size: 40, color: "0f172a" })],
      spacing: { after: 80 },
    })
  );

  if (song.artist) {
    children.push(
      new Paragraph({
        children: [new TextRun({ text: song.artist, size: 22, color: "64748b" })],
        spacing: { after: 60 },
      })
    );
  }

  // Meta
  const metaParts = [
    `Tonalidad: ${transposed.key}${song.mode === "minor" ? "m" : ""}`,
    song.capo > 0 ? `Cejilla: ${song.capo}` : null,
    `${song.tempo} BPM`,
    semitones !== 0 ? `Transposición: ${semitones > 0 ? "+" : ""}${semitones}` : null,
  ].filter(Boolean) as string[];

  children.push(
    new Paragraph({
      children: [new TextRun({ text: metaParts.join("  •  "), size: 18, color: "475569", italics: true })],
      spacing: { after: 200 },
    })
  );

  // Sections
  for (const section of transposed.sections) {
    // Section header
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: (SECTION_LABELS[section.type] || section.name).toUpperCase(),
            bold: true,
            size: 18,
            color: "6366f1",
            allCaps: true,
          }),
        ],
        spacing: { before: 240, after: 80 },
        border: {
          bottom: { style: BorderStyle.SINGLE, size: 4, color: "e2e8f0" },
        },
      })
    );

    for (const line of section.lines) {
      // Chords — build string respecting pos if available
      if (line.chords.length > 0) {
        const sorted = [...line.chords].sort((a, b) => (a.pos ?? 0) - (b.pos ?? 0));
        const hasPos = sorted.some((c) => c.pos !== undefined && c.pos > 0);
        let chordText = "";
        if (hasPos && line.lyrics.trim()) {
          // Space-pad each chord to its character position
          let cursor = 0;
          for (const cp of sorted) {
            const pos = cp.pos ?? 0;
            const pad = Math.max(0, pos - cursor);
            chordText += " ".repeat(pad) + chordToNotation(cp.chord, notation);
            cursor = pos + chordToNotation(cp.chord, notation).length;
          }
        } else {
          chordText = sorted.map((c) => chordToNotation(c.chord, notation)).join("   ");
        }
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: chordText,
                bold: true,
                size: 20,
                color: "6366f1",
                font: "Courier New",
              }),
            ],
            spacing: { after: 20 },
          })
        );
      }

      // Lyrics
      if (line.lyrics.trim()) {
        children.push(
          new Paragraph({
            children: [new TextRun({ text: line.lyrics, size: 22, color: "0f172a" })],
            spacing: { after: 60 },
          })
        );
      }
    }
  }

  // Footer note
  children.push(
    new Paragraph({
      children: [new TextRun({ text: `Generado con Adora`, size: 16, color: "94a3b8", italics: true })],
      spacing: { before: 400 },
    })
  );

  const doc = new Document({
    sections: [{ children }],
    styles: {
      default: {
        document: {
          run: { font: "Calibri", size: 22 },
        },
      },
    },
  });

  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${song.title.replace(/\s+/g, "_")}.docx`;
  a.click();
  URL.revokeObjectURL(url);
}
