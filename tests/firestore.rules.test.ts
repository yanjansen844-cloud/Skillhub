import { readFileSync } from 'node:fs';
import { afterAll, beforeAll, beforeEach, describe, it } from 'vitest';
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import {
  doc,
  getDoc,
  getDocs,
  collection,
  query,
  where,
  setDoc,
  updateDoc,
  deleteDoc,
  writeBatch,
  increment,
  type Firestore,
} from 'firebase/firestore';

let env: RulesTestEnvironment;

const ALICE = 'alice';
const BOB = 'bob';

const baseProject = (ownerId: string, slug: string, status: 'published' | 'draft' = 'published') => ({
  ownerId,
  name: 'Projeto',
  slug,
  pageTitle: 'Projeto',
  description: '',
  status,
  views: 0,
  clicks: 0,
  promptsCopied: 0,
  createdAt: '2026-11-01',
  updatedAt: '2026-11-01',
  blocks: [],
});

const createWithSlug = (db: Firestore, id: string, data: ReturnType<typeof baseProject>) => {
  const batch = writeBatch(db);
  batch.set(doc(db, 'slugs', data.slug), { projectId: id, ownerId: data.ownerId });
  batch.set(doc(db, 'projects', id), data);
  return batch.commit();
};

// Semeia dados ignorando as regras
const seed = async () => {
  await env.withSecurityRulesDisabled(async (ctx) => {
    const db = ctx.firestore();
    await setDoc(doc(db, 'projects', 'pub'), { ...baseProject(ALICE, 'publico'), views: 10 });
    await setDoc(doc(db, 'slugs', 'publico'), { projectId: 'pub', ownerId: ALICE });
    await setDoc(doc(db, 'projects', 'draft'), baseProject(ALICE, 'rascunho', 'draft'));
    await setDoc(doc(db, 'slugs', 'rascunho'), { projectId: 'draft', ownerId: ALICE });
    await setDoc(doc(db, 'projects', 'pub', 'daily', '2026-11-08'), { views: 3 });
  });
};

beforeAll(async () => {
  env = await initializeTestEnvironment({
    projectId: 'demo-skillhub',
    firestore: { rules: readFileSync('firestore.rules', 'utf8') },
  });
});

beforeEach(async () => {
  await env.clearFirestore();
  await seed();
});

afterAll(async () => {
  await env.cleanup();
});

describe('leitura', () => {
  it('visitante lê projeto publicado e a reserva de slug', async () => {
    const db = env.unauthenticatedContext().firestore();
    await assertSucceeds(getDoc(doc(db, 'slugs', 'publico')));
    await assertSucceeds(getDoc(doc(db, 'projects', 'pub')));
  });

  it('visitante e outro usuário NÃO leem rascunho', async () => {
    await assertFails(getDoc(doc(env.unauthenticatedContext().firestore(), 'projects', 'draft')));
    await assertFails(getDoc(doc(env.authenticatedContext(BOB).firestore(), 'projects', 'draft')));
  });

  it('dono lê o próprio rascunho', async () => {
    await assertSucceeds(getDoc(doc(env.authenticatedContext(ALICE).firestore(), 'projects', 'draft')));
  });

  it('listagem só é permitida filtrando pelo próprio ownerId', async () => {
    const alice = env.authenticatedContext(ALICE).firestore();
    await assertSucceeds(getDocs(query(collection(alice, 'projects'), where('ownerId', '==', ALICE))));
    await assertFails(getDocs(collection(alice, 'projects')));
    const bob = env.authenticatedContext(BOB).firestore();
    await assertFails(getDocs(query(collection(bob, 'projects'), where('ownerId', '==', ALICE))));
    await assertFails(getDocs(collection(env.unauthenticatedContext().firestore(), 'projects')));
  });

  it('série diária só é lida pelo dono', async () => {
    await assertSucceeds(getDocs(collection(env.authenticatedContext(ALICE).firestore(), 'projects', 'pub', 'daily')));
    await assertFails(getDocs(collection(env.authenticatedContext(BOB).firestore(), 'projects', 'pub', 'daily')));
    await assertFails(getDocs(collection(env.unauthenticatedContext().firestore(), 'projects', 'pub', 'daily')));
  });
});

