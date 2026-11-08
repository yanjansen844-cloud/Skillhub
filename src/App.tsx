import React, { useState } from 'react';
import { ProjectProvider, useProjects } from './context/ProjectContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { DashboardView } from './views/DashboardView';
import { ProjectsView } from './views/ProjectsView';
import { ProjectEditorView } from './views/ProjectEditorView';
import { PublicProjectPage } from './components/public/PublicProjectPage';
import { LoginView } from './views/LoginView';
import { ToastContainer } from './components/common/ToastContainer';

const AppContent: React.FC = () => {
  const { currentView, activePublicSlug, projects, isAuthenticated, authLoading } = useProjects();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // If in public page view, render full-screen public page immediately
  if (currentView === 'public' && activePublicSlug) {
    return (
      <>
        <PublicProjectPage slug={activePublicSlug} />
        <ToastContainer />
      </>
    );
  }

  // Fallback for public page if no slug is set: use first project
  if (currentView === 'public' && !activePublicSlug && projects.length > 0) {
    return (
      <>
        <PublicProjectPage slug={projects[0].slug} />
        <ToastContainer />
      </>
    );
  }

  // While Firebase resolves authentication on startup, show sleek dark loader
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#080613] bg-grid flex flex-col items-center justify-center p-4 selection:bg-purple-500">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-cyan-400 p-[1.5px] shadow-purple-glow mb-4">
          <div className="w-full h-full bg-[#110c2a] rounded-[14px] flex items-center justify-center">
            <div className="w-5 h-5 border-2 border-white/30 border-t-cyan-400 rounded-full animate-spin" />
          </div>
        </div>
        <p className="font-mono text-xs text-purple-300/80 animate-pulse">
          Inicializando SkillHub...
        </p>
      </div>
    );
  }

  // If user is not authenticated or explicitly at login view, ALWAYS show Login screen
  if (!isAuthenticated || currentView === 'login') {
    return (
      <>
        <LoginView />
        <ToastContainer />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#090714] text-slate-100 flex flex-col lg:flex-row antialiased selection:bg-purple-500 selection:text-white">
      {/* Sidebar with only 3 options: Dashboard, Projetos, Sair */}
      <Sidebar
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        <Header onOpenMobileMenu={() => setMobileMenuOpen(true)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-grid bg-radial-vignette relative overflow-x-hidden">
          {/* Subtle ambient lighting orbs */}
          <div className="absolute top-10 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-1/2 right-10 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-7xl mx-auto">
            {currentView === 'dashboard' && <DashboardView />}
            {currentView === 'projects' && <ProjectsView />}
            {currentView === 'create' && <ProjectEditorView mode="create" />}
            {currentView === 'edit' && <ProjectEditorView mode="edit" />}
          </div>
        </main>
      </div>

      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <ProjectProvider>
      <AppContent />
    </ProjectProvider>
  );
}
