# Relatório de Auditoria e Implementação de Segurança — SkillHub

Este documento detalha a análise completa de vulnerabilidades, políticas de segurança, proteção contra vazamento de dados sensíveis e mitigação de ataques de força bruta (brute-force) implementados no **SkillHub**.

---

## 1. Análise de Vazamento de Dados Sensíveis no Frontend

### O que foi inspecionado:
- Varredura de chaves privadas (`serviceAccountKey.json`, `client_secret`, chaves RSA/OpenSSH, senhas hardcoded).
- Análise de variáveis de ambiente (`.env`, `.env.example`, `.gitignore`).
- Análise do bundle de produção compilado pelo Vite (`dist/assets/`).

### Resultado da Varredura:
- **Zero chaves privadas ou segredos de servidor encontrados.**
- O arquivo `.env` foi protegido no `.gitignore` e não sobe para repositórios Git.
- As credenciais públicas do Firebase (`apiKey`, `projectId`, `appId`, etc.) são injetadas estritamente via `import.meta.env.VITE_FIREBASE_*`.

> **Por que a `apiKey` do Firebase fica visível no navegador?**
> No Firebase Web, o `apiKey` **não é uma chave secreta** (ao contrário de uma chave da OpenAI ou AWS), mas sim um **identificador de projeto** do Google Cloud para rotear requisições. 
> Qualquer aplicação Firebase no mundo expõe seu `apiKey` no frontend por especificação do Google. A segurança do Firebase **não depende de esconder o apiKey**, mas sim de:
> 1. **Firestore Security Rules** (regras do banco de dados no servidor).
> 2. **Restrições de Domínio de Autenticação** no Firebase Console.
> 3. **Restrições de HTTP Referrer** no Google Cloud Console.

---

## 2. Implementação de Proteção contra Força Bruta (Login Rate Limiter)

Para evitar ataques automatizados de dicionário ou tentativas contínuas de adivinhação de senhas, foi criada uma **defesa em duas camadas**:

### Camada 1: Rate Limiter Ativo no Frontend (`src/utils/security.ts` & `src/views/LoginView.tsx`)
- **Regra:** Máximo de **5 tentativas consecutivas de login incorretas**.
- **Penalidade (Lockout):** Bloqueio obrigatório de **60 segundos**.
- **Interface Reativa:** 
  - Ao ser bloqueado, surge um alerta de segurança pulsante em destaque com contagem regressiva em tempo real (`60s`, `59s`...).
  - O botão de login é desabilitado e exibe `Bloqueado por Xs`.
  - Os inputs de e-mail e senha são travados (`disabled`).
  - Os botões alternativos (Google e Perfil Demo) são bloqueados durante o período de cooldown.
  - Ao acertar o login, o contador é resetado automaticamente.

### Camada 2: Proteção Nativa do Firebase Auth (Backend)
- O backend do Google Identity Toolkit monitora requisições por IP e dispositivo.
- Se requisições anormais forem disparadas burlando o frontend (por exemplo, via script curl direto na API REST do Firebase), o Firebase dispara o erro `auth/too-many-requests`.
- O `LoginView` intercepta esse erro e o traduz com tratamento amigável.

---

## 3. Políticas de Segurança do Firestore (`firestore.rules`)

As regras do Firestore foram reforçadas para garantir a integridade dos dados e proteger a privacidade do criador:

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    match /projects/{projectId} {
      
      // 1. LEITURA:
      // Visitantes anônimos só têm permissão para ler projetos com status 'published'.
      // Rascunhos ('draft') são estritamente privados e só podem ser lidos por criadores autenticados.
      allow get, list: if (resource.data.status == 'published') || (request.auth != null);

      // 2. CRIAÇÃO:
      // Exige autenticação e valida tipagem, tamanho máximo de título (<= 120 chars) e blocos (<= 100).
      allow create: if request.auth != null
        && request.resource.data.name is string 
        && request.resource.data.name.size() > 0 
        && request.resource.data.name.size() <= 120
        && request.resource.data.slug is string 
        && request.resource.data.slug.size() > 0 
        && request.resource.data.slug.size() <= 80
        && request.resource.data.status in ['published', 'draft']
        && request.resource.data.blocks is list 
        && request.resource.data.blocks.size() <= 100;

      // 3. EXCLUSÃO:
      // Exige autenticação de usuário registrado.
      allow delete: if request.auth != null;

      // 4. ATUALIZAÇÃO BLINDADA:
      // Usuário autenticado pode editar o projeto.
      // Visitante anônimo pode APENAS incrementar métricas (views, clicks, promptsCopied) de 1 em 1.
      allow update: if (
        (request.auth != null)
        ||
        (
          request.resource.data.diff(resource.data).affectedKeys()
            .hasOnly(['views', 'clicks', 'promptsCopied'])
          && (!request.resource.data.diff(resource.data).affectedKeys().hasAny(['views']) 
              || request.resource.data.views == resource.data.views + 1)
          && (!request.resource.data.diff(resource.data).affectedKeys().hasAny(['clicks']) 
              || request.resource.data.clicks == resource.data.clicks + 1)
          && (!request.resource.data.diff(resource.data).affectedKeys().hasAny(['promptsCopied']) 
              || request.resource.data.promptsCopied == resource.data.promptsCopied + 1)
        )
      );
    }
  }
}
```

---

## 4. Proteção contra XSS e Protocolos Maliciosos (`sanitizeUrl`)

Páginas de criadores recebem links externos para ferramentas e sites parceiros. Se um link malicioso contiver `javascript:alert(1)` ou `data:text/html,...`, o navegador poderia executar código arbitrário.

- **Mitigação:** Foi aplicada a função `sanitizeUrl` em `src/utils/security.ts`.
- Rejeita categoricamente protocolos inseguros (`javascript:`, `data:`, `vbscript:`, `file:`, `about:`).
- Força protocolo `https://` caso omitido.
- Links com `target="_blank"` contam com `rel="noopener noreferrer"`.

---

## 5. Recomendações Finais no Console do Firebase

1. **Authorized Domains:** Manter apenas `localhost` e o domínio oficial do app.
2. **Restringir API Key no Google Cloud:** Ativar restrição por HTTP Referrer para o seu domínio.
3. **Publicar as Regras:** Executar `firebase deploy --only firestore:rules` ou colar no painel web.

