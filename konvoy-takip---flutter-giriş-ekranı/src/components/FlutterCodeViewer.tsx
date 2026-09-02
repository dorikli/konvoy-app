import React, { useState } from 'react';
import { FLUTTER_CODE_SNIPPETS } from '../data/flutterCode';
import {
  Copy,
  Check,
  FileCode,
  FolderTree,
  Terminal,
  Layers,
  Sparkles,
  ExternalLink,
  Code2,
} from 'lucide-react';

export const FlutterCodeViewer: React.FC = () => {
  const [activeFileId, setActiveFileId] = useState<string>('entry_screen');
  const [copiedFileId, setCopiedFileId] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  const activeSnippet =
    FLUTTER_CODE_SNIPPETS.find((s) => s.id === activeFileId) || FLUTTER_CODE_SNIPPETS[0];

  const handleCopyCode = (code: string, id: string) => {
    navigator.clipboard?.writeText(code);
    setCopiedFileId(id);
    setTimeout(() => setCopiedFileId(null), 2000);
  };

  const handleCopyAllFiles = () => {
    const allCode = FLUTTER_CODE_SNIPPETS.map(
      (s) => `// ==========================================\n// DOSYA: ${s.path}\n// AÇIKLAMA: ${s.description}\n// ==========================================\n\n${s.code}\n\n`
    ).join('\n');

    navigator.clipboard?.writeText(allCode);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/60 backdrop-blur-2xl rounded-3xl border border-white/15 shadow-2xl shadow-black/30 overflow-hidden text-slate-200 ring-1 ring-white/10">
      {/* Top Header Bar (Frosted Glass) */}
      <div className="px-5 py-4 bg-white/[0.06] backdrop-blur-xl border-b border-white/10 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-400/40 backdrop-blur-md flex items-center justify-center text-emerald-300 shadow-sm">
            <Code2 className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              Flutter & Dart Kaynak Kodları
              <span className="text-[10px] bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 px-2 py-0.5 rounded-full font-mono backdrop-blur-sm">
                Flutter 3.x / Dart 3.0+
              </span>
            </h2>
            <p className="text-xs text-slate-300">
              Projeyi doğrudan kopyalayıp Flutter projenize yapıştırabilirsiniz
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyAllFiles}
            className="px-3.5 py-1.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] text-xs font-semibold text-slate-200 hover:text-white border border-white/15 flex items-center gap-1.5 transition-all shadow-sm backdrop-blur-md"
          >
            {copiedAll ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-300">Tüm Proje Kopyalandı!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Tüm Kodları Kopyala</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* File Navigation Tabs */}
      <div className="flex overflow-x-auto bg-black/30 border-b border-white/10 px-3 pt-2 gap-1.5 no-scrollbar backdrop-blur-md">
        {FLUTTER_CODE_SNIPPETS.map((snippet) => {
          const isActive = snippet.id === activeFileId;
          return (
            <button
              key={snippet.id}
              onClick={() => setActiveFileId(snippet.id)}
              className={`px-3.5 py-2 rounded-t-xl text-xs font-mono font-medium flex items-center gap-2 border-t border-x transition-all shrink-0 ${
                isActive
                  ? 'bg-slate-900/90 text-emerald-300 border-white/20 border-b-0 -mb-px z-10 shadow-md backdrop-blur-md'
                  : 'bg-white/[0.04] text-slate-400 border-transparent hover:text-slate-200 hover:bg-white/[0.08]'
              }`}
            >
              <FileCode className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-300' : 'text-slate-500'}`} />
              <span>{snippet.filename}</span>
            </button>
          );
        })}
      </div>

      {/* Active File Meta Subheader */}
      <div className="px-5 py-2.5 bg-white/[0.04] border-b border-white/10 flex items-center justify-between text-xs backdrop-blur-sm">
        <div className="flex items-center gap-2 text-slate-400">
          <span className="font-mono text-cyan-300 bg-white/[0.07] px-2 py-0.5 rounded-lg border border-white/10 backdrop-blur-sm">
            {activeSnippet.path}
          </span>
          <span className="hidden sm:inline text-slate-500">•</span>
          <span className="hidden sm:inline text-slate-300">{activeSnippet.description}</span>
        </div>

        <button
          onClick={() => handleCopyCode(activeSnippet.code, activeSnippet.id)}
          className="px-3 py-1 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-400/40 flex items-center gap-1.5 font-semibold text-xs transition-colors shrink-0 backdrop-blur-sm"
        >
          {copiedFileId === activeSnippet.id ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>Kopyalandı!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Bu Dosyayı Kopyala</span>
            </>
          )}
        </button>
      </div>

      {/* Code Area with Line Numbers */}
      <div className="flex-1 overflow-auto bg-[#070D18]/80 backdrop-blur-md p-4 font-mono text-xs sm:text-[13px] leading-relaxed text-slate-200">
        <pre className="relative">
          <code>
            {activeSnippet.code.split('\n').map((line, idx) => (
              <div key={idx} className="table-row hover:bg-white/[0.05] px-2 rounded">
                <span className="table-cell text-right pr-4 select-none text-slate-600 font-mono text-xs w-8">
                  {idx + 1}
                </span>
                <span className="table-cell whitespace-pre font-mono">
                  {/* Basic syntax highlight helper */}
                  {highlightSyntax(line)}
                </span>
              </div>
            ))}
          </code>
        </pre>
      </div>

      {/* Quick Flutter Setup Tips at bottom */}
      <div className="p-4 bg-white/[0.05] backdrop-blur-xl border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-emerald-400" />
          <span className="font-mono text-slate-300">
            flutter pub add google_fonts flutter_animate pinput
          </span>
        </div>
        <span className="text-[11px] text-slate-400">
          StatefulWidget • FocusNode PIN Kontrolü • CustomPainter Radar
        </span>
      </div>
    </div>
  );
};

// Simple syntax colorizer for Dart / Flutter
function highlightSyntax(line: string): React.ReactNode {
  if (line.trim().startsWith('//') || line.trim().startsWith('/*') || line.trim().startsWith('*')) {
    return <span className="text-slate-500 italic">{line}</span>;
  }
  if (line.includes('class ') || line.includes('import ') || line.includes('extends ') || line.includes('with ')) {
    return <span className="text-purple-400 font-semibold">{line}</span>;
  }
  if (line.includes('final ') || line.includes('const ') || line.includes('late ') || line.includes('return ') || line.includes('void ') || line.includes('Future<')) {
    return <span className="text-cyan-400">{line}</span>;
  }
  if (line.includes('AppTheme') || line.includes('Widget') || line.includes('State') || line.includes('BuildContext')) {
    return <span className="text-amber-300">{line}</span>;
  }
  if (line.includes('TextStyle') || line.includes('Container') || line.includes('ElevatedButton') || line.includes('OutlinedButton') || line.includes('Column') || line.includes('Row')) {
    return <span className="text-emerald-400 font-medium">{line}</span>;
  }
  return <span>{line}</span>;
}
