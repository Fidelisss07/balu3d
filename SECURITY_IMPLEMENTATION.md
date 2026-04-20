# 🔒 Implementação de Segurança — Balu 3D

Status de cada item do [SECURITY.md](./SECURITY.md).

---

## ✅ 1. Firebase Security Rules

**Implementado:**
- [`firestore.rules`](./firestore.rules) cobre `users`, `products`, `orders`, `carts`, `wishlists`, `reviews`, `coupons`, `agenda`, `restock`, `newsletter`, `admin`.
- [`storage.rules`](./storage.rules) limita uploads: **apenas admin**, **≤ 5MB**, tipos **jpeg/png/webp**.
- Helper `isAdmin()` verifica `users/{uid}.role == 'admin'` no Firestore.
- Campo `role` nunca pode ser setado pelo próprio usuário ao criar conta.

**⚠️ Ação manual:** publicar no Firebase Console:
```bash
firebase deploy --only firestore:rules,storage
```
ou colar os arquivos em **Console → Firestore/Storage → Rules → Publicar**.

---

## ✅ 2. Autenticação e Proteção de Rotas

**Implementado:**
- [`middleware.ts`](./middleware.ts) protege `/admin`, `/minha-conta`, `/checkout` via cookie `__session`.
- `AuthContext.tsx` seta `__session` após `onAuthStateChanged` e remove no logout.
- `/admin` faz verificação extra de `profile.role === 'admin'` client-side + Firestore rules bloqueiam no servidor.

---

## 🟡 3. Stripe e Pagamentos

**Status: NÃO APLICÁVEL no momento.**
Projeto ainda não tem integração de pagamento (checkout cria pedido direto no Firestore com status "confirmado"; integração futura via WhatsApp).

**Quando integrar Stripe/MercadoPago:**
- Criar Firebase Function `createPaymentIntent` que:
  - Valida total do pedido no backend (nunca confiar no valor do frontend).
  - Usa `STRIPE_SECRET_KEY` do ambiente da Function, nunca `NEXT_PUBLIC_`.
- Criar webhook `/api/stripe/webhook` com `stripe.webhooks.constructEvent(rawBody, sig, STRIPE_WEBHOOK_SECRET)`.
- Variáveis já listadas comentadas em [`.env.example`](./.env.example).

---

## ✅ 4. Variáveis de Ambiente

**Implementado:**
- [`.env.local`](./.env.local) com todas as credenciais (gitignored).
- [`.env.example`](./.env.example) com placeholders.
- [`lib/firebase.ts`](./lib/firebase.ts) lê 100% de `process.env` (sem hardcode).

**⚠️ Ação manual:** adicionar todas as variáveis `NEXT_PUBLIC_*` no painel da Vercel (Settings → Environment Variables).

---

## ✅ 5. XSS e Injeção

**Implementado:**
- Pacote `isomorphic-dompurify` instalado.
- [`lib/sanitize.ts`](./lib/sanitize.ts) expõe `sanitizeText`, `sanitizeHtml`, `sanitizeObject`.
- Headers de segurança HTTP configurados em [`next.config.js`](./next.config.js):
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: SAMEORIGIN`
  - `Strict-Transport-Security: max-age=31536000; includeSubDomains`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Permissions-Policy: camera=(), microphone=(), geolocation=()`
  - `Content-Security-Policy` restritivo para Firebase/Cloudinary/Fonts.
- `register()` em [`lib/auth.ts`](./lib/auth.ts) já sanitiza o nome antes de persistir.

**Uso futuro:** passar todo input de usuário por `sanitizeText()` antes de salvar no Firestore (descrição de produto, review, endereço, etc).

**Pendente (backend):** rate limiting em Firebase Functions — será configurado quando as Functions forem criadas.

---

## ✅ 6. Uploads de Imagem

**Implementado:**
- [`lib/uploadValidation.ts`](./lib/uploadValidation.ts) valida tipo (jpg/png/webp) e tamanho (≤5MB).
- Admin de produto (`TabCriarProduto.tsx`) valida no frontend antes do upload Cloudinary.
- Admin de carrossel (`AdminCarouselEditor.tsx`) valida antes de enviar ao API route.
- API route [`/api/upload-carousel`](./app/api/upload-carousel/route.ts) valida novamente no servidor e sanitiza `slideId`.
- Firestore guarda apenas a URL retornada (nunca o buffer).

