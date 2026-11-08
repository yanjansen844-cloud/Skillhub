import React from 'react';
import { Menu, Plus, ExternalLink } from 'lucide-react';
import { useProjects } from '../../context/ProjectContext';

interface HeaderProps {
  onOpenMobileMenu: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenMobileMenu }) => {
  const {
    currentView,
    navigateToCreate,
    navigateToPublic,
    projects
  } = useProjects();

  const getBreadcrumb = () => {
    switch (currentView) {
      case 'dashboard':
        return 'Visão Geral & Métricas';
      case 'projects':
        return 'Gerenciamento de Projetos';
      case 'create':
        return 'Novo Projeto';
      case 'edit':
        return 'Editar Projeto';
      default:
        return 'Painel';
    }
  };

  const firstPublished = projects.find(p => p.status === 'published');

  return (
    <header className="sticky top-0 z-30 h-16 bg-[#0a0717]/80 backdrop-blur-md border-b border-purple-500/10 px-4 sm:px-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {/* Mobile menu trigger */}
        <button
          onClick={onOpenMobileMenu}
          className="p-2 -ml-2 rounded-lg text-slate-400 hover:text-white hover:bg-purple-900/30 lg:hidden"
          aria-label="Abrir menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs uppercase font-mono tracking-wider text-purple-400 font-semibold hidden sm:inline">
            SkillHub
          </span>
          <span className="text-slate-600 hidden sm:inline">/</span>
          <h1 className="text-sm sm:text-base font-semibold text-white tracking-tight">
            {getBreadcrumb()}
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {firstPublished && (
          <button
            type="button"
            onClick={() => navigateToPublic(firstPublished.slug)}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-cyan-300 hover:text-cyan-200 bg-cyan-950/30 hover:bg-cyan-900/40 rounded-lg border border-cyan-500/30 transition-all shadow-sm cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Ver Exemplo Público</span>
          </button>
        )}

        {currentView !== 'create' && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              navigateToCreate();
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 rounded-xl shadow-purple-glow hover:shadow-purple-500/30 border border-purple-400/20 transition-all duration-200 active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Projeto</span>
          </button>
        )}
      </div>
    </header>
  );
};
