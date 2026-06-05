"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { X, BookOpen, Loader2, Search, ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";

// ── Book data (self-contained) ─────────────────────────────────────────────
interface BookMeta { es: string; en: string; num: number; chapters: number; abbrevs: string[]; testament: "OT"|"NT"; }

const BOOKS: BookMeta[] = [
  { es:"Génesis",         en:"Genesis",         num:1,  chapters:50,  abbrevs:["gn","gen","gén"],              testament:"OT" },
  { es:"Éxodo",           en:"Exodus",          num:2,  chapters:40,  abbrevs:["ex","éx"],                     testament:"OT" },
  { es:"Levítico",        en:"Leviticus",       num:3,  chapters:27,  abbrevs:["lv","lev"],                    testament:"OT" },
  { es:"Números",         en:"Numbers",         num:4,  chapters:36,  abbrevs:["nm","num"],                    testament:"OT" },
  { es:"Deuteronomio",    en:"Deuteronomy",     num:5,  chapters:34,  abbrevs:["dt","deu"],                    testament:"OT" },
  { es:"Josué",           en:"Joshua",          num:6,  chapters:24,  abbrevs:["jos"],                         testament:"OT" },
  { es:"Jueces",          en:"Judges",          num:7,  chapters:21,  abbrevs:["jue"],                         testament:"OT" },
  { es:"Rut",             en:"Ruth",            num:8,  chapters:4,   abbrevs:["rt","rut"],                    testament:"OT" },
  { es:"1 Samuel",        en:"1 Samuel",        num:9,  chapters:31,  abbrevs:["1s","1sam"],                   testament:"OT" },
  { es:"2 Samuel",        en:"2 Samuel",        num:10, chapters:24,  abbrevs:["2s","2sam"],                   testament:"OT" },
  { es:"1 Reyes",         en:"1 Kings",         num:11, chapters:22,  abbrevs:["1r","1re"],                    testament:"OT" },
  { es:"2 Reyes",         en:"2 Kings",         num:12, chapters:25,  abbrevs:["2r","2re"],                    testament:"OT" },
  { es:"1 Crónicas",      en:"1 Chronicles",    num:13, chapters:29,  abbrevs:["1cr"],                         testament:"OT" },
  { es:"2 Crónicas",      en:"2 Chronicles",    num:14, chapters:36,  abbrevs:["2cr"],                         testament:"OT" },
  { es:"Esdras",          en:"Ezra",            num:15, chapters:10,  abbrevs:["esd","esr"],                   testament:"OT" },
  { es:"Nehemías",        en:"Nehemiah",        num:16, chapters:13,  abbrevs:["neh"],                         testament:"OT" },
  { es:"Ester",           en:"Esther",          num:17, chapters:10,  abbrevs:["est"],                         testament:"OT" },
  { es:"Job",             en:"Job",             num:18, chapters:42,  abbrevs:["job"],                         testament:"OT" },
  { es:"Salmos",          en:"Psalms",          num:19, chapters:150, abbrevs:["sal","ps","sal","salm"],        testament:"OT" },
  { es:"Proverbios",      en:"Proverbs",        num:20, chapters:31,  abbrevs:["pr","prov"],                   testament:"OT" },
  { es:"Eclesiastés",     en:"Ecclesiastes",    num:21, chapters:12,  abbrevs:["ec","ecl"],                    testament:"OT" },
  { es:"Cantares",        en:"Song of Solomon", num:22, chapters:8,   abbrevs:["cnt","can"],                   testament:"OT" },
  { es:"Isaías",          en:"Isaiah",          num:23, chapters:66,  abbrevs:["is","isa"],                    testament:"OT" },
  { es:"Jeremías",        en:"Jeremiah",        num:24, chapters:52,  abbrevs:["jr","jer"],                    testament:"OT" },
  { es:"Lamentaciones",   en:"Lamentations",    num:25, chapters:5,   abbrevs:["lm","lam"],                    testament:"OT" },
  { es:"Ezequiel",        en:"Ezekiel",         num:26, chapters:48,  abbrevs:["ez","eze"],                    testament:"OT" },
  { es:"Daniel",          en:"Daniel",          num:27, chapters:12,  abbrevs:["dn","dan"],                    testament:"OT" },
  { es:"Oseas",           en:"Hosea",           num:28, chapters:14,  abbrevs:["os"],                          testament:"OT" },
  { es:"Joel",            en:"Joel",            num:29, chapters:3,   abbrevs:["jl","joel"],                   testament:"OT" },
  { es:"Amós",            en:"Amos",            num:30, chapters:9,   abbrevs:["am"],                          testament:"OT" },
  { es:"Abdías",          en:"Obadiah",         num:31, chapters:1,   abbrevs:["abd"],                         testament:"OT" },
  { es:"Jonás",           en:"Jonah",           num:32, chapters:4,   abbrevs:["jon"],                         testament:"OT" },
  { es:"Miqueas",         en:"Micah",           num:33, chapters:7,   abbrevs:["mi"],                          testament:"OT" },
  { es:"Nahúm",           en:"Nahum",           num:34, chapters:3,   abbrevs:["nah"],                         testament:"OT" },
  { es:"Habacuc",         en:"Habakkuk",        num:35, chapters:3,   abbrevs:["hab"],                         testament:"OT" },
  { es:"Sofonías",        en:"Zephaniah",       num:36, chapters:3,   abbrevs:["sof"],                         testament:"OT" },
  { es:"Hageo",           en:"Haggai",          num:37, chapters:2,   abbrevs:["hag"],                         testament:"OT" },
  { es:"Zacarías",        en:"Zechariah",       num:38, chapters:14,  abbrevs:["zac"],                         testament:"OT" },
  { es:"Malaquías",       en:"Malachi",         num:39, chapters:4,   abbrevs:["mal"],                         testament:"OT" },
  { es:"Mateo",           en:"Matthew",         num:40, chapters:28,  abbrevs:["mt","mat"],                    testament:"NT" },
  { es:"Marcos",          en:"Mark",            num:41, chapters:16,  abbrevs:["mr","marc"],                   testament:"NT" },
  { es:"Lucas",           en:"Luke",            num:42, chapters:24,  abbrevs:["lc","luc"],                    testament:"NT" },
  { es:"Juan",            en:"John",            num:43, chapters:21,  abbrevs:["jn","juan"],                   testament:"NT" },
  { es:"Hechos",          en:"Acts",            num:44, chapters:28,  abbrevs:["hch","hec"],                   testament:"NT" },
  { es:"Romanos",         en:"Romans",          num:45, chapters:16,  abbrevs:["ro","rom"],                    testament:"NT" },
  { es:"1 Corintios",     en:"1 Corinthians",   num:46, chapters:16,  abbrevs:["1co","1cor"],                  testament:"NT" },
  { es:"2 Corintios",     en:"2 Corinthians",   num:47, chapters:13,  abbrevs:["2co","2cor"],                  testament:"NT" },
  { es:"Gálatas",         en:"Galatians",       num:48, chapters:6,   abbrevs:["gá","gal"],                    testament:"NT" },
  { es:"Efesios",         en:"Ephesians",       num:49, chapters:6,   abbrevs:["ef","efe"],                    testament:"NT" },
  { es:"Filipenses",      en:"Philippians",     num:50, chapters:4,   abbrevs:["fil"],                         testament:"NT" },
  { es:"Colosenses",      en:"Colossians",      num:51, chapters:4,   abbrevs:["col"],                         testament:"NT" },
  { es:"1 Tesalonicenses",en:"1 Thessalonians", num:52, chapters:5,   abbrevs:["1ts","1tes"],                  testament:"NT" },
  { es:"2 Tesalonicenses",en:"2 Thessalonians", num:53, chapters:3,   abbrevs:["2ts","2tes"],                  testament:"NT" },
  { es:"1 Timoteo",       en:"1 Timothy",       num:54, chapters:6,   abbrevs:["1ti","1tim"],                  testament:"NT" },
  { es:"2 Timoteo",       en:"2 Timothy",       num:55, chapters:4,   abbrevs:["2ti","2tim"],                  testament:"NT" },
  { es:"Tito",            en:"Titus",           num:56, chapters:3,   abbrevs:["tit"],                         testament:"NT" },
  { es:"Filemón",         en:"Philemon",        num:57, chapters:1,   abbrevs:["flm"],                         testament:"NT" },
  { es:"Hebreos",         en:"Hebrews",         num:58, chapters:13,  abbrevs:["heb"],                         testament:"NT" },
  { es:"Santiago",        en:"James",           num:59, chapters:5,   abbrevs:["stg","san"],                   testament:"NT" },
  { es:"1 Pedro",         en:"1 Peter",         num:60, chapters:5,   abbrevs:["1p","1pe"],                    testament:"NT" },
  { es:"2 Pedro",         en:"2 Peter",         num:61, chapters:3,   abbrevs:["2p","2pe"],                    testament:"NT" },
  { es:"1 Juan",          en:"1 John",          num:62, chapters:5,   abbrevs:["1jn"],                         testament:"NT" },
  { es:"2 Juan",          en:"2 John",          num:63, chapters:1,   abbrevs:["2jn"],                         testament:"NT" },
  { es:"3 Juan",          en:"3 John",          num:64, chapters:1,   abbrevs:["3jn"],                         testament:"NT" },
  { es:"Judas",           en:"Jude",            num:65, chapters:1,   abbrevs:["jud"],                         testament:"NT" },
  { es:"Apocalipsis",     en:"Revelation",      num:66, chapters:22,  abbrevs:["ap","apo","rev"],              testament:"NT" },
];

