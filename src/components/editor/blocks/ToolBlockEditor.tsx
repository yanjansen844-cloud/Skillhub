import React from 'react';
import type { ToolBlock } from '../../../types';

interface Props {
  block: ToolBlock;
  onChange: (updated: ToolBlock) => void;
}

export const ToolBlockEditor: React.FC<Props> = ({ block, onChange }) => {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Nome da ferramenta <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={block.name}
            onChange={(e) => onChange({ ...block, name: e.target.value })}
            placeholder="Ex: ElevenLabs"
            className="w-full bg-[#120c2b] text-sm text-white placeholder-slate-500 px-3.5 py-2 rounded-xl border border-purple-500/15 focus:border-cyan-400 focus:outline-none transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            URL da ferramenta <span className="text-red-400">*</span>
          </label>
          <input
            type="url"
            value={block.url}
            onChange={(e) => onChange({ ...block, url: e.target.value })}
            placeholder="https://elevenlabs.io"
            className="w-full bg-[#120c2b] text-sm text-white placeholder-slate-500 px-3.5 py-2 rounded-xl border border-purple-500/15 focus:border-cyan-400 focus:outline-none transition-colors"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-300 mb-1">
          Descrição da ferramenta <span className="text-red-400">*</span>
        </label>
        <textarea
          rows={2}
          value={block.description}
          onChange={(e) => onChange({ ...block, description: e.target.value })}
          placeholder="Descreva o que a ferramenta faz e por que ela é indispensável..."
          className="w-full bg-[#120c2b] text-sm text-white placeholder-slate-500 px-3.5 py-2 rounded-xl border border-purple-500/15 focus:border-cyan-400 focus:outline-none transition-colors resize-y leading-relaxed"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Categoria (opcional)
          </label>
          <input
            type="text"
            value={block.category || ''}
            onChange={(e) => onChange({ ...block, category: e.target.value })}
            placeholder="Ex: Locução com IA, Edição de Vídeo"
            className="w-full bg-[#120c2b] text-sm text-white placeholder-slate-500 px-3.5 py-2 rounded-xl border border-purple-500/15 focus:border-cyan-400 focus:outline-none transition-colors mb-1.5"
          />
          <div className="flex flex-wrap items-center gap-1">
            {['Locução com IA', 'Áudio & Música', 'Edição de Vídeo', 'Copywriting'].map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => onChange({ ...block, category: cat })}
                className="text-[9px] px-1.5 py-0.5 rounded bg-purple-950/40 text-purple-300 border border-purple-500/20 hover:border-purple-400 transition-colors"
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Badge de preço ou destaque (opcional)
          </label>
          <input
            type="text"
            value={block.badge || ''}
            onChange={(e) => onChange({ ...block, badge: e.target.value })}
            placeholder="Ex: Grátis, Freemium, Mais Usado"
            className="w-full bg-[#120c2b] text-sm text-white placeholder-slate-500 px-3.5 py-2 rounded-xl border border-purple-500/15 focus:border-cyan-400 focus:outline-none transition-colors mb-1.5"
          />
          <div className="flex flex-wrap items-center gap-1">
            {['100% Grátis', 'Freemium', 'Mais Popular', 'Recomendado'].map(bg => (
              <button
                key={bg}
                type="button"
                onClick={() => onChange({ ...block, badge: bg })}
                className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-950/40 text-cyan-300 border border-cyan-500/20 hover:border-cyan-400 transition-colors"
              >
                {bg}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
