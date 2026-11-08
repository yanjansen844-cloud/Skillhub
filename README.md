# 🚀 SkillHub — Painel de Gerenciamento de Projetos & Páginas de Recursos

> **Plataforma SaaS moderna, minimalista e focada em criadores de conteúdo para Instagram e TikTok.**  
> Permite cadastrar projetos temáticos, gerenciar blocos de conteúdo e gerar páginas públicas hiper-rápidas e responsivas contendo textos, ferramentas, links de download e prompts copiáveis com 1 clique.

---

## 📸 Visão Geral das Funcionalidades

- **Dashboard de Métricas:**
  - 4 Indicadores principais em tempo real: *Total de Projetos*, *Visualizações*, *Cliques em Links* e *Prompts Copiados*.
  - Gráfico interativo em curva SVG com gradientes ciano e lilás, tooltips dinâmicos e filtros de período (7 dias, 30 dias e 90 dias).
  - Tabela com ranking dos projetos mais acessados e atalhos rápidos.
- **Gerenciamento de Projetos:**
  - Alternância instantânea entre visualização em **Cards** e **Tabela**.
  - Filtros por status (*Todos*, *Publicados*, *Rascunhos*) e busca em tempo real por nome, slug ou descrição.
  - Ações rápidas em cada projeto: *Visualizar*, *Copiar Link*, *Duplicar*, *Editar* e *Excluir*.
- **Fluxo Completo de "Novo Projeto" e Edição:**
  - **Modelos Rápidos (Templates):** Carregue estruturas prontas com 1 clique (*3 Ferramentas de Som com IA*, *Roteiros & Ganchos Virais*, *Kit de Carrosséis*, *Em Branco*).
  - **Identificação & Slug Inteligente:** Geração automática de URL amigável (`skillhub.io/p/[slug]`) a partir do nome, com normalização de caracteres e validação de duplicidade.
  - **Editor Baseado em Blocos Reordenáveis:**
    - 📝 **Texto:** Cabeçalho opcional e parágrafos explicativos.
    - ⚡ **Prompt Copiável:** Área com fonte mono, botão de cópia instantânea, tags e instruções de uso.
    - 🛠️ **Ferramenta:** Nome da ferramenta, descrição detalhada, link direto e badges de categoria/preço.
    - 🔗 **Link Externo:** Título, URL de destino, descrição e destaque visual com brilho ciano.
  - **Simulador Mobile em Tempo Real (Split View):** Veja a página pública sendo montada ao vivo enquanto digita ou adiciona blocos.
  - **Publicação com Confetes & Modal de Sucesso:** Modal com o link pronto para compartilhar na bio do Instagram ou TikTok.
- **Tela de Autenticação / Login:**
  - Interface SaaS moderna e tecnológica com fundo escuro e iluminação ambiente.
  - Campos de e-mail e senha com alternância de visibilidade (*mostrar/ocultar senha*).
  - Checkbox *"Lembrar deste dispositivo"* e indicador de segurança SSL 256-bit.
  - Botão de acesso em 1 clique com **Perfil de Demonstração** para testes imediatos.
  - Integração com o fluxo de *"Sair"* do menu lateral.
- **Página Pública de Alta Conversão:**
  - Inspirada na referência estrutural `https://goat-entregas.vercel.app/3-ferramentas-som`, com identidade própria exclusiva.
  - Design *mobile-first*, cards de ferramentas destacados, links externos elegantes e botão de cópia de prompt com feedback visual imediato (*"Copiado!"* com checkmark e confetes).
  - Barra de controle superior para alternar entre modo tela cheia e moldura de smartphone.

---

## 🎨 Identidade Visual & Design System

A interface do SkillHub foi projetada segundo os princípios de um SaaS tecnológico, moderno e minimalista:

| Elemento | Implementação |
| :--- | :--- |
| **Fundo Principal** | Escuro arroxeado profundo (`#090714` e `#0c091f`) |
| **Cards & Superfícies** | Tons de roxo escuro translúcidos com efeito glassmorphism (`#140e2d`, `#1a1338`, `#1e1544`) |
| **Destaques & Acentos** | Lilás elétrico (`#c084fc`, `#a855f7`) e Ciano futurista (`#22d3ee`, `#06b6d4`) |
| **Tipografia** | **Space Grotesk** (títulos modernos e condensados), **Plus Jakarta Sans** (corpo de texto límpido) e **JetBrains Mono** (prompts e slugs) |
| **Bordas** | Finas e discretas com transparência (`rgba(168, 85, 247, 0.15)`) |
| **Textura de Fundo** | Grid vetorial sutil com iluminação radial suave |
| **Ícones** | Minimalistas com traço fino da biblioteca **Lucide React** |

---

## 🧭 Navegação

O menu lateral do painel administrativo possui **estritamente as 3 opções exigidas**:
1. **Dashboard** — Visão geral de métricas, gráfico de tráfego e projetos em alta.
2. **Projetos** — Listagem de todas as páginas públicas com filtros e ações de gestão.
3. **Sair** — Encerramento seguro de sessão com modal de confirmação.

---

## 📁 Estrutura de Diretórios do Projeto

