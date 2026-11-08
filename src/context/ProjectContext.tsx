import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import type { MetricKey, Project } from '../types';
import { projectService, today } from '../services/projectService';
import { authService, type AuthUser } from '../services/authService';

export type ToastType = 'success' | 'info' | 'cyan' | 'error';

interface ToastState {
  id: number;
  message: string;
  type?: ToastType;
}

type View = 'dashboard' | 'projects' | 'create' | 'edit' | 'public' | 'login';

type NewProjectData = Omit<
  Project,
  'id' | 'ownerId' | 'createdAt' | 'updatedAt' | 'views' | 'clicks' | 'promptsCopied'
>;

interface ProjectContextType {
  projects: Project[];
  isLoading: boolean;
  currentUser: AuthUser | null;
  currentView: View;
  editingProjectId: string | null;
  activePublicSlug: string | null;
  isAuthenticated: boolean;
  authLoading: boolean;
  login: (email: string, password: string, remember?: boolean) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  register: (email: string, password: string, remember?: boolean) => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  logout: () => Promise<void>;

  // Actions
  getProjectById: (id: string) => Project | undefined;
  getProjectBySlug: (slug: string) => Project | undefined;
  fetchPublicProject: (slug: string) => Promise<Project | null>;
  createProject: (data: NewProjectData) => Promise<Project>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  togglePublishStatus: (id: string) => Promise<void>;
  duplicateProject: (id: string) => Promise<void>;

  // Interactions (métricas reais)
  recordCopyPrompt: (project: Project) => void;
  recordClickLink: (project: Project) => void;
  recordView: (project: Project) => void;

  // Toast
  toasts: ToastState[];
  showToast: (message: string, type?: ToastType) => void;
  removeToast: (id: number) => void;

  // Navigation helpers
  navigateToDashboard: () => void;
  navigateToProjects: () => void;
  navigateToCreate: () => void;
  navigateToEdit: (id: string) => void;
  navigateToPublic: (slug: string) => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

const VIEWED_KEY_PREFIX = 'skillhub_viewed_';

const errorMessage = (err: unknown, fallback: string): string => {
  if (err instanceof Error && err.name === 'SlugTakenError') return err.message;
  const code = typeof err === 'object' && err && 'code' in err ? String((err as { code: unknown }).code) : '';
  if (code === 'permission-denied') return 'Permissão negada pelo servidor. Faça login novamente.';
  if (code === 'unavailable') return 'Sem conexão com o servidor. Tente novamente.';
  return fallback;
};

const randomSuffix = () => crypto.getRandomValues(new Uint32Array(1))[0].toString(36).slice(0, 5);

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [currentView, setCurrentView] = useState<View>('login');
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [activePublicSlug, setActivePublicSlug] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastState[]>([]);
  const projectsRef = useRef<Project[]>([]);
  useEffect(() => {
    projectsRef.current = projects;
  }, [projects]);

  const isAuthenticated = Boolean(currentUser);

