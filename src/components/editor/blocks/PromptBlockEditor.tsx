import React from 'react';
import type { PromptBlock } from '../../../types';

interface Props {
  block: PromptBlock;
  onChange: (updated: PromptBlock) => void;
}

export const PromptBlockEditor: React.FC<Props> = ({ block, onChange }) => {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Título do prompt <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={block.title}
            onChange={(e) => onChange({ ...block, title: e.target.value })}
            placeholder="Ex: Prompt Mestre: Direção Vocal"
            className="w-full bg-[#120c2b] text-sm text-white placeholder-slate-500 px-3.5 py-2 rounded-xl border border-purple-500/15 focus:border-cyan-400 focus:outline-none transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Tag / Badge (opcional)
          </label>
          <input
            type="text"
            value={block.badge || ''}
            onChange={(e) => onChange({ ...block, badge: e.target.value })}
            placeholder="Ex: ChatGPT, Claude, Testado"
            className="w-full bg-[#120c2b] text-sm text-white placeholder-slate-500 px-3.5 py-2 rounded-xl border border-purple-500/15 focus:border-cyan-400 focus:outline-none transition-colors"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-300 mb-1">
          Texto do prompt copiável <span className="text-red-400">*</span>
        </label>
        <textarea
          rows={4}
          value={block.promptText}
          onChange={(e) => onChange({ ...block, promptText: e.target.value })}
          placeholder="Digite ou cole aqui o texto que será copiado com 1 clique pelo usuário..."
          className="w-full bg-[#0a0717] font-mono text-xs sm:text-sm text-cyan-200 placeholder-slate-600 px-3.5 py-2.5 rounded-xl border border-purple-500/20 focus:border-cyan-400 focus:outline-none transition-colors resize-y leading-relaxed"
        />
        <div className="flex flex-wrap items-center justify-between gap-1.5 mt-1.5">
          <p className="text-[11px] text-slate-500">
            Dica: use [COLCHETES] para indicar variáveis editáveis pelo seguidor.
          </p>
          <div className="flex flex-wrap items-center gap-1">
            {['[SEU NICHO]', '[TEMA DO VÍDEO]', '[COLE SEU ROTEIRO]', '[PÚBLICO-ALVO]'].map((placeholder) => (
              <button
                key={placeholder}
                type="button"
                onClick={() => {
                  const space = block.promptText && !block.promptText.endsWith(' ') ? ' ' : '';
                  onChange({ ...block, promptText: block.promptText + space + placeholder });
                }}
                className="px-2 py-0.5 text-[10px] font-mono rounded bg-cyan-950/40 text-cyan-300 border border-cyan-500/25 hover:bg-cyan-900/50 hover:border-cyan-400 transition-all cursor-pointer"
              >
                + {placeholder}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-300 mb-1">
          Instrução ou dica de uso (opcional)
        </label>
        <input
          type="text"
          value={block.instruction || ''}
          onChange={(e) => onChange({ ...block, instruction: e.target.value })}
          placeholder="Ex: Cole no ChatGPT ou Claude para analisar seu roteiro."
          className="w-full bg-[#120c2b] text-xs sm:text-sm text-white placeholder-slate-500 px-3.5 py-2 rounded-xl border border-purple-500/15 focus:border-cyan-400 focus:outline-none transition-colors"
        />
      </div>
    </div>
  );
};