**Pendente (backend):** uploads assinados via Firebase Function para substituir unsigned preset do Cloudinary. Hoje o `upload_preset` é público — aceitável porque é configurado como *unsigned* e com limites de pasta no painel Cloudinary, mas idealmente deve migrar para signed.

---

## ✅ 7. Boas Práticas Gerais

**Implementado:**
- [`lib/logger.ts`](./lib/logger.ts) — wrapper que silencia `log/info/debug` em produção (`NODE_ENV === 'production'`), mantém `warn/error` para diagnóstico.
- Todos os `console.error` do projeto migrados para `logger.error` (6 ocorrências em 5 arquivos).
- Nenhum log do projeto expõe senha, token ou dados de outros usuários.

> **Nota:** SECURITY.md menciona `import.meta.env.MODE` (sintaxe Vite). Este projeto usa Next.js → usamos `process.env.NODE_ENV`.

---

## ✅ 8. Injeção / Validação de Dados

**Implementado:**
- Pacote `zod` instalado.
- [`lib/schemas.ts`](./lib/schemas.ts) define schemas para:
  - `productSchema`
  - `userRegisterSchema` (senha 8+ chars, 1 maiúscula, 1 número)
  - `userLoginSchema`
  - `checkoutSchema` (endereço, telefone BR, items)
  - `orderItemSchema`
  - `reviewSchema`
  - `newsletterSchema`
  - `couponSchema`
- `register()` e `login()` em `lib/auth.ts` validam via Zod antes de qualquer chamada ao Firebase.
- Firestore SDK oficial é usado em todas as queries — nenhum `eval()`, `Function()` ou string concat em query.

**Próximos passos opcionais:** aplicar schemas no checkout page e em formulários de review/newsletter (hoje validam manualmente).

---

## 🟡 9. CSRF

**Status: NÃO APLICÁVEL no momento (sem Firebase Functions).**

**Quando criar Firebase Functions:**
```ts
// Em cada Function sensível:
import { getAuth } from 'firebase-admin/auth'

const authHeader = req.headers.authorization
if (!authHeader?.startsWith('Bearer ')) throw new HttpsError('unauthenticated', 'Missing token')
const decoded = await getAuth().verifyIdToken(authHeader.slice(7))
const uid = decoded.uid
```
No frontend, antes da chamada:
```ts
const token = await auth.currentUser?.getIdToken()
fetch('/api/functions/x', { headers: { Authorization: `Bearer ${token}` }})
```

---

## ✅ 10. Força Bruta e Enumeração

**Implementado:**
- Firebase Auth nativo bloqueia após muitas tentativas (mensagem `auth/too-many-requests`).
- Login page: lockout client-side de **30s após 5 tentativas falhas** (persiste em localStorage).
- Botão exibe `Bloqueado (Ns)` com contador regressivo.
- Firestore rules bloqueiam listagem de todos os usuários (apenas próprio doc / admin).
- Nenhum endpoint retorna `password`, `token` ou role de outros usuários.
- `console.log` em produção silenciados via `logger.ts`.

**npm audit:**
- Atualizado Next.js 14.2.5 → 14.2.35 (patched dentro do major).
- `protobufjs` crítico resolvido via `npm audit fix`.
- **Restantes (7 high):** todas são Next.js 14.x conhecidas que só resolvem migrando para Next 16 (breaking change para App Router). Documentado para revisão futura — o mitigante principal é o middleware + Firestore rules.
- `glob` 10.x vem como dep transitiva do Firebase e afeta apenas CLI (`-c` flag), não runtime.

---

## 🚀 Checklist de Deploy

Antes de cada deploy em produção:

- [ ] Todas as envs `NEXT_PUBLIC_FIREBASE_*` configuradas na Vercel.
- [ ] `firestore.rules` e `storage.rules` publicadas no Firebase Console.
- [ ] Variável `NODE_ENV=production` (automática na Vercel).
- [ ] `npm run build` passa sem erros.
- [ ] `npx tsc --noEmit` passa sem erros.
- [ ] Smoke test: login, checkout guest, admin com user não-admin.
