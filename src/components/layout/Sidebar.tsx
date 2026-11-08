import React, { useState } from 'react';
import { LayoutDashboard, FolderGit2, LogOut, Layers } from 'lucide-react';
import { useProjects } from '../../context/ProjectContext';
import { ConfirmModal } from '../common/ConfirmModal';

interface SidebarProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, onCloseMobile }) => {
  const { currentView, navigateToDashboard, navigateToProjects, logout } = useProjects();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const isDashboardActive = currentView === 'dashboard';
  const isProjectsActive = currentView === 'projects' || currentView === 'create' || currentView === 'edit';

  const handleLogout = () => {
    setShowLogoutModal(false);
    logout();
    if (onCloseMobile) onCloseMobile();
  };

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      active: isDashboardActive,
      onClick: () => {
        navigateToDashboard();
        if (onCloseMobile) onCloseMobile();
      },
    },
    {
      id: 'projects',
      label: 'Projetos',
      icon: FolderGit2,
      active: isProjectsActive,
      onClick: () => {
        navigateToProjects();
        if (onCloseMobile) onCloseMobile();
      },
    },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-[#0d091f] border-r border-purple-500/15 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand / Logo */}
        <div className="pt-6 pb-5 px-6 flex items-center gap-3 border-b border-purple-500/10">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-cyan-400 p-[1px] flex items-center justify-center shadow-purple-glow">
            <div className="w-full h-full bg-[#110c29] rounded-[11px] flex items-center justify-center">
              <Layers className="w-5 h-5 text-cyan-400" />
            </div>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-display font-bold text-lg text-white tracking-tight">
                Skill<span className="text-purple-400">Hub</span>
              </span>
              <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                PRO
              </span>
            </div>
            <span className="text-[11px] text-slate-400 font-medium">Gestão & Bio Páginas</span>
          </div>
        </div>

        {/* Navigation - EXACTLY 3 items */}
        <nav className="flex-1 px-4 py-6 space-y-1.5">
          <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-purple-300/60 font-mono">
            Navegação Principal
          </p>

          {navItems.map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={item.onClick}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative ${
                  item.active
                    ? 'text-white bg-purple-600/20 border border-purple-500/30 shadow-purple-glow/50'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-purple-950/30'
                }`}
              >
                {item.active && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-gradient-to-b from-purple-400 to-cyan-400 rounded-r-full" />
                )}
                <Icon
                  className={`w-5 h-5 transition-colors ${
                    item.active ? 'text-cyan-400' : 'text-slate-400 group-hover:text-purple-300'
                  }`}
                />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Bottom section with only "Sair" as required */}
        <div className="p-4 border-t border-purple-500/10 space-y-3">
          {/* Subtle user badge preview */}
          <div className="p-2.5 rounded-xl bg-[#140e2e] border border-purple-500/10 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-xs font-bold text-white shadow-sm">
              SH
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-200 truncate">Creator Studio</p>
              <p className="text-[11px] text-slate-400 truncate flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                Online
              </p>
            </div>
          </div>

          {/* 3rd item: Sair */}
          <button
            onClick={() => setShowLogoutModal(true)}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-red-300 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all duration-200 group"
          >
            <LogOut className="w-5 h-5 text-slate-400 group-hover:text-red-400 transition-colors" />
            <span>Sair</span>
          </button>
        </div>
      </aside>

      {/* Logout Confirmation Modal */}
      <ConfirmModal
        isOpen={showLogoutModal}
        title="Encerrar sessão"
        message="Tem certeza que deseja sair do painel do SkillHub? Seus dados salvos permanecerão gravados no navegador."
        confirmText="Confirmar e Sair"
        cancelText="Voltar"
        confirmVariant="danger"
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutModal(false)}
      />
    </>
  );
};