```text
skillhub/
├── index.html                   # Entrada HTML com tipografia Space Grotesk e Plus Jakarta Sans
├── package.json                 # Dependências e scripts do projeto
├── tailwind.config.js           # Paleta de cores brand, fontes e utilitários
├── postcss.config.js            # Configuração do PostCSS para Tailwind
├── README.md                    # Documentação oficial do projeto
├── src/
│   ├── main.tsx                 # Ponto de inicialização do React
│   ├── App.tsx                  # Roteador principal e orquestrador de telas
│   ├── index.css                # Diretivas Tailwind, classes de grid e scrollbar customizada
│   ├── types/
│   │   └── index.ts             # Tipos TypeScript (Project, ContentBlock, Tool, Prompt, etc.)
│   ├── data/
│   │   ├── mockData.ts          # Dados iniciais realistas (projetos de áudio, ganchos e carrosséis)
│   │   └── templates.ts         # Modelos pré-configurados para o fluxo de Novo Projeto
│   ├── context/
│   │   └── ProjectContext.tsx   # Estado global reativo com persistência em localStorage
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx      # Menu lateral com exatamente 3 opções (Dashboard, Projetos, Sair)
│   │   │   └── Header.tsx       # Cabeçalho com breadcrumbs e botão Novo Projeto
│   │   ├── common/
│   │   │   ├── ConfirmModal.tsx # Modal de confirmação (exclusão e logout)
│   │   │   └── ToastContainer.tsx # Notificações toast estilizadas em roxo e ciano
│   │   ├── dashboard/
│   │   │   ├── StatCards.tsx    # 4 Indicadores métricos com badges de tendência
│   │   │   ├── ViewsChart.tsx   # Gráfico SVG responsivo com tooltips e filtro de períodos
│   │   │   └── TopProjectsTable.tsx # Lista dos projetos mais acessados
│   │   ├── editor/
│   │   │   ├── LiveMobilePreview.tsx # Simulador de smartphone ao vivo dentro do editor
│   │   │   ├── PublishSuccessModal.tsx # Modal comemorativo com link pronto para cópia
│   │   │   └── blocks/
│   │   │       ├── TextBlockEditor.tsx   # Editor de bloco de texto
│   │   │       ├── PromptBlockEditor.tsx # Editor de bloco de prompt copiável
│   │   │       ├── LinkBlockEditor.tsx   # Editor de bloco de link externo
│   │   │       └── ToolBlockEditor.tsx   # Editor de bloco de ferramenta
│   │   └── public/
│   │       └── PublicProjectPage.tsx # Modelo de página pública renderizada (mobile-first)
│   └── views/
│       ├── LoginView.tsx         # Tela moderna de autenticação SaaS
│       ├── DashboardView.tsx     # Tela principal do Dashboard
│       ├── ProjectsView.tsx      # Tela de listagem de projetos
│       └── ProjectEditorView.tsx # Tela completa de Criação e Edição de projetos
```

---

## ⚙️ Tecnologias Utilizadas

- **React 19 & TypeScript:** Interface moderna e fortemente tipada.
- **Vite 8:** Ferramenta de build de última geração com recarregamento instantâneo (*HMR*).
- **Tailwind CSS 3.4:** Estilização utilitária atômica para um design limpo e responsivo.
- **Lucide React:** Conjunto coeso de ícones minimalistas.
- **Canvas-Confetti:** Efeitos táteis de celebração ao copiar prompts e publicar páginas.
- **LocalStorage API:** Persistência no navegador permitindo criar, alterar, duplicar e excluir projetos sem perder dados ao recarregar.

---

## 🚀 Como Executar o Projeto

### Pré-requisitos
- Node.js versão 18 ou superior instalado.
- NPM (incluso no Node.js).

### 1. Clonar ou navegar até a pasta do projeto
```bash
cd "c:\Users\yan.jansen\Desktop\Projetos Yan\yan.jansen844"
```

### 2. Instalar dependências (caso não tenham sido instaladas)
```bash
npm install
```

### 3. Iniciar o servidor de desenvolvimento
```bash
npm run dev
```
Acesse a aplicação no seu navegador em: **`http://localhost:5173/`**

### 4. Gerar build de produção
```bash
npm run build
```
O build estático pronto para deploy na Vercel, Netlify ou Firebase Hosting será gerado no diretório `dist/`.

---

## 🚀 Deploy na Vercel

O projeto já inclui o arquivo [`vercel.json`](file:///c:/Users/yan.jansen/Desktop/Projetos%20Yan/yan.jansen844/vercel.json) com suporte nativo a Single Page Application (SPA), headers de segurança e cache otimizado.

1. Conecte o repositório à [Vercel](https://vercel.com).
2. Adicione as variáveis de ambiente do Firebase em **Settings > Environment Variables** (conforme [`.env.example`](file:///c:/Users/yan.jansen/Desktop/Projetos%20Yan/yan.jansen844/.env.example)).
3. No [Firebase Console](https://console.firebase.google.com/), adicione o domínio gerado pela Vercel em **Authentication > Settings > Authorized Domains**.

---

## 🔮 Guia para Futura Integração com Backend

O código do frontend foi estruturado de forma desacoplada para facilitar a conexão futura com uma API real:

1. **Camada de Contexto (`src/context/ProjectContext.tsx`):**
   - Substitua as operações locais de `setProjects` por chamadas `fetch` ou `axios` para os endpoints da API (ex: `POST /api/projects`, `PUT /api/projects/:id`, `DELETE /api/projects/:id`).
2. **Modelo de Banco de Dados Sugerido (PostgreSQL / Supabase / Prisma):**
   ```sql
   CREATE TABLE projects (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     user_id UUID REFERENCES users(id),
     name VARCHAR(255) NOT NULL,
     slug VARCHAR(255) UNIQUE NOT NULL,
     page_title VARCHAR(255) NOT NULL,
     description TEXT,
     status VARCHAR(20) DEFAULT 'draft',
     views INTEGER DEFAULT 0,
     clicks INTEGER DEFAULT 0,
     prompts_copied INTEGER DEFAULT 0,
     blocks JSONB NOT NULL DEFAULT '[]',
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   ```
3. **Autenticação:**
   - O modal de "Sair" do menu lateral e o indicador de usuário podem ser plugados diretamente em provedores como Supabase Auth, Clerk, NextAuth ou JWT.
