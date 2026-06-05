"use client";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/auth";
import { useSongsStore } from "@/store/songs";
import AuthScreen from "@/components/AuthScreen";
import Sidebar from "@/components/Sidebar";
import SongViewer from "@/components/SongViewer";
import SongEditor from "@/components/SongEditor";
import ImportSong from "@/components/ImportSong";
import QuickChordEditor from "@/components/QuickChordEditor";
import DeleteSongButton from "@/components/DeleteSongButton";
import ChordModal from "@/components/ChordModal";
import AdoraLogo from "@/components/AdoraLogo";
import WelcomeScreen from "@/components/WelcomeScreen";
import BibleReader from "@/components/BibleReader";
import { Menu, X, Pencil, Wand2, BookOpen } from "lucide-react";

export default function Home() {
  const { user, loading, init } = useAuthStore();
  const { fetchSongs, activeSongId, chordModalChord, songs } = useSongsStore();

  const [showEditor,    setShowEditor]    = useState(false);
  const [showImport,    setShowImport]    = useState(false);
  const [showQuickEdit, setShowQuickEdit] = useState(false);
  const [showBible,     setShowBible]     = useState(false);
  const [editId,        setEditId]        = useState<string | undefined>(undefined);
  const [sidebarOpen,   setSidebarOpen]   = useState(false);

  // Track when songs have finished loading to avoid flicker
  const [songsReady, setSongsReady] = useState(false);

  useEffect(() => { init(); }, [init]);

  useEffect(() => {
    if (user) {
      setSongsReady(false);
      fetchSongs(user.id).finally(() => setSongsReady(true));
    }
  }, [user?.id]);

  if (loading) return (
    <div style={{ minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "var(--c-bg)" }}>
      <div style={{ textAlign: "center" }}>
        <AdoraLogo size={40} className="mx-auto mb-4" />
        <p style={{ color: "var(--c-text3)", fontSize: 13 }}>Cargando…</p>
      </div>
    </div>
  );

  if (!user) return <AuthScreen />;

  function openNew()  { setEditId(undefined); setShowEditor(true); setSidebarOpen(false); }
  function openEdit() { if (activeSongId) { setEditId(activeSongId); setShowEditor(true); } }

  // Solo mostrar WelcomeScreen cuando las canciones ya cargaron Y no hay canción activa
  const songFound  = activeSongId && songs.find((s) => s.id === activeSongId);
  const showWelcome = songsReady && !songFound;

  return (
    <div className="h-full flex overflow-hidden">
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/50 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <div className={`fixed md:relative z-40 h-full transition-transform duration-200 ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}>
        <Sidebar onNewSong={openNew} onImport={() => { setShowImport(true); setSidebarOpen(false); }} />
      </div>

      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Mobile top bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b md:hidden" style={{ borderColor: "var(--c-border)" }}>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--c-text2)" }}>
            {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
          <AdoraLogo size={34} />
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button onClick={() => setShowBible(true)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--c-text3)" }}>
              <BookOpen size={18} />
            </button>
            {activeSongId && <>
              <button onClick={() => setShowQuickEdit(true)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--c-text3)" }}><Wand2 size={18} /></button>
              <button onClick={openEdit} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--c-text3)" }}><Pencil size={18} /></button>
            </>}
          </div>
        </div>

        {/* Desktop action bar */}
        <div className="hidden md:flex justify-end items-center gap-4 px-4 pt-3">
          {/* Biblia siempre visible */}
          <button
            onClick={() => setShowBible(true)}
            style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "var(--c-text3)" }}
          >
            <BookOpen size={13} /> Biblia
          </button>

          {activeSongId && <>
            <button onClick={() => setShowQuickEdit(true)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "var(--c-text3)" }}>
              <Wand2 size={13} /> Editor rápido
            </button>
            <button onClick={openEdit} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "var(--c-text3)" }}>
              <Pencil size={13} /> Editar
            </button>
            <DeleteSongButton
              songId={activeSongId}
              songTitle={songs.find(s => s.id === activeSongId)?.title ?? ""}
              onDeleted={() => {}}
            />
          </>}
        </div>

        {/* Main content — sin flicker */}
        {!songsReady
          ? null                    // esperando que carguen las canciones (silencioso)
          : showWelcome
            ? <WelcomeScreen onOpenBible={() => setShowBible(true)} />
            : <SongViewer />
        }
      </div>

      {showEditor    && <SongEditor onClose={() => setShowEditor(false)} editId={editId} />}
      {showImport    && <ImportSong onClose={() => setShowImport(false)} />}
      {showQuickEdit && <QuickChordEditor onClose={() => setShowQuickEdit(false)} />}
      {showBible     && <BibleReader onClose={() => setShowBible(false)} />}
      {chordModalChord && <ChordModal />}
    </div>
  );
}