describe('criação', () => {
  it('usuário cria projeto próprio com slug reservado no mesmo batch', async () => {
    const db = env.authenticatedContext(BOB).firestore();
    await assertSucceeds(createWithSlug(db, 'p-bob', baseProject(BOB, 'meu-projeto')));
  });

  it('não pode criar projeto em nome de outro usuário', async () => {
    const db = env.authenticatedContext(BOB).firestore();
    await assertFails(createWithSlug(db, 'p-x', baseProject(ALICE, 'outro')));
  });

  it('não pode criar com métricas infladas', async () => {
    const db = env.authenticatedContext(BOB).firestore();
    await assertFails(createWithSlug(db, 'p-x', { ...baseProject(BOB, 'inflado'), views: 9999 }));
  });

  it('não pode criar sem reservar o slug', async () => {
    const db = env.authenticatedContext(BOB).firestore();
    await assertFails(setDoc(doc(db, 'projects', 'p-x'), baseProject(BOB, 'sem-reserva')));
  });

  it('não pode tomar um slug já usado por outra pessoa', async () => {
    const db = env.authenticatedContext(BOB).firestore();
    await assertFails(createWithSlug(db, 'p-x', baseProject(BOB, 'publico')));
  });

  it('não pode reservar slug sem projeto próprio correspondente', async () => {
    const db = env.authenticatedContext(BOB).firestore();
    await assertFails(setDoc(doc(db, 'slugs', 'squat'), { projectId: 'nada', ownerId: BOB }));
  });

  it('visitante não cria projetos', async () => {
    const db = env.unauthenticatedContext().firestore();
    await assertFails(createWithSlug(db, 'p-x', baseProject('anon', 'anon')));
  });
});

describe('atualização e exclusão', () => {
  it('dono edita conteúdo', async () => {
    const db = env.authenticatedContext(ALICE).firestore();
    await assertSucceeds(updateDoc(doc(db, 'projects', 'pub'), { name: 'Novo nome', updatedAt: '2026-11-08' }));
  });

  it('dono NÃO altera métricas nem transfere o projeto', async () => {
    const db = env.authenticatedContext(ALICE).firestore();
    await assertFails(updateDoc(doc(db, 'projects', 'pub'), { views: 100000 }));
    await assertFails(updateDoc(doc(db, 'projects', 'pub'), { ownerId: BOB }));
  });

  it('outro usuário NÃO edita nem exclui projeto alheio', async () => {
    const db = env.authenticatedContext(BOB).firestore();
    await assertFails(updateDoc(doc(db, 'projects', 'pub'), { name: 'hack' }));
    await assertFails(deleteDoc(doc(db, 'projects', 'pub')));
    await assertFails(deleteDoc(doc(db, 'slugs', 'publico')));
  });

  it('dono troca o slug de forma atômica', async () => {
    const db = env.authenticatedContext(ALICE).firestore();
    const batch = writeBatch(db);
    batch.set(doc(db, 'slugs', 'novo-slug'), { projectId: 'pub', ownerId: ALICE });
    batch.update(doc(db, 'projects', 'pub'), { slug: 'novo-slug' });
    batch.delete(doc(db, 'slugs', 'publico'));
    await assertSucceeds(batch.commit());
  });

  it('dono exclui o próprio projeto', async () => {
    const db = env.authenticatedContext(ALICE).firestore();
    const batch = writeBatch(db);
    batch.delete(doc(db, 'slugs', 'publico'));
    batch.delete(doc(db, 'projects', 'pub'));
    await assertSucceeds(batch.commit());
  });
});

describe('métricas públicas', () => {
  it('visitante incrementa +1 em projeto publicado (total e diário)', async () => {
    const db = env.unauthenticatedContext().firestore();
    await assertSucceeds(updateDoc(doc(db, 'projects', 'pub'), { views: increment(1) }));
    await assertSucceeds(setDoc(doc(db, 'projects', 'pub', 'daily', '2026-11-08'), { views: increment(1) }, { merge: true }));
    await assertSucceeds(setDoc(doc(db, 'projects', 'pub', 'daily', '2026-11-09'), { clicks: increment(1) }, { merge: true }));
  });

  it('visitante NÃO incrementa mais de 1, nem várias métricas, nem outros campos', async () => {
    const db = env.unauthenticatedContext().firestore();
    await assertFails(updateDoc(doc(db, 'projects', 'pub'), { views: increment(50) }));
    await assertFails(updateDoc(doc(db, 'projects', 'pub'), { views: increment(1), clicks: increment(1) }));
    await assertFails(updateDoc(doc(db, 'projects', 'pub'), { views: increment(-1) }));
    await assertFails(updateDoc(doc(db, 'projects', 'pub'), { name: 'hack' }));
    await assertFails(setDoc(doc(db, 'projects', 'pub', 'daily', '2026-11-08'), { views: increment(10) }, { merge: true }));
    await assertFails(setDoc(doc(db, 'projects', 'pub', 'daily', 'qualquer'), { views: 1 }));
  });

  it('visitante NÃO gera métricas em rascunho', async () => {
    const db = env.unauthenticatedContext().firestore();
    await assertFails(updateDoc(doc(db, 'projects', 'draft'), { views: increment(1) }));
    await assertFails(setDoc(doc(db, 'projects', 'draft', 'daily', '2026-11-08'), { views: increment(1) }, { merge: true }));
  });
});
