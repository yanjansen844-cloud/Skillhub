import React, { useState, useEffect } from 'react';
import { useProjects } from '../../context/ProjectContext';
import type { ToolBlock, PromptBlock, LinkBlock, TextBlock, Project } from '../../types';
import { sanitizeUrl } from '../../utils/security';
import {
  Copy,
  Check,
  ExternalLink,
  Layers,
  Sparkles,
  ArrowLeft,
  Share2,
  Terminal,
  Wrench,
  Link2,
  ChevronRight,
  Smartphone,
  Monitor,
  Edit3
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface Props {
  slug: string;
}

export const PublicProjectPage: React.FC<Props> = ({ slug }) => {
  const {
    getProjectBySlug,
    fetchPublicProject,
    navigateToDashboard,
    navigateToEdit,
    recordCopyPrompt,
    recordClickLink,
    recordView,
    showToast,
    currentUser,
    authLoading,
    isAuthenticated,
  } = useProjects();

  const [project, setProject] = useState<Project | null>(() => getProjectBySlug(slug) || null);
  const [loading, setLoading] = useState<boolean>(!project);
  const [copiedBlockId, setCopiedBlockId] = useState<string | null>(null);
  const [deviceMode, setDeviceMode] = useState<'responsive' | 'mobile'>('responsive');
  const [copiedUrl, setCopiedUrl] = useState(false);

  const isOwner = Boolean(project && currentUser && currentUser.uid === project.ownerId);

  useEffect(() => {
    // Aguarda o Firebase resolver a sessão: assim o dono não conta visualização da própria página
    if (authLoading) return;
    let isMounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetchPublicProject(slug);
        if (!isMounted) return;
        setProject(res);
        if (res) recordView(res);
      } catch (err) {
        console.error('Erro ao carregar página pública:', err);
        if (isMounted) setProject(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    load();
    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, authLoading]);

  const handleCopyPrompt = async (promptText: string, blockId: string) => {
    try {
      await navigator.clipboard.writeText(promptText);
    } catch {
      showToast('Não foi possível copiar. Selecione o texto manualmente.', 'error');
      return;
    }
    setCopiedBlockId(blockId);
    if (project) {
      recordCopyPrompt(project);
    }
    showToast('Prompt copiado com sucesso!', 'cyan');

    confetti({
      particleCount: 25,
      spread: 40,
      origin: { y: 0.85 },
      colors: ['#22d3ee', '#c084fc', '#ffffff']
    });

    setTimeout(() => {
      setCopiedBlockId(null);
    }, 2500);
  };

  const handleCopyPublicUrl = () => {
    if (!project) return;
    const url = `${window.location.origin}/p/${project.slug}`;
    navigator.clipboard.writeText(url);
    setCopiedUrl(true);
    showToast('Link da página copiado!', 'cyan');
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleLinkClick = (rawUrl: string) => {
    const safeUrl = sanitizeUrl(rawUrl);
    if (safeUrl === '#') {
      showToast('Este link é inválido ou não é seguro.', 'error');
      return;
    }
    if (project) {
      recordClickLink(project);
    }
    window.open(safeUrl, '_blank', 'noopener,noreferrer');
  };

  const renderPromptWithPlaceholders = (text: string) => {
    const parts = text.split(/(\[[^\]]+\])/g);
    return parts.map((part, i) => {
      if (part.startsWith('[') && part.endsWith(']')) {
        return (
          <span
            key={i}
            className="bg-cyan-500/20 text-cyan-300 border border-cyan-500/35 px-1 py-0.5 rounded font-semibold text-[11px] sm:text-xs"
          >
            {part}
          </span>
        );
      }
      return part;
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080612] bg-grid text-white flex flex-col items-center justify-center p-6">
        <div className="w-10 h-10 border-2 border-purple-500/30 border-t-cyan-400 rounded-full animate-spin mb-4" />
        <p className="text-xs font-mono text-slate-400">Carregando recursos do SkillHub...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-[#090714] text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mb-4">
          <Layers className="w-8 h-8" />
        </div>
        <h1 className="text-xl font-bold mb-2">Página não encontrada</h1>
        <p className="text-sm text-slate-400 mb-6 max-w-sm">
          O link que você tentou acessar não existe ou foi removido.
        </p>
        {isAuthenticated && (
          <button
            onClick={navigateToDashboard}
            className="px-4 py-2 text-sm font-semibold text-white bg-purple-600 rounded-xl shadow-purple-glow cursor-pointer"
          >
            Voltar ao Painel
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080612] bg-grid text-slate-100 flex flex-col items-center selection:bg-purple-500 selection:text-white">
      {/* Barra de controle: visível apenas para o dono do projeto */}
      {isOwner && (
      <div className="w-full bg-[#110c28]/90 backdrop-blur-md border-b border-purple-500/15 py-2.5 px-4 sticky top-0 z-40 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={navigateToDashboard}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-slate-300 hover:text-white bg-purple-950/50 hover:bg-purple-900/60 border border-purple-500/20 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="font-medium">Painel</span>
          </button>
          <span className="hidden sm:inline text-purple-400/50">|</span>
          <span className="hidden sm:inline text-slate-400">
            Prévia Pública: <strong className="text-white font-mono">/p/{project.slug}</strong>
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Device toggle */}
          <div className="hidden sm:flex items-center bg-[#18113a] p-0.5 rounded-lg border border-purple-500/20">
            <button
              onClick={() => setDeviceMode('responsive')}
              title="Visualização Tela Cheia Responsiva"
              className={`p-1.5 rounded-md transition-colors ${
                deviceMode === 'responsive' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setDeviceMode('mobile')}
              title="Simulador de Tela Mobile (iPhone / Android)"
              className={`p-1.5 rounded-md transition-colors ${
                deviceMode === 'mobile' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={() => navigateToEdit(project.id)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-slate-300 hover:text-white bg-purple-950/50 hover:bg-purple-900/60 border border-purple-500/20 transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden xs:inline">Editar</span>
          </button>

          <button
            onClick={handleCopyPublicUrl}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-cyan-300 hover:text-cyan-200 bg-cyan-950/40 hover:bg-cyan-900/50 border border-cyan-500/30 transition-colors font-medium"
          >
            {copiedUrl ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{copiedUrl ? 'Copiado!' : 'Compartilhar'}</span>
          </button>
        </div>
      </div>
      )}

      {isOwner && project.status === 'draft' && (
        <div className="w-full bg-amber-500/10 border-b border-amber-500/30 text-amber-200 text-xs text-center py-2 px-4">
          Rascunho: só você consegue ver esta página. Publique o projeto para liberar o acesso aos seguidores.
        </div>
      )}

      {/* Main Container Wrapper */}
      <div
        className={`w-full transition-all duration-300 flex-1 flex flex-col items-center py-8 px-4 sm:px-6 ${
          deviceMode === 'mobile'
            ? 'max-w-[420px] my-6 rounded-[36px] border-4 border-[#281f4f] bg-[#0c091f] shadow-2xl p-4 sm:p-5'
            : 'max-w-2xl'
        }`}
      >
        {/* Ambient top glow */}
        <div className="absolute top-16 left-1/2 -translate-x-1/2 w-96 h-56 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Brand Header Badge */}
        <div className="mb-6 flex items-center justify-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#160f33] border border-purple-500/25 shadow-purple-glow/40">
            <div className="w-4 h-4 rounded-md bg-gradient-to-tr from-purple-500 to-cyan-400 flex items-center justify-center">
              <Layers className="w-2.5 h-2.5 text-white" />
            </div>
            <span className="text-xs font-semibold text-slate-200 tracking-tight">
              Skill<span className="text-purple-400">Hub</span>
            </span>
          </div>
        </div>

        {/* Page Title & Header Card */}
        <div className="text-center mb-8 relative z-10 space-y-3 w-full">
          <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-white tracking-tight leading-tight">
            {project.pageTitle || project.name}
          </h1>

          {project.description && (
            <p className="text-sm text-slate-300 leading-relaxed max-w-lg mx-auto">
              {project.description}
            </p>
          )}

          <div className="flex items-center justify-center gap-2 pt-1 text-[11px] text-purple-300/80 font-mono">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              Acesso Imediato
            </span>
            <span className="text-slate-600">•</span>
            <span>Link do Vídeo</span>
          </div>
        </div>

        {/* Dynamic Content Blocks */}
        <div className="w-full space-y-4 relative z-10">
          {project.blocks && project.blocks.map((block) => {
            // 1. TEXT BLOCK
            if (block.type === 'text') {
              const textBlock = block as TextBlock;
              return (
                <div
                  key={block.id}
                  className="bg-[#130d2a]/80 backdrop-blur-sm border border-purple-500/15 rounded-2xl p-4 sm:p-5 shadow-card-glow"
                >
                  {textBlock.title && (
                    <h3 className="text-sm font-semibold text-purple-300 tracking-tight mb-2">
                      {textBlock.title}
                    </h3>
                  )}
                  <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                    {textBlock.content}
                  </p>
                </div>
              );
            }

            // 2. TOOL BLOCK
            if (block.type === 'tool') {
              const toolBlock = block as ToolBlock;
              return (
                <div
                  key={block.id}
                  className="group relative bg-[#150e30]/90 backdrop-blur-sm border border-purple-500/20 hover:border-purple-400/40 rounded-2xl p-5 shadow-card-glow transition-all duration-300 hover:-translate-y-0.5"
                >
                  <div className="flex items-start justify-between gap-3 mb-2.5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600/30 to-indigo-600/30 border border-purple-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                        <Wrench className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-white tracking-tight group-hover:text-cyan-300 transition-colors">
                          {toolBlock.name}
                        </h3>
                        {toolBlock.category && (
                          <span className="text-[11px] font-mono text-purple-400">
                            {toolBlock.category}
                          </span>
                        )}
                      </div>
                    </div>

                    {toolBlock.badge && (
                      <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 shrink-0">
                        {toolBlock.badge}
                      </span>
                    )}
                  </div>

                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-4">
                    {toolBlock.description}
                  </p>

                  <button
                    onClick={() => handleLinkClick(toolBlock.url)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold text-white bg-[#1e1544] hover:bg-gradient-to-r hover:from-purple-600 hover:to-cyan-600 border border-purple-500/25 transition-all duration-200 group-hover:shadow-purple-glow"
                  >
                    <span>Acessar Ferramenta</span>
                    <ExternalLink className="w-3.5 h-3.5 text-cyan-300" />
                  </button>
                </div>
              );
            }

            // 3. PROMPT BLOCK (Copiável com botão copiar)
            if (block.type === 'prompt') {
              const promptBlock = block as PromptBlock;
              const isCopied = copiedBlockId === block.id;

              return (
                <div
                  key={block.id}
                  className="bg-[#120c29] border border-cyan-500/25 rounded-2xl overflow-hidden shadow-card-glow"
                >
                  {/* Top Prompt Header */}
                  <div className="bg-[#191136] px-4 py-3 border-b border-purple-500/15 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <Terminal className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span className="text-xs sm:text-sm font-semibold text-white truncate">
                        {promptBlock.title}
                      </span>
                      {promptBlock.badge && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 hidden xs:inline">
                          {promptBlock.badge}
                        </span>
                      )}
                    </div>

                    {/* Copiar Prompt Button */}
                    <button
                      onClick={() => handleCopyPrompt(promptBlock.promptText, block.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 shrink-0 shadow-sm ${
                        isCopied
                          ? 'bg-emerald-500 text-slate-950 font-bold scale-105 shadow-emerald-500/30'
                          : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 hover:shadow-cyan-glow'
                      }`}
                    >
                      {isCopied ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Copiado!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copiar Prompt</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Prompt Text Block */}
                  <div className="p-4 sm:p-5 bg-[#090614]">
                    <div className="font-mono text-xs sm:text-sm text-cyan-200/90 whitespace-pre-wrap leading-relaxed select-all">
                      {renderPromptWithPlaceholders(promptBlock.promptText)}
                    </div>

                    {promptBlock.instruction && (
                      <div className="mt-3 pt-3 border-t border-purple-500/10 flex items-start gap-2 text-[11px] text-purple-300/80">
                        <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                        <span>{promptBlock.instruction}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            }

            // 4. LINK BLOCK
            if (block.type === 'link') {
              const linkBlock = block as LinkBlock;
              return (
                <div
                  key={block.id}
                  onClick={() => handleLinkClick(linkBlock.url)}
                  className={`group cursor-pointer p-4 rounded-2xl border transition-all duration-300 flex items-center justify-between gap-4 ${
                    linkBlock.highlighted
                      ? 'bg-gradient-to-r from-purple-900/30 via-[#1b123d] to-cyan-950/30 border-cyan-500/40 hover:border-cyan-400 shadow-cyan-glow/30'
                      : 'bg-[#150e30]/80 border-purple-500/15 hover:border-purple-400/30 hover:bg-[#1a123b]'
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/25 flex items-center justify-center text-cyan-400 shrink-0 group-hover:scale-105 transition-transform">
                      <Link2 className="w-5 h-5" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-semibold text-white group-hover:text-cyan-300 transition-colors truncate">
                          {linkBlock.title}
                        </h4>
                        {linkBlock.badge && (
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 shrink-0">
                            {linkBlock.badge}
                          </span>
                        )}
                      </div>
                      {linkBlock.description && (
                        <p className="text-xs text-slate-400 truncate mt-0.5">
                          {linkBlock.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="w-8 h-8 rounded-lg bg-purple-950/60 border border-purple-500/20 flex items-center justify-center text-slate-400 group-hover:text-white group-hover:translate-x-1 transition-all shrink-0">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              );
            }

            return null;
          })}
        </div>

        {/* Footer */}
        <footer className="mt-12 text-center relative z-10 pt-6 border-t border-purple-500/10 w-full">
          <div className="inline-flex items-center gap-2 text-xs text-slate-400 mb-2">
            <span>Criado com</span>
            <span className="font-display font-bold text-white tracking-tight flex items-center gap-1">
              Skill<span className="text-purple-400">Hub</span>
            </span>
          </div>
          <p className="text-[11px] text-slate-400">
            Painel de recursos & links para criadores de conteúdo do Instagram e TikTok
          </p>
        </footer>
      </div>
    </div>
  );
};
