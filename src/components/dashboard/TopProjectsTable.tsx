import React, { useState } from 'react';
import { useProjects } from '../../context/ProjectContext';
import { publicHost, publicUrl } from '../../utils/url';
import { Flame, Eye, Copy, ExternalLink, ArrowRight, Check } from 'lucide-react';

export const TopProjectsTable: React.FC = () => {
  const { projects, navigateToEdit, navigateToPublic, navigateToProjects, showToast } = useProjects();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Sort by views descending
  const topProjects = [...projects].sort((a, b) => b.views - a.views).slice(0, 4);

  const handleCopyLink = (slug: string, id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const url = publicUrl(slug);
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    showToast('Link da página pública copiado!', 'cyan');
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="bg-[#140e2d]/80 backdrop-blur-sm border border-purple-500/15 rounded-2xl p-5 sm:p-6 shadow-card-glow flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Flame className="w-4 h-4 text-purple-400" />
            </span>
            <h2 className="text-base sm:text-lg font-semibold text-white tracking-tight">
              Projetos Mais Acessados
            </h2>
          </div>
          <button
            onClick={navigateToProjects}
            className="text-xs text-purple-400 hover:text-cyan-300 font-medium flex items-center gap-1 transition-colors"
          >
            <span>Ver todos</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-3">
          {topProjects.length === 0 && (
            <div className="py-8 text-center text-xs text-slate-400 bg-[#1a1338]/40 border border-dashed border-purple-500/20 rounded-xl">
              Você ainda não criou nenhum projeto.
            </div>
          )}
          {topProjects.map((project, index) => {
            const isFirst = index === 0;
            const isCopied = copiedId === project.id;

            return (
              <div
                key={project.id}
                onClick={() => navigateToEdit(project.id)}
                className="group flex items-center justify-between p-3.5 rounded-xl bg-[#1a1338]/60 hover:bg-[#201844] border border-purple-500/10 hover:border-purple-500/30 transition-all duration-200 cursor-pointer"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  {/* Rank badge */}
                  <span
                    className={`w-6 h-6 rounded-lg text-xs font-mono font-bold flex items-center justify-center shrink-0 ${
                      isFirst
                        ? 'bg-gradient-to-tr from-purple-600 to-cyan-400 text-white shadow-cyan-glow'
                        : 'bg-purple-950/60 text-purple-300 border border-purple-500/20'
                    }`}
                  >
                    #{index + 1}
                  </span>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-slate-100 group-hover:text-cyan-300 transition-colors truncate">
                        {project.name}
                      </p>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-full border ${
                          project.status === 'published'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-300 border-amber-500/20'
                        }`}
                      >
                        {project.status === 'published' ? 'Publicado' : 'Rascunho'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 font-mono truncate">
                      {publicHost()}/p/{project.slug}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0 pl-3">
                  <div className="text-right hidden sm:block">
                    <p className="text-xs font-semibold text-slate-200 flex items-center justify-end gap-1">
                      <Eye className="w-3.5 h-3.5 text-cyan-400" />
                      {project.views.toLocaleString('pt-BR')}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {project.promptsCopied.toLocaleString('pt-BR')} prompts
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Copy Link button */}
                    <button
                      onClick={(e) => handleCopyLink(project.slug, project.id, e)}
                      title="Copiar link público"
                      className={`p-2 rounded-lg text-xs transition-all ${
                        isCopied
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-purple-950/40 hover:bg-purple-900/60 text-slate-300 border border-purple-500/15'
                      }`}
                    >
                      {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>

                    {/* View Public Page button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigateToPublic(project.slug);
                      }}
                      title="Visualizar página pública"
                      className="p-2 rounded-lg text-xs bg-purple-950/40 hover:bg-purple-900/60 text-slate-300 hover:text-cyan-300 border border-purple-500/15 transition-all"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-purple-500/10 flex items-center justify-between text-xs text-slate-400">
        <span>Total de {projects.length} projetos monitorados</span>
        <span className="text-cyan-400 font-medium">Sincronizado em tempo real</span>
      </div>
    </div>
  );
};

