import React from 'react';
import type { LinkBlock } from '../../../types';

interface Props {
  block: LinkBlock;
  onChange: (updated: LinkBlock) => void;
}

export const LinkBlockEditor: React.FC<Props> = ({ block, onChange }) => {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Título do link <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={block.title}
            onChange={(e) => onChange({ ...block, title: e.target.value })}
            placeholder="Ex: Baixar Pack no Google Drive"
            className="w-full bg-[#120c2b] text-sm text-white placeholder-slate-500 px-3.5 py-2 rounded-xl border border-purple-500/15 focus:border-cyan-400 focus:outline-none transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            URL de destino <span className="text-red-400">*</span>
          </label>
          <input
            type="url"
            value={block.url}
            onChange={(e) => onChange({ ...block, url: e.target.value })}
            placeholder="https://drive.google.com/..."
            className="w-full bg-[#120c2b] text-sm text-white placeholder-slate-500 px-3.5 py-2 rounded-xl border border-purple-500/15 focus:border-cyan-400 focus:outline-none transition-colors"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Descrição / Subtítulo (opcional)
          </label>
          <input
            type="text"
            value={block.description || ''}
            onChange={(e) => onChange({ ...block, description: e.target.value })}
            placeholder="Ex: Mais de 200 efeitos sonoros gratuitos"
            className="w-full bg-[#120c2b] text-sm text-white placeholder-slate-500 px-3.5 py-2 rounded-xl border border-purple-500/15 focus:border-cyan-400 focus:outline-none transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Badge (opcional)
          </label>
          <input
            type="text"
            value={block.badge || ''}
            onChange={(e) => onChange({ ...block, badge: e.target.value })}
            placeholder="Ex: Grátis, Download, VIP"
            className="w-full bg-[#120c2b] text-sm text-white placeholder-slate-500 px-3.5 py-2 rounded-xl border border-purple-500/15 focus:border-cyan-400 focus:outline-none transition-colors"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 pt-1">
        <input
          type="checkbox"
          id={`highlight-${block.id}`}
          checked={block.highlighted || false}
          onChange={(e) => onChange({ ...block, highlighted: e.target.checked })}
          className="rounded border-purple-500/30 bg-[#120c2b] text-purple-600 focus:ring-purple-500/40"
        />
        <label htmlFor={`highlight-${block.id}`} className="text-xs text-slate-300 select-none cursor-pointer">
          Destacar este link com borda brilhante e gradiente especial
        </label>
      </div>
    </div>
  );
};
