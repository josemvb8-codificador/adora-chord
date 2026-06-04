"use client";
import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import SongViewer from "@/components/SongViewer";
import SongEditor from "@/components/SongEditor";
import ImportSong from "@/components/ImportSong";
import QuickChordEditor from "@/components/QuickChordEditor";
import ChordModal from "@/components/ChordModal";
import { useSongsStore } from "@/store/songs";
import { Menu, X, Pencil, Wand2 } from "lucide-react";
import AdoraLogo from "@/components/AdoraLogo";

export default function Home() {
  const [showEditor, setShowEditor] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [showQuickEdit, setShowQuickEdit] = useState(false);
  const [editId, setEditId] = useState<string | undefined>(undefined);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { activeSongId, chordModalChord } = useSongsStore();

  function openNew() { setEditId(undefined); setShowEditor(true); setSidebarOpen(false); }
  function openEdit() { if (activeSongId) { setEditId(activeSongId); setShowEditor(true); } }

  return (
    <div className="h-full flex overflow-hidden">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/50 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <div className={`fixed md:relative z-40 h-full transition-transform duration-200 ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}>
        <Sidebar onNewSong={openNew} onImport={() => { setShowImport(true); setSidebarOpen(false); }} />
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Mobile top bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 md:hidden">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-zinc-400 hover:text-white">
            {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
          <AdoraLogo size={22} />
          {activeSongId && (
            <div className="flex gap-2">
              <button onClick={() => setShowQuickEdit(true)} className="text-zinc-400 hover:text-indigo-400">
                <Wand2 size={18} />
              </button>
              <button onClick={openEdit} className="text-zinc-400 hover:text-white">
                <Pencil size={18} />
              </button>
            </div>
          )}
        </div>

        {/* Desktop action bar */}
        {activeSongId && (
          <div className="hidden md:flex justify-end gap-3 px-4 pt-3">
            <button
              onClick={() => setShowQuickEdit(true)}
              className="flex items-center gap-1.5 text-zinc-500 hover:text-indigo-400 text-xs transition-colors"
            >
              <Wand2 size={13} /> Editor rápido
            </button>
            <button
              onClick={openEdit}
              className="flex items-center gap-1.5 text-zinc-500 hover:text-zinc-300 text-xs transition-colors"
            >
              <Pencil size={13} /> Editar
            </button>
          </div>
        )}

        <SongViewer />
      </div>

      {showEditor && <SongEditor onClose={() => setShowEditor(false)} editId={editId} />}
      {showImport && <ImportSong onClose={() => setShowImport(false)} />}
      {showQuickEdit && <QuickChordEditor onClose={() => setShowQuickEdit(false)} />}
      {chordModalChord && <ChordModal />}
    </div>
  );
}
