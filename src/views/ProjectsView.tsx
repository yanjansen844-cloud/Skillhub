import React, { useState } from 'react';
import { useProjects } from '../context/ProjectContext';
import {
  Search,
  ExternalLink,
  Edit3,
  Copy,
  CopyPlus,
  Trash2,
  Check,
  Eye,
  Calendar,
  LayoutGrid,
  List,
  Layers
} from 'lucide-react';
import { ConfirmModal } from '../components/common/ConfirmModal';
import type { Project } from '../types';

export const ProjectsView: React.FC = () => {
  const {
    projects,
    isLoading,
    navigateToCreate,
    navigateToEdit,
    navigateToPublic,
    deleteProject,
    togglePublishStatus,
    duplicateProject,
    showToast,
  } = useProjects();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);

  const filteredProjects = projects.filter(p => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' ? true : p.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleCopyLink = (slug: string, id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const url = `${window.location.origin}/p/${slug}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    showToast('Link do projeto copiado para a área de transferência!', 'cyan');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleConfirmDelete = () => {
    if (projectToDelete) {
      deleteProject(projectToDelete.id);
      setProjectToDelete(null);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
      }
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header bar */}
      <div>
        <h1 className="text-2xl font-display font-bold text-white tracking-tight">
          Projetos Cadastrados
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Gerencie todas as páginas públicas geradas para suas redes sociais.
        </p>
      </div>

      {/* Search & Filters */}
      <div className="bg-[#140e2d]/80 backdrop-blur-sm border border-purple-500/15 rounded-2xl p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-card-glow">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nome, slug ou descrição..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#1a1338] text-sm text-white placeholder-slate-500 pl-10 pr-4 py-2 rounded-xl border border-purple-500/15 focus:border-cyan-400 focus:outline-none transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 self-end md:self-auto">
          {/* Status filter pills */}
          <div className="flex items-center bg-[#1a1338] p-1 rounded-xl border border-purple-500/15">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition-all ${
                statusFilter === 'all'
                  ? 'bg-purple-600 text-white font-semibold shadow-purple-glow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Todos ({projects.length})
            </button>
            <button
              onClick={() => setStatusFilter('published')}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition-all ${
                statusFilter === 'published'
                  ? 'bg-purple-600 text-white font-semibold shadow-purple-glow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Publicados
            </button>
            <button
              onClick={() => setStatusFilter('draft')}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition-all ${
                statusFilter === 'draft'
                  ? 'bg-purple-600 text-white font-semibold shadow-purple-glow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Rascunhos
            </button>
          </div>

          {/* View mode toggle */}
          <div className="flex items-center bg-[#1a1338] p-1 rounded-xl border border-purple-500/15">
            <button
              onClick={() => setViewMode('cards')}
              title="Visualização em Cards"
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'cards' ? 'bg-purple-600/40 text-cyan-300' : 'text-slate-400 hover:text-white'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              title="Visualização em Tabela"
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'table' ? 'bg-purple-600/40 text-cyan-300' : 'text-slate-400 hover:text-white'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Loading state skeleton */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-48 rounded-2xl bg-[#140e2d]/60 border border-purple-500/10 animate-pulse p-5 space-y-3">
              <div className="h-4 w-24 bg-purple-500/20 rounded-full" />
              <div className="h-6 w-3/4 bg-purple-500/20 rounded-lg" />
              <div className="h-3 w-1/2 bg-purple-500/10 rounded" />
              <div className="h-10 bg-purple-500/10 rounded-xl mt-4" />
            </div>
          ))}
        </div>
      )}

      {/* Projects List: Card View */}
      {!isLoading && viewMode === 'cards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProjects.map(project => {
            const isCopied = copiedId === project.id;
            const isPublished = project.status === 'published';

            return (
              <div
                key={project.id}
                className="group relative bg-[#140e2d]/90 backdrop-blur-sm border border-purple-500/15 hover:border-purple-500/35 rounded-2xl p-5 shadow-card-glow transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between overflow-hidden"
              >
                {/* Accent top gradient line */}
                <div
                  className={`absolute top-0 left-0 right-0 h-1 ${
                    isPublished
                      ? 'bg-gradient-to-r from-purple-500 via-cyan-400 to-indigo-500'
                      : 'bg-slate-700'
                  }`}
                />

                <div>
                  {/* Status & Badges */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span
                      onClick={() => togglePublishStatus(project.id)}
                      title="Clique para alternar status"
                      className={`cursor-pointer inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium border transition-colors ${
                        isPublished
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25 hover:bg-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-300 border-amber-500/25 hover:bg-amber-500/20'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${isPublished ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                      {isPublished ? 'Publicado' : 'Rascunho'}
                    </span>

                    <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(project.createdAt)}
                    </span>
                  </div>

                  {/* Title & Slug */}
                  <h3
                    onClick={() => navigateToEdit(project.id)}
                    className="text-base font-semibold text-white group-hover:text-cyan-300 transition-colors cursor-pointer line-clamp-1 mb-1"
                  >
                    {project.name}
                  </h3>
                  <p className="text-xs text-purple-300/80 font-mono truncate mb-3">
                    /p/{project.slug}
                  </p>

                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4">
                    {project.description || 'Sem descrição informada.'}
                  </p>

                  {/* Metrics preview */}
                  <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-[#191238]/70 border border-purple-500/10 mb-4 text-center">
                    <div>
                      <p className="text-[10px] text-slate-400">Visualizações</p>
                      <p className="text-xs font-bold text-cyan-300 font-mono">
                        {project.views.toLocaleString('pt-BR')}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400">Cliques</p>
                      <p className="text-xs font-bold text-purple-300 font-mono">
                        {project.clicks.toLocaleString('pt-BR')}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400">Prompts</p>
                      <p className="text-xs font-bold text-emerald-300 font-mono">
                        {project.promptsCopied.toLocaleString('pt-BR')}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions: Editar, Visualizar, Copiar Link */}
                <div className="pt-3 border-t border-purple-500/10 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    {/* Visualizar */}
                    <button
                      onClick={() => navigateToPublic(project.slug)}
                      title="Visualizar página pública"
                      className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-cyan-300 bg-purple-950/40 hover:bg-purple-900/60 border border-purple-500/15 flex items-center gap-1 transition-all"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Visualizar</span>
                    </button>

                    {/* Copiar Link */}
                    <button
                      onClick={(e) => handleCopyLink(project.slug, project.id, e)}
                      title="Copiar link"
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1 transition-all ${
                        isCopied
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          : 'bg-purple-950/40 hover:bg-purple-900/60 text-slate-300 border border-purple-500/15'
                      }`}
                    >
                      {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{isCopied ? 'Copiado!' : 'Link'}</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    {/* Duplicar */}
                    <button
                      onClick={() => duplicateProject(project.id)}
                      title="Duplicar projeto"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-purple-900/40 border border-transparent hover:border-purple-500/20 transition-colors"
                    >
                      <CopyPlus className="w-4 h-4" />
                    </button>

                    {/* Editar */}
                    <button
                      onClick={() => navigateToEdit(project.id)}
                      title="Editar projeto"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-purple-900/40 border border-transparent hover:border-purple-500/20 transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    {/* Excluir */}
                    <button
                      onClick={() => setProjectToDelete(project)}
                      title="Excluir projeto"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Projects List: Table View */}
      {!isLoading && viewMode === 'table' && (
        <div className="bg-[#140e2d]/90 backdrop-blur-sm border border-purple-500/15 rounded-2xl shadow-card-glow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-[#191238] border-b border-purple-500/15 text-[11px] font-mono uppercase tracking-wider text-purple-300/80">
                <tr>
                  <th className="px-5 py-3.5">Nome</th>
                  <th className="px-4 py-3.5">Data de Criação</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5">Visualizações</th>
                  <th className="px-5 py-3.5 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-500/10">
                {filteredProjects.map(project => {
                  const isCopied = copiedId === project.id;
                  const isPublished = project.status === 'published';

                  return (
                    <tr
                      key={project.id}
                      className="hover:bg-[#1c1542]/50 transition-colors group"
                    >
                      {/* Nome */}
                      <td className="px-5 py-4">
                        <div
                          onClick={() => navigateToEdit(project.id)}
                          className="cursor-pointer"
                        >
                          <p className="font-semibold text-white group-hover:text-cyan-300 transition-colors">
                            {project.name}
                          </p>
                          <p className="text-xs text-purple-300/70 font-mono">
                            skillhub.io/p/{project.slug}
                          </p>
                        </div>
                      </td>

                      {/* Data de criação */}
                      <td className="px-4 py-4 text-xs font-mono text-slate-400 whitespace-nowrap">
                        {formatDate(project.createdAt)}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        <button
                          onClick={() => togglePublishStatus(project.id)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border transition-colors ${
                            isPublished
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25'
                              : 'bg-amber-500/10 text-amber-300 border-amber-500/25'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${isPublished ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                          {isPublished ? 'Publicado' : 'Rascunho'}
                        </button>
                      </td>

                      {/* Visualizações */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 font-mono text-sm font-semibold text-cyan-300">
                          <Eye className="w-3.5 h-3.5 text-slate-400" />
                          <span>{project.views.toLocaleString('pt-BR')}</span>
                        </div>
                      </td>

                      {/* Ações: editar, visualizar e copiar link */}
                      <td className="px-5 py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => duplicateProject(project.id)}
                            title="Duplicar projeto"
                            className="p-2 rounded-lg text-slate-300 hover:text-cyan-300 hover:bg-purple-900/40 border border-purple-500/15 transition-colors"
                          >
                            <CopyPlus className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => navigateToEdit(project.id)}
                            title="Editar projeto"
                            className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-purple-900/40 border border-purple-500/15 transition-colors"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => navigateToPublic(project.slug)}
                            title="Visualizar página pública"
                            className="p-2 rounded-lg text-slate-300 hover:text-cyan-300 hover:bg-purple-900/40 border border-purple-500/15 transition-colors"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={(e) => handleCopyLink(project.slug, project.id, e)}
                            title="Copiar link da página"
                            className={`p-2 rounded-lg border transition-colors ${
                              isCopied
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                : 'text-slate-300 hover:text-white hover:bg-purple-900/40 border-purple-500/15'
                            }`}
                          >
                            {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>

                          <button
                            onClick={() => setProjectToDelete(project)}
                            title="Excluir projeto"
                            className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && filteredProjects.length === 0 && (
        <div className="bg-[#140e2d]/60 border border-purple-500/15 rounded-2xl p-12 text-center">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mx-auto mb-4">
            <Layers className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-1">Nenhum projeto encontrado</h3>
          <p className="text-sm text-slate-400 max-w-sm mx-auto mb-6">
            Não encontramos nenhum projeto com os termos buscados. Tente ajustar os filtros ou crie um novo projeto.
          </p>
          <button
            onClick={navigateToCreate}
            className="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl shadow-purple-glow"
          >
            + Criar Novo Projeto
          </button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(projectToDelete)}
        title="Excluir projeto"
        message={`Tem certeza que deseja excluir o projeto "${projectToDelete?.name}"? Esta ação não pode ser desfeita.`}
        confirmText="Sim, excluir"
        cancelText="Cancelar"
        confirmVariant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setProjectToDelete(null)}
      />
    </div>
  );
};
