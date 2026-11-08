import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  writeBatch,
  increment,
  onSnapshot,
  documentId,
  setDoc,
  updateDoc,
  type DocumentData,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from './firebase';
import type { DailyMetric, MetricKey, Project } from '../types';

const PROJECTS = 'projects';
const SLUGS = 'slugs';
const DAILY = 'daily';

export const today = (): string => new Date().toISOString().split('T')[0];

/** Data UTC no formato AAAA-MM-DD, `daysAgo` dias antes de hoje. */
export const dayKey = (daysAgo: number): string => {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - daysAgo);
  return d.toISOString().split('T')[0];
};

export class SlugTakenError extends Error {
  constructor(slug: string) {
    super(`O endereço "/p/${slug}" já está em uso. Escolha outro slug.`);
    this.name = 'SlugTakenError';
  }
}

const toProject = (id: string, data: DocumentData): Project => ({
  id,
  ownerId: data.ownerId || '',
  name: data.name || '',
  slug: data.slug || '',
  pageTitle: data.pageTitle || '',
  description: data.description || '',
  status: data.status === 'published' ? 'published' : 'draft',
  views: data.views || 0,
  clicks: data.clicks || 0,
  promptsCopied: data.promptsCopied || 0,
  createdAt: data.createdAt || '',
  updatedAt: data.updatedAt || '',
  categoryBadge: data.categoryBadge,
  blocks: Array.isArray(data.blocks) ? data.blocks : [],
});

/** Remove campos undefined (o Firestore rejeita undefined). */
const clean = <T extends object>(obj: T): T =>
  JSON.parse(JSON.stringify(obj)) as T;

const isPermissionDenied = (err: unknown) =>
  typeof err === 'object' && err !== null && 'code' in err &&
  (err as { code: string }).code === 'permission-denied';

export const projectService = {
  /** Gera um ID de documento novo (aleatório, sem colisão). */
  newId(): string {
    return doc(collection(db, PROJECTS)).id;
  },

  /** Assina em tempo real apenas os projetos do usuário logado. */
  subscribeToOwnerProjects(
    ownerId: string,
    onData: (projects: Project[]) => void,
    onError: (err: Error) => void
  ): Unsubscribe {
    const q = query(collection(db, PROJECTS), where('ownerId', '==', ownerId));
    return onSnapshot(
      q,
      (snapshot) => {
        const list = snapshot.docs
          .map((d) => toProject(d.id, d.data()))
          .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
        onData(list);
      },
      onError
    );
  },

  /**
   * Busca a página pública pelo slug (slugs/{slug} -> projects/{id}).
   * Visitantes só recebem projetos publicados; o dono também lê seus rascunhos.
   */
  async getBySlug(slug: string): Promise<Project | null> {
    try {
      const slugSnap = await getDoc(doc(db, SLUGS, slug));
      if (!slugSnap.exists()) return null;
      const projectId = slugSnap.data().projectId as string;
      const projectSnap = await getDoc(doc(db, PROJECTS, projectId));
      if (!projectSnap.exists()) return null;
      return toProject(projectSnap.id, projectSnap.data());
    } catch (err) {
      if (isPermissionDenied(err)) return null; // rascunho de outra pessoa
      throw err;
    }
  },

  async isSlugAvailable(slug: string, projectId?: string): Promise<boolean> {
    const snap = await getDoc(doc(db, SLUGS, slug));
    return !snap.exists() || snap.data().projectId === projectId;
  },

  /** Cria o projeto e reserva o slug de forma atômica. */
  async create(project: Project): Promise<void> {
    if (!(await this.isSlugAvailable(project.slug, project.id))) {
      throw new SlugTakenError(project.slug);
    }
    const batch = writeBatch(db);
    batch.set(doc(db, SLUGS, project.slug), { projectId: project.id, ownerId: project.ownerId });
    const { id, ...data } = project;
    batch.set(doc(db, PROJECTS, id), clean(data));
    await batch.commit();
  },

  /**
   * Atualiza conteúdo do projeto. Métricas, dono e data de criação nunca são enviados.
   * Se o slug mudar, troca a reserva no mesmo batch.
   */
  async update(current: Project, updates: Partial<Project>): Promise<string> {
    const {
      id: _id, ownerId: _o, createdAt: _c, views: _v, clicks: _cl, promptsCopied: _p,
      ...editable
    } = updates;
    void _id; void _o; void _c; void _v; void _cl; void _p;

    const updatedAt = today();
    const payload = clean({ ...editable, updatedAt });
    const newSlug = editable.slug;

    if (newSlug && newSlug !== current.slug) {
      if (!(await this.isSlugAvailable(newSlug, current.id))) {
        throw new SlugTakenError(newSlug);
      }
      const batch = writeBatch(db);
      batch.set(doc(db, SLUGS, newSlug), { projectId: current.id, ownerId: current.ownerId });
      batch.update(doc(db, PROJECTS, current.id), payload);
      batch.delete(doc(db, SLUGS, current.slug));
      await batch.commit();
    } else {
      await updateDoc(doc(db, PROJECTS, current.id), payload);
    }
    return updatedAt;
  },

  /** Exclui projeto, reserva de slug e série diária de métricas. */
  async delete(project: Project): Promise<void> {
    const dailySnap = await getDocs(collection(db, PROJECTS, project.id, DAILY));
    // Limite de 500 escritas por batch: apaga a série diária em lotes
    for (let i = 0; i < dailySnap.docs.length; i += 450) {
      const chunk = writeBatch(db);
      dailySnap.docs.slice(i, i + 450).forEach((d) => chunk.delete(d.ref));
      await chunk.commit();
    }
    const batch = writeBatch(db);
    batch.delete(doc(db, SLUGS, project.slug));
    batch.delete(doc(db, PROJECTS, project.id));
    await batch.commit();
  },

  /**
   * Registra uma interação real (+1) no total do projeto e no contador do dia.
   * As regras do Firestore só aceitam +1 em uma métrica por escrita, em páginas publicadas.
   */
  async recordMetric(projectId: string, metric: MetricKey): Promise<void> {
    try {
      await Promise.all([
        updateDoc(doc(db, PROJECTS, projectId), { [metric]: increment(1) }),
        setDoc(doc(db, PROJECTS, projectId, DAILY, today()), { [metric]: increment(1) }, { merge: true }),
      ]);
    } catch {
      // métricas nunca devem quebrar a experiência do visitante
    }
  },

  /** Série diária dos últimos `days` dias para os projetos informados (somente dono). */
  async getDailyMetrics(projectIds: string[], days: number): Promise<DailyMetric[]> {
    const start = dayKey(days - 1);
    const byDate = new Map<string, DailyMetric>();

    await Promise.all(
      projectIds.map(async (id) => {
        const q = query(collection(db, PROJECTS, id, DAILY), where(documentId(), '>=', start));
        const snap = await getDocs(q);
        snap.forEach((d) => {
          const data = d.data();
          const entry = byDate.get(d.id) || { date: d.id, views: 0, clicks: 0, promptsCopied: 0 };
          entry.views += data.views || 0;
          entry.clicks += data.clicks || 0;
          entry.promptsCopied += data.promptsCopied || 0;
          byDate.set(d.id, entry);
        });
      })
    );

    // Preenche dias sem tráfego com zero para o gráfico ser contínuo
    const series: DailyMetric[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const key = dayKey(i);
      series.push(byDate.get(key) || { date: key, views: 0, clicks: 0, promptsCopied: 0 });
    }
    return series;
  },
};
