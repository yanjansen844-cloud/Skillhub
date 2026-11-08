import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface Props {
  /** Variação percentual real; null = sem base de comparação */
  change: number | null;
  /** Valor do período atual (para distinguir "sem dados" de "novo") */
  current: number;
  label?: string;
}

export const TrendBadge: React.FC<Props> = ({ change, current, label = 'vs 7 dias anteriores' }) => {
  if (change === null) {
    if (current === 0) return null;
    return (
      <span className="text-[11px] font-medium text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20" title={label}>
        +{current.toLocaleString('pt-BR')} em 7 dias
      </span>
    );
  }

  const rounded = Math.round(change * 10) / 10;
  const Icon = rounded > 0 ? TrendingUp : rounded < 0 ? TrendingDown : Minus;
  const color =
    rounded > 0
      ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
      : rounded < 0
        ? 'text-red-400 bg-red-500/10 border-red-500/20'
        : 'text-slate-400 bg-slate-500/10 border-slate-500/20';

  return (
    <span className={`flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full border ${color}`} title={label}>
      <Icon className="w-3 h-3" />
      {rounded > 0 ? '+' : ''}
      {rounded.toLocaleString('pt-BR')}%
    </span>
  );
};