// ── Versions ──────────────────────────────────────────────────────────────
interface Version { id: string; label: string; lang: "es"|"en"; src: "github"|"getbible"; key: string; }
const VERSIONS: Version[] = [
  { id:"rvr",     label:"RVR (Reina Valera)",   lang:"es", src:"github",   key:"es_rvr"      },
  { id:"valera",  label:"RV 1909",              lang:"es", src:"getbible", key:"valera"      },
  { id:"sse",     label:"Sagradas Escrituras",  lang:"es", src:"getbible", key:"sse"         },
  { id:"kjv",     label:"KJV",                  lang:"en", src:"github",   key:"en_kjv"      },
  { id:"bbe",     label:"BBE",                  lang:"en", src:"github",   key:"en_bbe"      },
  { id:"asv",     label:"ASV 1901",             lang:"en", src:"getbible", key:"asv"         },
  { id:"web",     label:"WEB",                  lang:"en", src:"getbible", key:"web"         },
  { id:"ylt",     label:"Young's Literal",      lang:"en", src:"getbible", key:"ylt"         },
  { id:"akjv",    label:"American KJV",         lang:"en", src:"getbible", key:"akjv"        },
];

// ── Module-level Bible cache (persists across renders) ─────────────────────
type BibleData = { abbrev:string; name:string; chapters:string[][] }[];
const bibleCache = new Map<string, BibleData>();

