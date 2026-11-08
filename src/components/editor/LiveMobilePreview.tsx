import React, { useState } from 'react';
import type { ContentBlock, ToolBlock, PromptBlock, LinkBlock, TextBlock } from '../../types';
import {
  Copy,
  Check,
  ExternalLink,
  Layers,
  Sparkles,
  Terminal,
  Wrench,
  Link2,
  ChevronRight,
  Smartphone
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface LiveMobilePreviewProps {
  name: string;
  slug: string;
  pageTitle: string;
  description: string;
  categoryBadge?: string;
  blocks: ContentBlock[];
}

export const LiveMobilePreview: React.FC<LiveMobilePreviewProps> = ({
  name,
  pageTitle,
  description,
  blocks,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyPrompt = (promptText: string, id: string) => {
    navigator.clipboard.writeText(promptText);
    setCopiedId(id);
    confetti({
      particleCount: 20,
      spread: 35,
      origin: { y: 0.8 },
      colors: ['#22d3ee', '#c084fc']
    });
    setTimeout(() => setCopiedId(null), 2000);
  };

  const renderPromptWithPlaceholders = (text: string) => {
    const parts = text.split(/(\[[^\]]+\])/g);
    return parts.map((part, i) => {
      if (part.startsWith('[') && part.endsWith(']')) {
        return (
          <span
            key={i}
            className="bg-cyan-500/20 text-cyan-300 border border-cyan-500/35 px-1 py-0.2 rounded font-semibold text-[9px]"
          >
            {part}
          </span>
        );
      }
      return part;
    });
  };

  return (
    <div className="flex flex-col items-center">
      <div className="flex items-center gap-2 mb-3 text-xs font-mono text-purple-300/80">
        <Smartphone className="w-4 h-4 text-cyan-400" />
        <span>Prévia em Tempo Real (Mobile)</span>
      </div>

      {/* Phone Mockup Frame */}
      <div className="w-[340px] sm:w-[360px] min-h-[580px] max-h-[720px] overflow-y-auto rounded-[38px] border-4 border-[#2c2258] bg-[#090714] bg-grid shadow-2xl relative p-4 text-slate-100 selection:bg-purple-500 custom-scrollbar">
        {/* Phone Notch / Dynamic Island */}
        <div className="w-24 h-4 bg-[#1b143a] rounded-full mx-auto mb-4 border border-purple-500/20" />

        {/* Brand Pill */}
        <div className="flex justify-center mb-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#160f33] border border-purple-500/25">
            <div className="w-3.5 h-3.5 rounded bg-gradient-to-tr from-purple-500 to-cyan-400 flex items-center justify-center">
              <Layers className="w-2 h-2 text-white" />
            </div>
            <span className="text-[10px] font-semibold text-slate-200">
              Skill<span className="text-purple-400">Hub</span>
            </span>
            <span className="w-1 h-1 rounded-full bg-cyan-400" />
            <span className="text-[9px] text-cyan-300 font-medium">Verificado</span>
          </div>
        </div>

        {/* Title & Description */}
        <div className="text-center mb-5 space-y-1.5">
          <h2 className="text-lg font-display font-bold text-white tracking-tight leading-tight">
            {pageTitle || name || 'Título da Página'}
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
            {description || 'Sua descrição aparecerá aqui para seus seguidores do Instagram e TikTok.'}
          </p>
          <div className="flex items-center justify-center gap-1 pt-0.5 text-[10px] text-purple-300/70 font-mono">
            <Sparkles className="w-2.5 h-2.5 text-cyan-400" />
            <span>Acesso Imediato</span>
          </div>
        </div>

        {/* Blocks rendering */}
        <div className="space-y-3 pb-6">
          {blocks.map((block) => {
            // Text Block
            if (block.type === 'text') {
              const b = block as TextBlock;
              return (
                <div
                  key={b.id}
                  className="bg-[#130d2a]/90 border border-purple-500/15 rounded-xl p-3 shadow-sm text-left"
                >
                  {b.title && (
                    <p className="text-xs font-semibold text-purple-300 mb-1">{b.title}</p>
                  )}
                  <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                    {b.content || 'Texto do bloco...'}
                  </p>
                </div>
              );
            }

            // Tool Block
            if (block.type === 'tool') {
              const b = block as ToolBlock;
              return (
                <div
                  key={b.id}
                  className="bg-[#150e30]/90 border border-purple-500/20 rounded-xl p-3 shadow-sm text-left"
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-purple-600/25 border border-purple-500/30 flex items-center justify-center text-cyan-300">
                        <Wrench className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white leading-none">
                          {b.name || 'Nome da Ferramenta'}
                        </p>
                        {b.category && (
                          <span className="text-[9px] text-purple-400 font-mono">{b.category}</span>
                        )}
                      </div>
                    </div>
                    {b.badge && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 font-semibold">
                        {b.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-300 leading-snug mb-2.5 line-clamp-2">
                    {b.description || 'Descrição da ferramenta...'}
                  </p>
                  <div className="w-full py-1.5 px-3 rounded-lg text-[11px] font-semibold text-center text-white bg-[#1e1544] border border-purple-500/25 flex items-center justify-center gap-1.5">
                    <span>Acessar Ferramenta</span>
                    <ExternalLink className="w-3 h-3 text-cyan-300" />
                  </div>
                </div>
              );
            }

            // Prompt Block
            if (block.type === 'prompt') {
              const b = block as PromptBlock;
              const isCopied = copiedId === b.id;
              return (
                <div
                  key={b.id}
                  className="bg-[#120c29] border border-cyan-500/25 rounded-xl overflow-hidden shadow-sm text-left"
                >
                  <div className="bg-[#191136] px-3 py-2 border-b border-purple-500/15 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 truncate">
                      <Terminal className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span className="text-xs font-semibold text-white truncate">
                        {b.title || 'Prompt Copiável'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopyPrompt(b.promptText, b.id)}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 transition-all ${
                        isCopied
                          ? 'bg-emerald-500 text-slate-950'
                          : 'bg-cyan-500 text-slate-950 hover:bg-cyan-400'
                      }`}
                    >
                      {isCopied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      <span>{isCopied ? 'Copiado!' : 'Copiar'}</span>
                    </button>
                  </div>
                  <div className="p-2.5 bg-[#080512]">
                    <div className="font-mono text-[10px] text-cyan-200/90 whitespace-pre-wrap leading-relaxed line-clamp-4">
                      {renderPromptWithPlaceholders(b.promptText || 'Seu prompt aparecerá aqui...')}
                    </div>
                  </div>
                </div>
              );
            }

            // Link Block
            if (block.type === 'link') {
              const b = block as LinkBlock;
              return (
                <div
                  key={b.id}
                  className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 text-left ${
                    b.highlighted
                      ? 'bg-[#1b123d] border-cyan-500/40'
                      : 'bg-[#150e30]/80 border-purple-500/15'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <div className="w-7 h-7 rounded-lg bg-purple-500/15 border border-purple-500/25 flex items-center justify-center text-cyan-300 shrink-0">
                      <Link2 className="w-3.5 h-3.5" />
                    </div>
                    <div className="truncate">
                      <p className="text-xs font-semibold text-white truncate">
                        {b.title || 'Título do Link'}
                      </p>
                      {b.description && (
                        <p className="text-[10px] text-slate-400 truncate">{b.description}</p>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                </div>
              );
            }

            return null;
          })}

          {blocks.length === 0 && (
            <div className="py-8 text-center text-xs text-slate-500 border border-dashed border-purple-500/20 rounded-xl">
              Nenhum bloco adicionado.
            </div>
          )}
        </div>

        {/* Footer in phone preview */}
        <div className="text-center pt-3 border-t border-purple-500/10 text-[9px] text-slate-500">
          SkillHub • Feito para criadores
        </div>
      </div>
    </div>
  );
};

