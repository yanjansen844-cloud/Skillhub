import {
  collection,
  doc,
  getDocs,
  query,
  where,
  setDoc,
  updateDoc,
  deleteDoc,
  increment,
  orderBy
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';
import type { Project } from '../types';

const COLLECTION_NAME = 'projects';
const LOCAL_STORAGE_KEY = 'skillhub_projects_firestore_sync';

export const projectService = {
  // Fetch all projects
  async getAll(): Promise<Project[]> {
    if (!isFirebaseConfigured()) {
      try {
        const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
        return saved ? JSON.parse(saved) : [];
      } catch {
        return [];
      }
    }

    try {
      const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const projects: Project[] = [];
      snapshot.forEach(docSnap => {
        const data = docSnap.data();
        projects.push({
          id: docSnap.id,
          name: data.name || '',
          slug: data.slug || '',
          pageTitle: data.pageTitle || '',
          description: data.description || '',
          status: data.status || 'draft',
          views: data.views || 0,
          clicks: data.clicks || 0,
          promptsCopied: data.promptsCopied || 0,
          createdAt: data.createdAt || new Date().toISOString().split('T')[0],
          updatedAt: data.updatedAt || new Date().toISOString().split('T')[0],
          categoryBadge: data.categoryBadge,
          blocks: data.blocks || [],
        });
      });
      return projects;
    } catch (err) {
      console.warn('Erro ao carregar do Firestore, usando fallback local:', err);
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    }
  },

  // Fetch single project by public slug
  async getBySlug(slug: string): Promise<Project | null> {
    if (!isFirebaseConfigured()) {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const list: Project[] = JSON.parse(saved);
        return list.find(p => p.slug === slug) || null;
      }
      return null;
    }

    try {
      const q = query(collection(db, COLLECTION_NAME), where('slug', '==', slug));
      const snapshot = await getDocs(q);
      if (snapshot.empty) return null;
      const docSnap = snapshot.docs[0];
      const data = docSnap.data();
      return {
        id: docSnap.id,
        name: data.name || '',
        slug: data.slug || '',
        pageTitle: data.pageTitle || '',
        description: data.description || '',
        status: data.status || 'draft',
        views: data.views || 0,
        clicks: data.clicks || 0,
        promptsCopied: data.promptsCopied || 0,
        createdAt: data.createdAt || new Date().toISOString().split('T')[0],
        updatedAt: data.updatedAt || new Date().toISOString().split('T')[0],
        categoryBadge: data.categoryBadge,
        blocks: data.blocks || [],
      };
    } catch (err) {
      console.error('Erro ao buscar projeto por slug no Firestore:', err);
      return null;
    }
  },

  // Create project
  async create(project: Project): Promise<void> {
    if (isFirebaseConfigured()) {
      try {
        const docRef = doc(db, COLLECTION_NAME, project.id);
        await setDoc(docRef, project);
      } catch (err) {
        console.error('Erro ao salvar projeto no Firestore:', err);
      }
    }
    // Update local cache
    this.updateLocalCache(project, 'create');
  },

  // Update project
  async update(id: string, updates: Partial<Project>): Promise<void> {
    if (isFirebaseConfigured()) {
      try {
        const docRef = doc(db, COLLECTION_NAME, id);
        await updateDoc(docRef, {
          ...updates,
          updatedAt: new Date().toISOString().split('T')[0]
        });
      } catch (err) {
        console.error('Erro ao atualizar projeto no Firestore:', err);
      }
    }
    // Update local cache
    this.updateLocalCache({ id, ...updates } as Project, 'update');
  },

  // Delete project
  async delete(id: string): Promise<void> {
    if (isFirebaseConfigured()) {
      try {
        const docRef = doc(db, COLLECTION_NAME, id);
        await deleteDoc(docRef);
      } catch (err) {
        console.error('Erro ao excluir projeto do Firestore:', err);
      }
    }
    // Update local cache
    this.updateLocalCache({ id } as Project, 'delete');
  },

  // Interactions: increment views
  async recordView(id: string): Promise<void> {
    if (isFirebaseConfigured()) {
      try {
        const docRef = doc(db, COLLECTION_NAME, id);
        await updateDoc(docRef, { views: increment(1) });
      } catch {
        // silent fail for analytics
      }
    }
  },

  // Interactions: increment clicks
  async recordClick(id: string): Promise<void> {
    if (isFirebaseConfigured()) {
      try {
        const docRef = doc(db, COLLECTION_NAME, id);
        await updateDoc(docRef, { clicks: increment(1) });
      } catch {
        // silent fail
      }
    }
  },

  // Interactions: increment prompts copied
  async recordPromptCopy(id: string): Promise<void> {
    if (isFirebaseConfigured()) {
      try {
        const docRef = doc(db, COLLECTION_NAME, id);
        await updateDoc(docRef, { promptsCopied: increment(1) });
      } catch {
        // silent fail
      }
    }
  },

  // Helper to maintain local cache
  updateLocalCache(project: Project, action: 'create' | 'update' | 'delete') {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      let list: Project[] = saved ? JSON.parse(saved) : [];

      if (action === 'create') {
        list = [project, ...list.filter(p => p.id !== project.id)];
      } else if (action === 'update') {
        list = list.map(p => (p.id === project.id ? { ...p, ...project } : p));
      } else if (action === 'delete') {
        list = list.filter(p => p.id !== project.id);
      }

      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(list));
    } catch {
      // ignore
    }
  }
};
