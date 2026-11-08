import React from 'react';
import { StatCards } from '../components/dashboard/StatCards';
import { ViewsChart } from '../components/dashboard/ViewsChart';
import { TopProjectsTable } from '../components/dashboard/TopProjectsTable';
import { useProjects } from '../context/ProjectContext';
import { useDailyMetrics } from '../hooks/useDailyMetrics';
import { Sparkles, Share2, Plus } from 'lucide-react';

export const DashboardView: React.FC = () => {
  const { navigateToCreate, projects, navigateToPublic } = useProjects();
  const latestPublished = projects.find(p => p.status === 'published');
  const { series, loading, error } = useDailyMetrics(projects);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome & quick action banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#170e38] via-[#1f1347] to-[#120d29] border border-purple-500/20 p-6 sm:p-7 shadow-purple-glow">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-12 w-64 h-64 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/15 border border-purple-400/30 text-purple-300 text-xs font-medium mb-3">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Painel do Criador</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight leading-tight">
              Central de Entrega de <span className="text-gradient-purple-cyan">Prompts & Recursos</span>
            </h1>
            <p className="text-sm text-slate-300 mt-2 leading-relaxed">
              Crie páginas limpas e hiper-rápidas para compartilhar nos vídeos do Instagram e TikTok. Acompanhe visualizações, cliques e prompts copiados pelos seus seguidores.
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
            {latestPublished && (
              <button
                onClick={() => navigateToPublic(latestPublished.slug)}
                className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium text-slate-200 bg-purple-950/60 hover:bg-purple-900/60 border border-purple-500/25 flex items-center gap-2 transition-all"
              >
                <Share2 className="w-4 h-4 text-cyan-400" />
                <span>Página mais recente</span>
              </button>
            )}
            <button
              onClick={navigateToCreate}
              className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 hover:opacity-95 shadow-lg shadow-purple-950 flex items-center gap-2 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Criar Novo Projeto</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Indicators */}
      <StatCards series={series} />

      {/* Charts & Top Projects */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7">
          <ViewsChart series={series} loading={loading} error={error} />
        </div>
        <div className="lg:col-span-5">
          <TopProjectsTable />
        </div>
      </div>
    </div>
  );
};