async function loadBible(ver: Version): Promise<BibleData> {
  if (bibleCache.has(ver.id)) return bibleCache.get(ver.id)!;
  if (ver.src === "github") {
    const url = `https://raw.githubusercontent.com/thiagobodruk/bible/master/json/${ver.key}.json`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Error ${res.status}`);
    const buf = await res.arrayBuffer();
    const text = new TextDecoder("utf-8").decode(buf).replace(/^﻿/, "");
    const data: BibleData = JSON.parse(text);
    bibleCache.set(ver.id, data);
    return data;
  } else {
    // getbible.net — load chapter by chapter on demand, return placeholder
    throw new Error("USE_GETBIBLE");
  }
}

// ── Search parser ──────────────────────────────────────────────────────────
interface ParsedRef { book: BookMeta; chapter: number; verse: number|null; }

function normalizeStr(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"").replace(/[^a-z0-9 ]/g,"");
}

function parseReference(query: string): ParsedRef | null {
  const q = query.trim();
  if (!q) return null;

  // Regex: optional number prefix + book name + optional chapter + optional :verse
  const match = q.match(/^(\d\s*)?([a-záéíóúñü]+(?:\s+[a-záéíóúñü]+)*)\s*(\d+)?\s*:?\s*(\d+)?$/i);
  if (!match) return null;

  const prefix  = (match[1] ?? "").replace(/\s/,"");
  const namePart = (prefix ? prefix + " " : "") + match[2].trim();
  const chNum   = match[3] ? parseInt(match[3]) : null;
  const vNum    = match[4] ? parseInt(match[4]) : null;

  const qNorm = normalizeStr(namePart);

  // Try exact abbrev match first
  let found = BOOKS.find(b =>
    b.abbrevs.some(a => a === qNorm) ||
    normalizeStr(b.es) === qNorm ||
    normalizeStr(b.en) === qNorm
  );
  // Then partial match
  if (!found) {
    found = BOOKS.find(b =>
      normalizeStr(b.es).startsWith(qNorm) ||
      normalizeStr(b.en).startsWith(qNorm) ||
      b.abbrevs.some(a => a.startsWith(qNorm))
    );
  }
  if (!found) return null;

  return {
    book: found,
    chapter: chNum ?? 1,
    verse: vNum ?? null,
  };
}

// ── Component ─────────────────────────────────────────────────────────────
interface Props { onClose: () => void; }

export default function BibleReader({ onClose }: Props) {
  const [versionId,  setVersionId]  = useState("rvr");
  const [bookNum,    setBookNum]    = useState(19);    // Salmos
  const [chapter,    setChapter]    = useState(23);
  const [verses,     setVerses]     = useState<{ num:number; text:string }[]>([]);
  const [loading,    setLoading]    = useState(false);
  const [loadingBible, setLoadingBible] = useState(false);
  const [error,      setError]      = useState("");
  const [showBooks,  setShowBooks]  = useState(false);
  const [bookSearch, setBookSearch] = useState("");
  const [searchQ,    setSearchQ]    = useState("");
  const [searchSugg, setSearchSugg] = useState<ParsedRef|null>(null);
  const [highlightV, setHighlightV] = useState<number|null>(null);
  const bodyRef    = useRef<HTMLDivElement>(null);
  const verseRefs  = useRef<Record<number, HTMLDivElement|null>>({});
  const bibleRef   = useRef<BibleData|null>(null);

  const version = VERSIONS.find(v => v.id === versionId)!;
  const book    = BOOKS.find(b => b.num === bookNum)!;

  // ── Load Bible data ────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    async function init() {
      setLoadingBible(true);
      try {
        const data = await loadBible(version);
        if (!cancelled) { bibleRef.current = data; }
      } catch (e: any) {
        if (!cancelled && e.message !== "USE_GETBIBLE") setError(e.message);
        if (!cancelled) bibleRef.current = null;
      } finally {
        if (!cancelled) setLoadingBible(false);
      }
    }
    bibleRef.current = null;
    init();
    return () => { cancelled = true; };
  }, [versionId]);

  // ── Load chapter ──────────────────────────────────────────────────────
  useEffect(() => {
    if (loadingBible) return;
    let cancelled = false;
    async function load() {
      setLoading(true); setError(""); setVerses([]);
      try {
        if (bibleRef.current) {
          // GitHub source — direct from cache
          const bookIdx = bookNum - 1;
          const chapData = bibleRef.current[bookIdx]?.chapters[chapter - 1] ?? [];
          if (!cancelled) setVerses(chapData.map((t, i) => ({ num: i + 1, text: t.trim() })));
        } else {
          // getbible.net fallback
          const url = `https://api.getbible.net/v2/${version.key}/${bookNum}/${chapter}.json`;
          const res = await fetch(url);
          if (!res.ok) throw new Error(`Error ${res.status}`);
          const data = await res.json();
          const arr = (data.verses as any[])
            .sort((a,b) => a.verse - b.verse)
            .map(v => ({ num: v.verse as number, text: (v.text as string).trim() }));
          if (!cancelled) setVerses(arr);
        }
        if (!cancelled) bodyRef.current?.scrollTo({ top: 0, behavior: "smooth" });
      } catch (e: any) {
        if (!cancelled) setError(e?.message ?? "No se pudo cargar");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [versionId, bookNum, chapter, loadingBible]);

  // ── Scroll to highlighted verse ───────────────────────────────────────
  useEffect(() => {
    if (highlightV && verseRefs.current[highlightV]) {
      setTimeout(() => {
        verseRefs.current[highlightV!]?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 300);
    }
  }, [highlightV, verses]);

  // ── Search suggestions ────────────────────────────────────────────────
  useEffect(() => {
    setSearchSugg(parseReference(searchQ));
  }, [searchQ]);

  function goChapter(delta: number) {
    const next = chapter + delta;
    if (next < 1) {
      const prev = BOOKS.find(b => b.num === bookNum - 1);
      if (prev) { setBookNum(prev.num); setChapter(prev.chapters); }
    } else if (next > book.chapters) {
      const nxt = BOOKS.find(b => b.num === bookNum + 1);
      if (nxt) { setBookNum(nxt.num); setChapter(1); }
    } else { setChapter(next); }
    setHighlightV(null);
  }

  function navigate(ref: ParsedRef) {
    setBookNum(ref.book.num);
    setChapter(Math.min(ref.chapter, ref.book.chapters));
    setHighlightV(ref.verse);
    setSearchQ("");
    setSearchSugg(null);
  }

  const filteredBooks = bookSearch
    ? BOOKS.filter(b => normalizeStr(b.es).includes(normalizeStr(bookSearch)) || b.abbrevs.some(a => a.includes(normalizeStr(bookSearch))))
    : null;

  const otBooks = BOOKS.filter(b => b.testament === "OT");
  const ntBooks = BOOKS.filter(b => b.testament === "NT");

  return (
    <div style={{ position:"fixed", inset:0, zIndex:60, backgroundColor:"var(--c-bg)", display:"flex", flexDirection:"column" }}>

      {/* ── Top bar ── */}
      <div style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 14px", borderBottom:"1px solid var(--c-border)", flexShrink:0, background:"var(--c-surface)" }}>
        <button onClick={onClose} style={{ background:"none", border:"none", cursor:"pointer", color:"var(--c-text3)", padding:4, display:"flex" }}>
          <X size={20} />
        </button>
        <BookOpen size={15} style={{ color:"var(--c-indigo)" }} />
        <span style={{ fontWeight:700, fontSize:15, color:"var(--c-text)" }}>Biblia</span>

        {/* Smart search */}
        <div style={{ flex:1, maxWidth:320, position:"relative", marginLeft:8 }}>
          <div style={{ display:"flex", alignItems:"center", gap:6, background:"var(--c-elevated)", border:"1px solid var(--c-border)", borderRadius:10, padding:"5px 10px" }}>
            <Search size={13} style={{ color:"var(--c-text3)", flexShrink:0 }} />
            <input
              value={searchQ}
              onChange={e => setSearchQ(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && searchSugg) navigate(searchSugg); }}
              placeholder="Juan 3:16 · Sal 23 · Génesis 1"
              style={{ background:"none", border:"none", outline:"none", fontSize:13, color:"var(--c-text)", width:"100%" }}
            />
            {searchQ && <button onClick={() => setSearchQ("")} style={{ background:"none", border:"none", cursor:"pointer", color:"var(--c-text4)", padding:0, display:"flex" }}><X size={12} /></button>}
          </div>

          {/* Search suggestion */}
          {searchSugg && searchQ && (
            <button
              onClick={() => navigate(searchSugg)}
              style={{
                position:"absolute", top:"calc(100% + 4px)", left:0, right:0, zIndex:30,
                background:"var(--c-surface)", border:"1px solid var(--c-border)", borderRadius:10,
                padding:"10px 14px", cursor:"pointer", textAlign:"left",
                display:"flex", alignItems:"center", gap:10,
                boxShadow:"0 4px 16px rgba(0,0,0,0.15)",
              }}
            >
              <BookOpen size={14} style={{ color:"var(--c-indigo)", flexShrink:0 }} />
              <div>
                <p style={{ fontSize:13, fontWeight:600, color:"var(--c-text)", margin:0 }}>
                  {searchSugg.book.es} {searchSugg.chapter}{searchSugg.verse ? `:${searchSugg.verse}` : ""}
                </p>
                <p style={{ fontSize:11, color:"var(--c-text3)", margin:0 }}>Presiona Enter o haz clic para ir</p>
              </div>
            </button>
          )}
          {searchQ && !searchSugg && (
            <div style={{ position:"absolute", top:"calc(100% + 4px)", left:0, right:0, zIndex:30, background:"var(--c-surface)", border:"1px solid var(--c-border)", borderRadius:10, padding:"10px 14px", boxShadow:"0 4px 16px rgba(0,0,0,0.15)" }}>
              <p style={{ fontSize:12, color:"var(--c-text4)", margin:0 }}>Ej: "Juan 3:16", "Sal 23", "Gn 1:1"</p>
            </div>
          )}
        </div>

        {/* Version selector */}
        <select
          value={versionId}
          onChange={e => setVersionId(e.target.value)}
          style={{ background:"var(--c-elevated)", border:"1px solid var(--c-border)", borderRadius:8, padding:"4px 8px", fontSize:12, color:"var(--c-text)", cursor:"pointer", outline:"none" }}
        >
          <optgroup label="Español">
            {VERSIONS.filter(v=>v.lang==="es").map(v=><option key={v.id} value={v.id}>{v.label}</option>)}
          </optgroup>
          <optgroup label="English">
            {VERSIONS.filter(v=>v.lang==="en").map(v=><option key={v.id} value={v.id}>{v.label}</option>)}
          </optgroup>
        </select>
      </div>

      {/* ── Loading Bible ── */}
      {loadingBible && (
        <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:10, padding:12, background:"var(--c-indigo-bg)", borderBottom:"1px solid var(--c-border)" }}>
          <Loader2 size={13} className="animate-spin" style={{ color:"var(--c-indigo)" }} />
          <span style={{ fontSize:12, color:"var(--c-indigo2)" }}>Cargando {version.label}…</span>
        </div>
      )}

      {/* ── Nav bar ── */}
      <div style={{ display:"flex", alignItems:"center", gap:8, padding:"8px 14px", borderBottom:"1px solid var(--c-border)", background:"var(--c-surface)", flexShrink:0, flexWrap:"wrap" }}>
        <button
          onClick={() => setShowBooks(v=>!v)}
          style={{ background:showBooks?"var(--c-indigo)":"var(--c-elevated)", border:"1px solid var(--c-border)", borderRadius:8, padding:"5px 12px", cursor:"pointer", color:showBooks?"#fff":"var(--c-text)", fontSize:13, fontWeight:600, display:"flex", alignItems:"center", gap:5 }}
        >
          {book.es} <ChevronDown size={12} />
        </button>

        <select
          value={chapter}
          onChange={e => { setChapter(Number(e.target.value)); setHighlightV(null); }}
          style={{ background:"var(--c-elevated)", border:"1px solid var(--c-border)", borderRadius:8, padding:"5px 8px", fontSize:13, color:"var(--c-text)", cursor:"pointer", outline:"none" }}
        >
          {Array.from({length:book.chapters},(_,i)=>i+1).map(c=><option key={c} value={c}>Cap. {c}</option>)}
        </select>

        <div style={{ flex:1 }} />

        <button onClick={()=>goChapter(-1)} style={{ background:"none", border:"1px solid var(--c-border)", borderRadius:8, padding:"5px 8px", cursor:"pointer", color:"var(--c-text2)", display:"flex" }}>
          <ChevronLeft size={16} />
        </button>
        <button onClick={()=>goChapter(1)} style={{ background:"none", border:"1px solid var(--c-border)", borderRadius:8, padding:"5px 8px", cursor:"pointer", color:"var(--c-text2)", display:"flex" }}>
          <ChevronRight size={16} />
        </button>
      </div>

      {/* ── Body ── */}
      <div style={{ flex:1, display:"flex", overflow:"hidden" }}>

        {/* Book panel */}
        {showBooks && (
          <div style={{ width:210, flexShrink:0, borderRight:"1px solid var(--c-border)", display:"flex", flexDirection:"column", background:"var(--c-surface)" }}>
            <div style={{ padding:"8px 10px", borderBottom:"1px solid var(--c-border)" }}>
              <div style={{ display:"flex", alignItems:"center", gap:6, background:"var(--c-elevated)", borderRadius:8, padding:"5px 10px" }}>
                <Search size={12} style={{ color:"var(--c-text3)" }} />
                <input value={bookSearch} onChange={e=>setBookSearch(e.target.value)} placeholder="Buscar libro…"
                  style={{ background:"none", border:"none", outline:"none", fontSize:12, color:"var(--c-text)", width:"100%" }} />
              </div>
            </div>
            <div style={{ overflowY:"auto", flex:1 }}>
              {filteredBooks
                ? filteredBooks.map(b =>
                    <button key={b.num} onClick={() => { setBookNum(b.num); setChapter(1); setShowBooks(false); setBookSearch(""); setHighlightV(null); }}
                      style={{ width:"100%", textAlign:"left", padding:"7px 12px", background:b.num===bookNum?"var(--c-indigo-bg)":"none", border:"none", cursor:"pointer", color:b.num===bookNum?"var(--c-indigo2)":"var(--c-text2)", fontSize:13 }}>
                      {b.es}
                    </button>
                  )
                : <>
                    <p style={{ padding:"6px 12px 2px", fontSize:9, fontWeight:700, color:"var(--c-text4)", letterSpacing:"0.1em", textTransform:"uppercase" }}>Antiguo Testamento</p>
                    {otBooks.map(b =>
                      <button key={b.num} onClick={() => { setBookNum(b.num); setChapter(1); setShowBooks(false); setHighlightV(null); }}
                        style={{ width:"100%", textAlign:"left", padding:"7px 12px", background:b.num===bookNum?"var(--c-indigo-bg)":"none", border:"none", cursor:"pointer", color:b.num===bookNum?"var(--c-indigo2)":"var(--c-text2)", fontSize:13 }}>
                        {b.es}
                      </button>
                    )}
                    <p style={{ padding:"6px 12px 2px", fontSize:9, fontWeight:700, color:"var(--c-text4)", letterSpacing:"0.1em", textTransform:"uppercase" }}>Nuevo Testamento</p>
                    {ntBooks.map(b =>
                      <button key={b.num} onClick={() => { setBookNum(b.num); setChapter(1); setShowBooks(false); setHighlightV(null); }}
                        style={{ width:"100%", textAlign:"left", padding:"7px 12px", background:b.num===bookNum?"var(--c-indigo-bg)":"none", border:"none", cursor:"pointer", color:b.num===bookNum?"var(--c-indigo2)":"var(--c-text2)", fontSize:13 }}>
                        {b.es}
                      </button>
                    )}
                  </>
              }
            </div>
          </div>
        )}

        {/* Verses */}
        <div ref={bodyRef} style={{ flex:1, overflowY:"auto", padding:"20px 16px" }}>
          <div style={{ maxWidth:680, margin:"0 auto" }}>
            <h2 style={{ fontSize:22, fontWeight:700, color:"var(--c-text)", marginBottom:20 }}>
              {book.es} {chapter}
              <span style={{ fontSize:12, fontWeight:400, color:"var(--c-text4)", marginLeft:10 }}>{version.label}</span>
            </h2>

            {(loading || loadingBible) && (
              <div style={{ display:"flex", alignItems:"center", gap:10, color:"var(--c-text3)", padding:"20px 0" }}>
                <Loader2 size={16} className="animate-spin" />
                <span style={{ fontSize:14 }}>
                  {loadingBible ? `Descargando ${version.label}…` : `Cargando ${book.es} ${chapter}…`}
                </span>
              </div>
            )}

            {error && !loading && !loadingBible && (
              <div style={{ background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.3)", borderRadius:10, padding:"12px 16px", color:"#fca5a5", fontSize:13 }}>
                ⚠ {error}
              </div>
            )}

            {!loading && !loadingBible && verses.map(v => (
              <div
                key={v.num}
                ref={el => { verseRefs.current[v.num] = el; }}
                style={{
                  display:"flex", gap:12, marginBottom:14, lineHeight:1.75,
                  borderRadius:8, padding:"2px 6px",
                  background: highlightV === v.num ? "var(--c-indigo-bg)" : "none",
                  transition:"background 0.4s",
                }}
              >
                <span style={{ fontSize:10, fontWeight:700, color:highlightV===v.num?"var(--c-indigo)":"var(--c-text4)", minWidth:20, paddingTop:4, flexShrink:0, textAlign:"right" }}>{v.num}</span>
                <p style={{ fontSize:15, color:"var(--c-text)", margin:0 }}>{v.text}</p>
              </div>
            ))}

            {!loading && !loadingBible && verses.length > 0 && (
              <div style={{ display:"flex", gap:10, marginTop:32, paddingTop:20, borderTop:"1px solid var(--c-border)" }}>
                <button onClick={()=>goChapter(-1)} style={{ flex:1, padding:10, borderRadius:10, background:"var(--c-elevated)", border:"1px solid var(--c-border)", cursor:"pointer", color:"var(--c-text2)", fontSize:13, display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
                  <ChevronLeft size={14} /> Anterior
                </button>
                <button onClick={()=>goChapter(1)} style={{ flex:1, padding:10, borderRadius:10, background:"var(--c-elevated)", border:"1px solid var(--c-border)", cursor:"pointer", color:"var(--c-text2)", fontSize:13, display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
                  Siguiente <ChevronRight size={14} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
