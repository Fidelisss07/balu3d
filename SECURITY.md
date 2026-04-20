# 🔒 Segurança do Site — BaLu 3D

Implemente todas as camadas de segurança abaixo. O projeto é um e-commerce com **React + Vite + Tailwind**, **Firebase (Auth, Firestore, Storage)**, **Stripe** para pagamentos e **Cloudinary** para imagens.

---

## 1. Firebase Security Rules

- **Firestore:** usuários só podem ler e escrever nos próprios documentos. Somente usuários com `role: "admin"` (campo no documento do usuário no Firestore) podem criar, editar e deletar produtos. Pedidos só podem ser criados por usuários autenticados e lidos pelo próprio dono ou por admin. Nenhuma leitura ou escrita pública sem autenticação.
- **Storage:** upload de imagens permitido apenas para admins autenticados. Limite máximo de **5MB** por arquivo. Permitir apenas os tipos `image/jpeg`, `image/png` e `image/webp`.

---

## 2. Autenticação e Proteção de Rotas

- Implementar proteção de rotas: páginas como `/admin`, `/minhas-compras` e `/checkout` devem redirecionar para login se o usuário não estiver autenticado.
- A rota `/admin` deve verificar além do login se o usuário tem `role: "admin"` no Firestore. Caso contrário, redirecionar para a home.
- Nunca expor o role admin no frontend de forma manipulável. A verificação deve sempre vir do Firestore.

---

## 3. Stripe e Pagamentos

- Nunca expor a **secret key** do Stripe no frontend. Toda comunicação com a API do Stripe que exija a secret key deve ser feita via **Firebase Functions** no backend.
- Validar o valor do pedido no backend antes de criar o `PaymentIntent` — nunca confiar no valor enviado pelo frontend.
- Implementar **Stripe Webhooks** para confirmar pagamentos com segurança, usando `stripe.webhooks.constructEvent` para validar a assinatura.

---

## 4. Variáveis de Ambiente

- Todas as keys (Firebase, Stripe publishable key, Cloudinary) devem estar em variáveis de ambiente `.env`.
- O arquivo `.env` deve estar no `.gitignore`.
- Criar um arquivo `.env.example` com os nomes das variáveis sem os valores reais.

---

## 5. Proteção Contra Ataques Comuns (XSS, Injeção)

- Instalar e configurar o pacote `dompurify` para sanitizar qualquer input do usuário antes de salvar no Firestore (descrições de produtos, nomes, etc).
- Adicionar **rate limiting** nas Firebase Functions para evitar abuso.
- Configurar headers de segurança HTTP no `vercel.json` ou equivalente:
  - `X-Content-Type-Options`
  - `X-Frame-Options`
  - `Strict-Transport-Security`
  - `Referrer-Policy`

---

## 6. Uploads de Imagem (Cloudinary)

- Validar tipo e tamanho do arquivo no **frontend** antes do upload.
- Validar novamente nas **Firebase Storage Rules** (item 1).
- Após o upload, salvar no Firestore apenas a URL gerada — nunca dados brutos do arquivo.
- Nunca expor a Cloudinary API secret no frontend. Uploads devem ser assinados via Firebase Functions.

---

## 7. Boas Práticas Gerais

- Não logar informações sensíveis no console em produção.
- Usar `import.meta.env.MODE` para distinguir desenvolvimento de produção e desativar logs sensíveis em prod.
- Revisar todas as queries do Firestore para garantir que nenhuma retorna dados de outros usuários por erro de lógica.

---

## 8. Injeção e Manipulação de Dados (NoSQL Injection)

- O projeto usa Firestore (NoSQL), mas mesmo assim nunca construir queries usando diretamente dados do usuário sem validação. Usar sempre queries tipadas do SDK oficial do Firebase.
- Instalar e configurar a biblioteca **`zod`** para validar e tipar todos os dados recebidos de formulários antes de qualquer operação no Firestore. Criar schemas de validação para: produto (nome, descrição, preço, imagens), pedido, cadastro de usuário e checkout.
- Nunca usar `eval()`, `Function()` ou qualquer execução dinâmica de código com dados do usuário.
- Sanitizar todos os campos de texto com `dompurify` antes de renderizar no DOM para prevenir **XSS**.

---

## 9. Proteção Contra CSRF

- Todas as Firebase Functions que realizam operações sensíveis (criar pedido, confirmar pagamento) devem verificar o token de autenticação Firebase no header da requisição (`Authorization: Bearer <token>`). Nunca aceitar operações sensíveis sem token válido.

---

## 10. Proteção Contra Força Bruta e Enumeração

- Confirmar que a proteção nativa contra força bruta do Firebase Authentication está ativa.
- Limitar tentativas de login no lado do cliente: bloquear o botão de login por **30 segundos** após 5 tentativas falhas consecutivas.
- Nunca retornar em nenhuma resposta de API campos como: senha, token, role admin ou dados de outros usuários.
- No Firestore, garantir que a coleção de usuários só retorna para o próprio usuário os seus dados — nunca listar todos os usuários pelo frontend.
- Remover todos os `console.log` que contenham dados de usuários, pedidos ou tokens antes do deploy em produção.
- Rodar `npm audit` e corrigir todas as vulnerabilidades críticas e altas antes do deploy.

---

> Ao finalizar, apresente um resumo do que foi implementado em cada item (1 ao 10).
