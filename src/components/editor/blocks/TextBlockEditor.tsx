import React from 'react';
import type { TextBlock } from '../../../types';

interface Props {
  block: TextBlock;
  onChange: (updated: TextBlock) => void;
}

export const TextBlockEditor: React.FC<Props> = ({ block, onChange }) => {
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-slate-300 mb-1">
          Título do bloco de texto (opcional)
        </label>
        <input
          type="text"
          value={block.title || ''}
          onChange={(e) => onChange({ ...block, title: e.target.value })}
          placeholder="Ex: Como utilizar este material"
          className="w-full bg-[#120c2b] text-sm text-white placeholder-slate-500 px-3.5 py-2 rounded-xl border border-purple-500/15 focus:border-cyan-400 focus:outline-none transition-colors"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-300 mb-1">
          Conteúdo do texto <span className="text-red-400">*</span>
        </label>
        <textarea
          rows={3}
          value={block.content}
          onChange={(e) => onChange({ ...block, content: e.target.value })}
          placeholder="Escreva parágrafos, instruções, dicas ou boas-vindas..."
          className="w-full bg-[#120c2b] text-sm text-white placeholder-slate-500 px-3.5 py-2.5 rounded-xl border border-purple-500/15 focus:border-cyan-400 focus:outline-none transition-colors resize-y leading-relaxed"
        />
      </div>
    </div>
  );
};
