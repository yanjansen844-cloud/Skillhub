# Segurança — SkillHub

## Modelo de ameaça

O SkillHub é uma SPA sem backend próprio: o navegador fala direto com o Firebase. Portanto **toda regra de segurança precisa estar nas Firestore Security Rules**. Validações no frontend existem apenas para UX.

## Controles implementados

### Isolamento por usuário (`firestore.rules`)
- Todo projeto tem `ownerId`. Leitura de rascunho, listagem, edição e exclusão exigem `ownerId == request.auth.uid`.
- Listagens só são aceitas quando filtradas pelo próprio `ownerId`.
- O dono não pode alterar `ownerId`, `createdAt` nem as métricas.
- Estrutura e tamanho dos campos são validados (nome ≤ 120, slug `^[a-z0-9-]+$` ≤ 80, ≤ 100 blocos, etc.).

### URL pública única
- `slugs/{slug}` reserva o endereço. Projeto e reserva são gravados no mesmo batch, e a regra confere (`getAfter`) que a reserva aponta para o próprio projeto e dono. Não é possível tomar o slug de outra pessoa nem reservar slugs sem projeto.

### Métricas
- Projetos nascem com métricas zeradas.
- Escritas anônimas só podem somar **+1 em uma única métrica**, apenas em projetos publicados, no total (`projects/{id}`) e no contador diário (`projects/{id}/daily/{AAAA-MM-DD}`).
- No cliente: 1 visualização por projeto por sessão, e o dono não gera métricas.
- **Limitação conhecida:** um script ainda pode repetir incrementos de +1. Para métricas à prova de fraude, mova a contagem para uma Cloud Function com Firebase App Check e deduplicação por visitante.

### Autenticação
- Apenas Firebase Auth (e-mail/senha e Google). Não há credenciais embutidas no código nem perfis de demonstração.
- A sessão fica no armazenamento do próprio Firebase. "Lembrar deste dispositivo" alterna entre persistência local e de sessão.
- Redefinição de senha via `sendPasswordResetEmail`, com mensagem genérica para não revelar quais e-mails têm conta.
- O limitador de 5 tentativas/60 s no formulário é só atrito de UX (roda no navegador). A proteção real é a do Firebase (`auth/too-many-requests`). Recomenda-se ativar **App Check** e, se necessário, **proteção contra enumeração de e-mail** no Firebase Auth.

### Frontend
- `sanitizeUrl` usa **lista de permissão** (somente `http:`/`https:` via `new URL()`). Links externos abrem com `noopener,noreferrer`.
- Nenhum uso de `dangerouslySetInnerHTML`; o React escapa todo conteúdo.
- Configuração do Firebase lida apenas de variáveis `VITE_FIREBASE_*`. O `apiKey` do Firebase Web não é secreto, mas deve ser restrito por HTTP referrer no Google Cloud.

### Headers HTTP (`vercel.json`)
Content-Security-Policy (origens restritas ao Firebase/Google), Strict-Transport-Security, X-Content-Type-Options, X-Frame-Options, Referrer-Policy e Permissions-Policy.

## Verificação

```bash
npm run test:rules   # requer Java 21+
```

## Checklist de produção

1. Publicar as regras: `npx firebase-tools deploy --only firestore:rules`.
2. **Authorized domains** no Firebase Auth: somente `localhost` e o domínio oficial.
3. Restringir a API key por HTTP referrer no Google Cloud Console.
4. Ativar App Check (reCAPTCHA Enterprise) para Firestore e Auth.
5. Se a conta `admin@skillhub.io` chegou a existir, trocar a senha: ela ficou exposta em versões anteriores do código e continua no histórico do git.
