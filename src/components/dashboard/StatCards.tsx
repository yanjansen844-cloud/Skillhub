import React from 'react';
import { useProjects } from '../../context/ProjectContext';
import { FolderGit2, Eye, MousePointerClick, Copy } from 'lucide-react';
import type { DailyMetric } from '../../types';
import { percentChange, sumRange } from '../../hooks/useDailyMetrics';
import { dayKey } from '../../services/projectService';
import { TrendBadge } from './TrendBadge';

interface Props {
  series: DailyMetric[];
}

const formatNumber = (num: number) => {
  if (num >= 1000000) return (num / 1000000).toFixed(1).replace('.', ',') + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1).replace('.', ',') + 'k';
  return num.toString();
};

export const StatCards: React.FC<Props> = ({ series }) => {
  const { projects } = useProjects();

  const totalViews = projects.reduce((acc, p) => acc + (p.views || 0), 0);
  const totalClicks = projects.reduce((acc, p) => acc + (p.clicks || 0), 0);
  const totalPromptsCopied = projects.reduce((acc, p) => acc + (p.promptsCopied || 0), 0);

  const since30 = dayKey(29);
  const createdLast30 = projects.filter((p) => p.createdAt >= since30).length;

  const trendFor = (key: 'views' | 'clicks' | 'promptsCopied') => {
    const current = sumRange(series, key, 7);
    const previous = sumRange(series, key, 7, 7);
    return { current, change: percentChange(current, previous) };
  };

  const stats = [
    {
      title: 'Total de projetos',
      formattedValue: projects.length.toString(),
      badge: createdLast30 > 0 ? (
        <span className="text-[11px] font-medium text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20">
          +{createdLast30} em 30 dias
        </span>
      ) : null,
      icon: FolderGit2,
      borderGlow: 'hover:border-purple-500/40',
      iconColor: 'text-purple-400',
      bgGlow: 'bg-purple-500/10',
    },
    {
      title: 'Visualizações',
      formattedValue: formatNumber(totalViews),
      badge: <TrendBadge {...trendFor('views')} />,
      icon: Eye,
      borderGlow: 'hover:border-cyan-500/40',
      iconColor: 'text-cyan-400',
      bgGlow: 'bg-cyan-500/10',
    },
    {
      title: 'Cliques em links',
      formattedValue: formatNumber(totalClicks),
      badge: <TrendBadge {...trendFor('clicks')} />,
      icon: MousePointerClick,
      borderGlow: 'hover:border-purple-400/40',
      iconColor: 'text-purple-300',
      bgGlow: 'bg-purple-400/10',
    },
    {
      title: 'Prompts copiados',
      formattedValue: formatNumber(totalPromptsCopied),
      badge: <TrendBadge {...trendFor('promptsCopied')} />,
      icon: Copy,
      borderGlow: 'hover:border-emerald-500/40',
      iconColor: 'text-emerald-400',
      bgGlow: 'bg-emerald-500/10',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.title}
            className={`relative overflow-hidden bg-[#140e2d]/80 backdrop-blur-sm border border-purple-500/15 rounded-2xl p-5 shadow-card-glow transition-all duration-300 hover:-translate-y-1 ${stat.borderGlow} group`}
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-radial from-purple-500/10 to-transparent pointer-events-none rounded-bl-full" />

            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-slate-400 tracking-wide">{stat.title}</span>
              <div className={`p-2.5 rounded-xl ${stat.bgGlow} ${stat.iconColor} transition-transform duration-300 group-hover:scale-110`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>

            <div className="flex items-baseline justify-between gap-2">
              <div className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
                {stat.formattedValue}
              </div>
              {stat.badge}
            </div>
          </div>
        );
      })}
    </div>
  );
};
