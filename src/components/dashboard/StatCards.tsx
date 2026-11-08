import React from 'react';
import { useProjects } from '../../context/ProjectContext';
import { FolderGit2, Eye, MousePointerClick, Copy, TrendingUp } from 'lucide-react';

export const StatCards: React.FC = () => {
  const { projects } = useProjects();

  const totalProjects = projects.length;
  const totalViews = projects.reduce((acc, p) => acc + (p.views || 0), 0);
  const totalClicks = projects.reduce((acc, p) => acc + (p.clicks || 0), 0);
  const totalPromptsCopied = projects.reduce((acc, p) => acc + (p.promptsCopied || 0), 0);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
    return num.toString();
  };

  const stats = [
    {
      title: 'Total de projetos',
      value: totalProjects,
      formattedValue: totalProjects.toString(),
      trend: '+2 este mês',
      icon: FolderGit2,
      accent: 'purple',
      borderGlow: 'hover:border-purple-500/40',
      iconColor: 'text-purple-400',
      bgGlow: 'bg-purple-500/10',
    },
    {
      title: 'Visualizações',
      value: totalViews,
      formattedValue: formatNumber(totalViews),
      trend: '+24.5%',
      icon: Eye,
      accent: 'cyan',
      borderGlow: 'hover:border-cyan-500/40',
      iconColor: 'text-cyan-400',
      bgGlow: 'bg-cyan-500/10',
    },
    {
      title: 'Cliques em links',
      value: totalClicks,
      formattedValue: formatNumber(totalClicks),
      trend: '+18.2%',
      icon: MousePointerClick,
      accent: 'lilac',
      borderGlow: 'hover:border-purple-400/40',
      iconColor: 'text-purple-300',
      bgGlow: 'bg-purple-400/10',
    },
    {
      title: 'Prompts copiados',
      value: totalPromptsCopied,
      formattedValue: formatNumber(totalPromptsCopied),
      trend: '+31.8%',
      icon: Copy,
      accent: 'emerald',
      borderGlow: 'hover:border-emerald-500/40',
      iconColor: 'text-emerald-400',
      bgGlow: 'bg-emerald-500/10',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, idx) => {
        const Icon = stat.icon;
        return (
          <div
            key={idx}
            className={`relative overflow-hidden bg-[#140e2d]/80 backdrop-blur-sm border border-purple-500/15 rounded-2xl p-5 shadow-card-glow transition-all duration-300 hover:-translate-y-1 ${stat.borderGlow} group`}
          >
            {/* Ambient corner light */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-radial from-purple-500/10 to-transparent pointer-events-none rounded-bl-full" />

            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-slate-400 tracking-wide">
                {stat.title}
              </span>
              <div className={`p-2.5 rounded-xl ${stat.bgGlow} ${stat.iconColor} transition-transform duration-300 group-hover:scale-110`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>

            <div className="flex items-baseline justify-between">
              <div className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
                {stat.formattedValue}
              </div>
              <div className="flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                <TrendingUp className="w-3 h-3" />
                <span>{stat.trend}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

