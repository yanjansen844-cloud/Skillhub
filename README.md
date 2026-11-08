# SkillHub — Painel de Projetos & Páginas de Recursos

Plataforma para criadores de conteúdo (Instagram/TikTok) montarem páginas públicas com textos, ferramentas, links e prompts copiáveis, acompanhando métricas reais de acesso.

## Funcionalidades

- **Dashboard com métricas reais**: total de projetos, visualizações, cliques e prompts copiados. As tendências comparam os últimos 7 dias com os 7 anteriores, e o gráfico (7/30/90 dias) é montado a partir da série diária gravada no Firestore.
- **Projetos por usuário**: cada conta vê e gerencia apenas os próprios projetos, sincronizados em tempo real (`onSnapshot`).
- **Editor por blocos** (texto, prompt, ferramenta, link) com prévia mobile e modelos prontos.
- **Página pública** em `/<domínio>/p/<slug>`: visitantes só acessam projetos publicados; a barra de edição aparece apenas para o dono.
- **Autenticação Firebase**: e-mail/senha, Google, "lembrar deste dispositivo" e redefinição de senha por e-mail.

## Modelo de dados (Firestore)

| Caminho | Conteúdo |
| --- | --- |
| `projects/{id}` | Projeto (`ownerId`, `name`, `slug`, `status`, `blocks`, totais `views`/`clicks`/`promptsCopied`, datas) |
| `projects/{id}/daily/{AAAA-MM-DD}` | Contadores diários (UTC) usados no gráfico e nas tendências |
| `slugs/{slug}` | Reserva global do endereço público (`projectId`, `ownerId`) |

As regras em [`firestore.rules`](firestore.rules) garantem:
- leitura de rascunhos, edição e exclusão **somente pelo dono**;
- projetos criados com métricas zeradas e slug único reservado no mesmo batch;
- visitantes só podem somar **+1 em uma métrica por escrita**, e apenas em projetos publicados;
- o dono não consegue alterar métricas manualmente.

Métricas: uma visualização por projeto por sessão do navegador; o próprio dono não gera métricas.

## Executando localmente

Pré-requisitos: Node.js 20+.

```bash
cp .env.example .env   # preencha com os dados do seu Web App no Firebase Console
npm install
npm run dev            # http://localhost:5173
npm run build          # build de produção em dist/
npm run lint
```

Sem as variáveis `VITE_FIREBASE_*` o app exibe uma tela de configuração ausente. Não há credenciais embutidas no código.

### Testes das regras do Firestore

Requer **Java 21+** (exigência do `firebase-tools` atual):

```bash
npm run test:rules
```

Os testes ([`tests/firestore.rules.test.ts`](tests/firestore.rules.test.ts)) sobem o emulador e verificam isolamento entre usuários, reserva de slug e proteção das métricas.

## Deploy

### Regras do Firestore

```bash
npx firebase-tools login
npx firebase-tools deploy --only firestore:rules --project <seu-project-id>
```

### Vercel

1. Em **Settings > Environment Variables**, cadastre todas as variáveis do [`.env.example`](.env.example) e faça um novo deploy.
2. No Firebase Console, adicione o domínio da Vercel em **Authentication > Settings > Authorized domains**.
3. No Google Cloud Console, restrinja a API key do Firebase por **HTTP referrer** ao seu domínio.

O [`vercel.json`](vercel.json) configura rewrite de SPA, cache dos assets e headers de segurança (CSP, HSTS, etc.). Se usar um `authDomain` personalizado, inclua-o em `frame-src` na CSP.

## Migração de projetos criados antes do controle de dono

Projetos antigos não têm `ownerId` nem reserva em `slugs/`, então as novas regras os bloqueiam. Para cada projeto existente, no Firebase Console (Firestore):

1. Em `projects/{id}`, adicione `ownerId` (string) com o UID do criador (veja em **Authentication > Users**).
2. Garanta que existam os campos `pageTitle`, `description` (string), `views`, `clicks`, `promptsCopied` (number) e `createdAt`/`updatedAt` (string `AAAA-MM-DD`).
3. Crie o documento `slugs/{slug}` com `projectId` = ID do projeto e `ownerId` = mesmo UID.

O histórico diário começa a ser registrado a partir desta versão; os totais acumulados anteriores continuam nos cards.

## Estrutura

```text
src/
├── App.tsx                      # Orquestra telas e valida a configuração do Firebase
├── context/ProjectContext.tsx   # Sessão, rotas, projetos em tempo real, ações e métricas
├── hooks/useDailyMetrics.ts     # Série diária real para gráfico e tendências
├── services/
│   ├── firebase.ts              # Inicialização via variáveis de ambiente
│   ├── authService.ts           # Login, cadastro, Google, persistência, reset de senha
│   └── projectService.ts        # CRUD, reserva de slug, métricas
├── utils/security.ts            # sanitizeUrl (allowlist http/https) e limitador de login
├── utils/url.ts                 # URL pública baseada no domínio atual
├── components/                  # layout, dashboard, editor, página pública, comuns
├── views/                       # Login, Dashboard, Projetos, Editor
└── data/templates.ts            # Modelos de projeto
```
