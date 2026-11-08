import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Project } from '../types';
import { projectService } from '../services/projectService';
import { authService, type AuthUser } from '../services/authService';
import { isFirebaseConfigured } from '../services/firebase';

interface ToastState {
  id: number;
  message: string;
  type?: 'success' | 'info' | 'cyan';
}

interface ProjectContextType {
  projects: Project[];
  isLoading: boolean;
  isFirebaseConnected: boolean;
  currentUser: AuthUser | null;
  currentView: 'dashboard' | 'projects' | 'create' | 'edit' | 'public' | 'login';
  setCurrentView: (view: 'dashboard' | 'projects' | 'create' | 'edit' | 'public' | 'login') => void;
  editingProjectId: string | null;
  setEditingProjectId: (id: string | null) => void;
  activePublicSlug: string | null;
  setActivePublicSlug: (slug: string | null) => void;
  isAuthenticated: boolean;
  login: (email?: string, password?: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  
  // Actions
  getProjectById: (id: string) => Project | undefined;
  getProjectBySlug: (slug: string) => Project | undefined;
  fetchPublicProject: (slug: string) => Promise<Project | null>;
  createProject: (data: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'views' | 'clicks' | 'promptsCopied'>) => Promise<Project>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  togglePublishStatus: (id: string) => Promise<void>;
  duplicateProject: (id: string) => Promise<void>;
  
  // Interactions
  recordCopyPrompt: (projectId?: string) => void;
  recordClickLink: (projectId?: string) => void;
  recordView: (projectId?: string) => void;

  // Toast
  toasts: ToastState[];
  showToast: (message: string, type?: 'success' | 'info' | 'cyan') => void;
  removeToast: (id: number) => void;

  // Navigation helpers
  navigateToDashboard: () => void;
  navigateToProjects: () => void;
  navigateToCreate: () => void;
  navigateToEdit: (id: string) => void;
  navigateToPublic: (slug: string) => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true); // default true for immediate preview or syncs with auth
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [currentView, setCurrentView] = useState<'dashboard' | 'projects' | 'create' | 'edit' | 'public' | 'login'>('dashboard');
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [activePublicSlug, setActivePublicSlug] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastState[]>([]);

  const isFirebaseConnected = isFirebaseConfigured();

  // Listen to Auth state
  useEffect(() => {
    const unsubscribe = authService.onAuthChange((user) => {
      setCurrentUser(user);
      if (user) {
        setIsAuthenticated(true);
      }
    });
    return () => unsubscribe();
  }, []);

