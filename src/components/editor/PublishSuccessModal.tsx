import React, { useState } from 'react';
import { Check, Copy, ExternalLink, Sparkles, FolderGit2, X } from 'lucide-react';
import confetti from 'canvas-confetti';

interface PublishSuccessModalProps {
  isOpen: boolean;
  projectName: string;
  slug: string;
  onClose: () => void;
  onGoToProjects: () => void;
  onViewPublicPage: () => void;
}

export const PublishSuccessModal: React.FC<PublishSuccessModalProps> = ({
  isOpen,
  projectName,
  slug,
  onClose,
  onGoToProjects,
  onViewPublicPage,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const publicUrl = `${window.location.origin}/p/${slug}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    confetti({
      particleCount: 30,
      spread: 45,
      origin: { y: 0.7 },
      colors: ['#22d3ee', '#c084fc', '#ffffff']
    });
    setTimeout(() => setCopied(false), 2200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-[#140e2e] border border-cyan-500/30 rounded-3xl p-6 sm:p-7 shadow-cyan-glow overflow-hidden">
        {/* Top glowing ambient accent */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-purple-500 via-cyan-400 to-indigo-500" />
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-cyan-glow">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-cyan-300 font-semibold">
                Tudo Pronto!
              </span>
              <h2 className="text-xl font-display font-bold text-white tracking-tight">
                Página Publicada!
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-purple-900/30 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-sm text-slate-300 leading-relaxed mb-5">
          O projeto <strong className="text-white">"{projectName}"</strong> está online e pronto para receber visualizações, cliques e cópias de prompts dos seus seguidores!
        </p>

        {/* Public URL Box */}
        <div className="mb-6">
          <label className="block text-xs font-semibold uppercase tracking-wider text-purple-300 mb-2 font-mono">
            Link para Bio do Instagram / TikTok
          </label>
          <div className="flex items-center gap-2 p-2 rounded-2xl bg-[#090617] border border-purple-500/25">
            <div className="flex-1 px-3 py-1 text-xs text-cyan-300 font-mono truncate select-all">
              {publicUrl}
            </div>
            <button
              onClick={handleCopy}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 shrink-0 ${
                copied
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-emerald-500/30'
                  : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-cyan-glow'
              }`}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copiado!' : 'Copiar Link'}</span>
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={onViewPublicPage}
            className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-purple-glow transition-all active:scale-95"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Ver Página Pública</span>
          </button>

          <button
            onClick={onGoToProjects}
            className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-medium text-slate-200 bg-[#1d1544] hover:bg-[#261d56] border border-purple-500/20 transition-all"
          >
            <FolderGit2 className="w-4 h-4 text-purple-300" />
            <span>Ir para Meus Projetos</span>
          </button>
        </div>
      </div>
    </div>
  );
};