  const removeToast = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => removeToast(id), type === 'error' ? 6000 : 3200);
  }, [removeToast]);

  // Sessão do Firebase Auth
  useEffect(() => {
    const unsubscribe = authService.onAuthChange((user) => {
      setCurrentUser(user);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Projetos do usuário logado, em tempo real
  useEffect(() => {
    if (!currentUser) {
      setProjects([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    const unsubscribe = projectService.subscribeToOwnerProjects(
      currentUser.uid,
      (list) => {
        setProjects(list);
        setIsLoading(false);
      },
      (err) => {
        console.error('Erro ao carregar projetos:', err);
        setIsLoading(false);
        showToast(errorMessage(err, 'Não foi possível carregar seus projetos.'), 'error');
      }
    );
    return () => unsubscribe();
  }, [currentUser, showToast]);

  // Roteamento por URL + proteção de rotas
  useEffect(() => {
    const handleLocation = () => {
      let path = window.location.pathname;
      const hash = window.location.hash;

      if (hash && hash.startsWith('#/')) {
        path = hash.replace('#', '');
        window.history.replaceState(null, '', path);
      }

      // Rota pública de projeto (/p/:slug) - sempre acessível sem login
      if (path.startsWith('/p/')) {
        const slug = decodeURIComponent(path.replace('/p/', '').replace(/\/$/, ''));
        if (slug) {
          setActivePublicSlug(slug);
          setCurrentView('public');
          return;
        }
      }
      setActivePublicSlug(null);

      if (authLoading) return;

      if (!isAuthenticated) {
        if (path !== '/login') window.history.replaceState(null, '', '/login');
        setCurrentView('login');
        return;
      }

      if (path === '/dashboard') {
        setEditingProjectId(null);
        setCurrentView('dashboard');
      } else if (path === '/novo-projeto' || path === '/criar' || path === '/new') {
        setEditingProjectId(null);
        setCurrentView('create');
      } else if (path.startsWith('/editar/') && path.replace('/editar/', '').replace(/\/$/, '')) {
        setEditingProjectId(path.replace('/editar/', '').replace(/\/$/, ''));
        setCurrentView('edit');
      } else if (path === '/projetos' || path === '/projects') {
        setEditingProjectId(null);
        setCurrentView('projects');
      } else {
        window.history.replaceState(null, '', '/dashboard');
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
  }, [authLoading, isAuthenticated]);

  const getProjectById = (id: string) => projects.find(p => p.id === id);
  const getProjectBySlug = (slug: string) => projects.find(p => p.slug === slug);

  const fetchPublicProject = async (slug: string): Promise<Project | null> => {
    const own = projectsRef.current.find(p => p.slug === slug);
    if (own) return own;
    return projectService.getBySlug(slug);
  };

  const requireUser = (): AuthUser => {
    if (!currentUser) throw new Error('Sessão expirada. Faça login novamente.');
    return currentUser;
  };

  const createProject = async (data: NewProjectData): Promise<Project> => {
    const user = requireUser();
    const now = today();
    const newProject: Project = {
      ...data,
      id: projectService.newId(),
      ownerId: user.uid,
      views: 0,
      clicks: 0,
      promptsCopied: 0,
      createdAt: now,
      updatedAt: now,
      blocks: data.blocks || [],
    };

    try {
      await projectService.create(newProject);
    } catch (err) {
      showToast(errorMessage(err, 'Não foi possível salvar o projeto.'), 'error');
      throw err;
    }
    showToast(`Projeto "${newProject.name}" salvo!`, 'cyan');
    return newProject;
  };

  const updateProject = async (id: string, updates: Partial<Project>) => {
    const current = projectsRef.current.find(p => p.id === id);
    if (!current) throw new Error('Projeto não encontrado.');

    // Atualização otimista com rollback em caso de falha
    setProjects(prev => prev.map(p => (p.id === id ? { ...p, ...updates } : p)));
    try {
      await projectService.update(current, updates);
    } catch (err) {
      setProjects(prev => prev.map(p => (p.id === id ? current : p)));
      showToast(errorMessage(err, 'Não foi possível salvar as alterações.'), 'error');
      throw err;
    }
    showToast('Alterações salvas com sucesso!', 'success');
  };

  const deleteProject = async (id: string) => {
    const proj = projectsRef.current.find(p => p.id === id);
    if (!proj) return;
    setProjects(prev => prev.filter(p => p.id !== id));
    try {
      await projectService.delete(proj);
      showToast(`Projeto "${proj.name}" removido.`, 'info');
    } catch (err) {
      setProjects(prev => (prev.some(p => p.id === id) ? prev : [proj, ...prev]));
      showToast(errorMessage(err, 'Não foi possível excluir o projeto.'), 'error');
    }
  };

  const togglePublishStatus = async (id: string) => {
    const proj = projectsRef.current.find(p => p.id === id);
    if (!proj) return;
    try {
      await updateProject(id, { status: proj.status === 'published' ? 'draft' : 'published' });
    } catch {
      // toast já exibido em updateProject
    }
  };

  const duplicateProject = async (id: string) => {
    const orig = projectsRef.current.find(p => p.id === id);
    if (!orig) return;
    try {
      await createProject({
        name: `${orig.name} (Cópia)`.slice(0, 120),
        slug: `${orig.slug.slice(0, 66)}-copia-${randomSuffix()}`,
        pageTitle: `${orig.pageTitle} (Cópia)`.slice(0, 200),
        description: orig.description,
        status: 'draft',
        categoryBadge: orig.categoryBadge,
        blocks: JSON.parse(JSON.stringify(orig.blocks)),
      });
    } catch {
      // toast já exibido em createProject
    }
  };

  // --- Métricas reais ---
  // O próprio dono não gera métricas ao visualizar/testar a sua página.
  const isOwnerOf = (project: Project) => Boolean(currentUser && currentUser.uid === project.ownerId);

  const recordMetric = (project: Project, metric: MetricKey) => {
    if (project.status !== 'published' || isOwnerOf(project)) return;
    projectService.recordMetric(project.id, metric);
  };

  const recordView = (project: Project) => {
    if (project.status !== 'published' || isOwnerOf(project)) return;
    // Uma visualização por projeto por sessão do navegador
    const key = `${VIEWED_KEY_PREFIX}${project.id}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, '1');
    } catch {
      // sessionStorage indisponível: registra mesmo assim
    }
    projectService.recordMetric(project.id, 'views');
  };

  const recordCopyPrompt = (project: Project) => recordMetric(project, 'promptsCopied');
  const recordClickLink = (project: Project) => recordMetric(project, 'clicks');

  // --- Navegação ---
  const go = (path: string, view: View, editId: string | null = null) => {
    window.history.pushState(null, '', path);
    setEditingProjectId(editId);
    setActivePublicSlug(null);
    setCurrentView(view);
  };

  const navigateToDashboard = () => go('/dashboard', 'dashboard');
  const navigateToProjects = () => go('/projetos', 'projects');
  const navigateToCreate = () => go('/novo-projeto', 'create');
  const navigateToEdit = (id: string) => go(`/editar/${id}`, 'edit', id);
  const navigateToPublic = (slug: string) => {
    window.history.pushState(null, '', `/p/${slug}`);
    setActivePublicSlug(slug);
    setCurrentView('public');
  };

  // --- Autenticação ---
  const afterLogin = (user: AuthUser, message: string) => {
    setCurrentUser(user);
    go('/dashboard', 'dashboard');
    showToast(message, 'cyan');
  };

  const login = async (email: string, password: string, remember = true) => {
    const user = await authService.signIn(email, password, remember);
    afterLogin(user, 'Acesso autorizado! Bem-vindo ao SkillHub.');
  };

  const loginWithGoogle = async () => {
    try {
      const user = await authService.signInGoogle();
      afterLogin(user, `Bem-vindo, ${user.displayName}!`);
    } catch (err: unknown) {
      const code = typeof err === 'object' && err && 'code' in err ? String((err as { code: unknown }).code) : '';
      if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') return;
      showToast('Falha no login com Google.', 'error');
    }
  };

  const register = async (email: string, pass: string, remember = true) => {
    const user = await authService.signUp(email, pass, remember);
    afterLogin(user, 'Conta criada com sucesso!');
  };

  const requestPasswordReset = (email: string) => authService.sendPasswordReset(email);

  const logout = async () => {
    await authService.signOut();
    setCurrentUser(null);
    setProjects([]);
    go('/login', 'login');
    showToast('Sessão encerrada com sucesso.', 'info');
  };

  return (
    <ProjectContext.Provider
      value={{
        projects,
        isLoading,
        currentUser,
        currentView,
        editingProjectId,
        activePublicSlug,
        isAuthenticated,
        authLoading,
        login,
        loginWithGoogle,
        register,
        requestPasswordReset,
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

// eslint-disable-next-line react-refresh/only-export-components
export const useProjects = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProjects deve ser utilizado dentro de um ProjectProvider');
  }
  return context;
};