  // Fetch real projects from Firestore on mount
  useEffect(() => {
    let isMounted = true;
    const loadProjects = async () => {
      setIsLoading(true);
      try {
        const data = await projectService.getAll();
        if (isMounted) {
          setProjects(data);
        }
      } catch (err) {
        console.error('Erro ao carregar projetos:', err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadProjects();
    return () => {
      isMounted = false;
    };
  }, []);

  // Handle clean URL routing (without #)
  useEffect(() => {
    const handleLocation = () => {
      let path = window.location.pathname;
      const hash = window.location.hash;

      // Normalize any legacy hash
      if (hash && hash.startsWith('#/')) {
        path = hash.replace('#', '');
        window.history.replaceState(null, '', path);
      }

      if (path.startsWith('/p/')) {
        const slug = path.replace('/p/', '').replace(/\/$/, '');
        if (slug) {
          setActivePublicSlug(slug);
          setCurrentView('public');
        }
      } else if (path === '/login') {
        setCurrentView('login');
      } else if (path === '/novo-projeto' || path === '/criar' || path === '/new') {
        setEditingProjectId(null);
        setCurrentView('create');
      } else if (path.startsWith('/editar/')) {
        const id = path.replace('/editar/', '').replace(/\/$/, '');
        if (id) {
          setEditingProjectId(id);
          setCurrentView('edit');
        }
      } else if (path === '/projetos' || path === '/projects') {
        setEditingProjectId(null);
        setCurrentView('projects');
      } else if (path === '/dashboard' || path === '/') {
        setEditingProjectId(null);
        setCurrentView('dashboard');
      }
    };

    handleLocation();
    window.addEventListener('popstate', handleLocation);
    window.addEventListener('hashchange', handleLocation);
    return () => {
      window.removeEventListener('popstate', handleLocation);
      window.removeEventListener('hashchange', handleLocation);
    };
  }, []);

  const showToast = (message: string, type: 'success' | 'info' | 'cyan' = 'success') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 3200);
  };

  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const getProjectById = (id: string) => {
    return projects.find(p => p.id === id);
  };

  const getProjectBySlug = (slug: string) => {
    return projects.find(p => p.slug === slug);
  };

  // Direct fetch for public page traffic
  const fetchPublicProject = async (slug: string): Promise<Project | null> => {
    const existing = projects.find(p => p.slug === slug);
    if (existing) return existing;
    return await projectService.getBySlug(slug);
  };

  const createProject = async (
    data: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'views' | 'clicks' | 'promptsCopied'>
  ): Promise<Project> => {
    const newProject: Project = {
      ...data,
      id: `proj-${Date.now()}`,
      views: 0,
      clicks: 0,
      promptsCopied: 0,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      blocks: data.blocks || [],
    };

    // Optimistic UI update
    setProjects(prev => [newProject, ...prev]);
    // Save to Firestore
    await projectService.create(newProject);
    showToast(`Projeto "${newProject.name}" salvo no Firebase!`, 'cyan');
    return newProject;
  };

  const updateProject = async (id: string, updates: Partial<Project>) => {
    const updatedAt = new Date().toISOString().split('T')[0];
    setProjects(prev =>
      prev.map(p => (p.id === id ? { ...p, ...updates, updatedAt } : p))
    );
    await projectService.update(id, updates);
    showToast('Alterações salvas com sucesso!', 'success');
  };

  const deleteProject = async (id: string) => {
    const proj = projects.find(p => p.id === id);
    setProjects(prev => prev.filter(p => p.id !== id));
    await projectService.delete(id);
    showToast(`Projeto "${proj?.name || ''}" removido.`, 'info');
  };

  const togglePublishStatus = async (id: string) => {
    const proj = projects.find(p => p.id === id);
    if (!proj) return;
    const nextStatus = proj.status === 'published' ? 'draft' : 'published';
    await updateProject(id, { status: nextStatus });
  };

  const duplicateProject = async (id: string) => {
    const orig = projects.find(p => p.id === id);
    if (!orig) return;
    const duplicated: Project = {
      ...orig,
      id: `proj-${Date.now()}`,
      name: `${orig.name} (Cópia)`,
      slug: `${orig.slug}-copia-${Math.floor(Math.random() * 1000)}`,
      pageTitle: `${orig.pageTitle} (Cópia)`,
      status: 'draft',
      views: 0,
      clicks: 0,
      promptsCopied: 0,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      blocks: JSON.parse(JSON.stringify(orig.blocks)),
    };
    setProjects(prev => [duplicated, ...prev]);
    await projectService.create(duplicated);
    showToast('Projeto duplicado no Firebase!', 'info');
  };

  const recordCopyPrompt = (projectId?: string) => {
    if (!projectId) return;
    setProjects(prev =>
      prev.map(p => (p.id === projectId ? { ...p, promptsCopied: p.promptsCopied + 1 } : p))
    );
    projectService.recordPromptCopy(projectId);
  };

  const recordClickLink = (projectId?: string) => {
    if (!projectId) return;
    setProjects(prev =>
      prev.map(p => (p.id === projectId ? { ...p, clicks: p.clicks + 1 } : p))
    );
    projectService.recordClick(projectId);
  };

  const recordView = (projectId?: string) => {
    if (!projectId) return;
    setProjects(prev =>
      prev.map(p => (p.id === projectId ? { ...p, views: p.views + 1 } : p))
    );
    projectService.recordView(projectId);
  };

  const navigateToDashboard = () => {
    window.history.pushState(null, '', '/dashboard');
    setCurrentView('dashboard');
    setEditingProjectId(null);
  };

  const navigateToProjects = () => {
    window.history.pushState(null, '', '/projetos');
    setCurrentView('projects');
    setEditingProjectId(null);
  };

  const navigateToCreate = () => {
    window.history.pushState(null, '', '/novo-projeto');
    setEditingProjectId(null);
    setCurrentView('create');
  };

  const navigateToEdit = (id: string) => {
    window.history.pushState(null, '', `/editar/${id}`);
    setEditingProjectId(id);
    setCurrentView('edit');
  };

  const navigateToPublic = (slug: string) => {
    window.history.pushState(null, '', `/p/${slug}`);
    setActivePublicSlug(slug);
    setCurrentView('public');
  };

  const login = async (email?: string, password?: string) => {
    try {
      const user = await authService.signIn(email || 'criador@skillhub.io', password || '123456');
      setCurrentUser(user);
      setIsAuthenticated(true);
      window.history.pushState(null, '', '/dashboard');
      setCurrentView('dashboard');
      showToast('Acesso autorizado! Bem-vindo ao SkillHub.', 'cyan');
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Falha na autenticação';
      showToast(errorMsg, 'info');
      throw err;
    }
  };

  const loginWithGoogle = async () => {
    try {
      const user = await authService.signInGoogle();
      setCurrentUser(user);
      setIsAuthenticated(true);
      window.history.pushState(null, '', '/dashboard');
      setCurrentView('dashboard');
      showToast(`Bem-vindo, ${user.displayName}!`, 'cyan');
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Falha no login com Google';
      showToast(errorMsg, 'info');
    }
  };

  const register = async (email: string, pass: string) => {
    try {
      const user = await authService.signUp(email, pass);
      setCurrentUser(user);
      setIsAuthenticated(true);
      window.history.pushState(null, '', '/dashboard');
      setCurrentView('dashboard');
      showToast('Conta criada com sucesso no Firebase!', 'cyan');
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Falha no cadastro';
      showToast(errorMsg, 'info');
      throw err;
    }
  };

  const logout = async () => {
    await authService.signOut();
    setCurrentUser(null);
    setIsAuthenticated(false);
    window.history.pushState(null, '', '/login');
    setCurrentView('login');
    showToast('Sessão encerrada com sucesso.', 'info');
  };

  return (
    <ProjectContext.Provider
      value={{
        projects,
        isLoading,
        isFirebaseConnected,
        currentUser,
        currentView,
        setCurrentView,
        editingProjectId,
        setEditingProjectId,
        activePublicSlug,
        setActivePublicSlug,
        isAuthenticated,
        login,
        loginWithGoogle,
        register,
        logout,
        getProjectById,
        getProjectBySlug,
        fetchPublicProject,
        createProject,
        updateProject,
        deleteProject,
        togglePublishStatus,
        duplicateProject,
        recordCopyPrompt,
        recordClickLink,
        recordView,
        toasts,
        showToast,
        removeToast,
        navigateToDashboard,
        navigateToProjects,
        navigateToCreate,
        navigateToEdit,
        navigateToPublic,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export const useProjects = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProjects deve ser utilizado dentro de um ProjectProvider');
  }
  return context;
};
