import { z } from 'zod'

// ─── Helpers ─────────────────────────────────────────────────────────────
const nonEmpty = (label: string, max = 200) =>
  z.string().trim().min(1, `${label} é obrigatório`).max(max, `${label} muito longo`)

const emailSchema = z.string().trim().toLowerCase().email('E-mail inválido').max(254)

const brazilianPhone = z
  .string()
  .trim()
  .regex(/^\+?55?\s?\(?\d{2}\)?\s?9?\d{4}-?\d{4}$|^\d{10,13}$/, 'Telefone inválido')

// ─── Produto (admin) ─────────────────────────────────────────────────────
export const productSchema = z.object({
  name: nonEmpty('Nome').max(120),
  slug: z.string().trim().regex(/^[a-z0-9-]+$/, 'Slug inválido').max(120),
  price: z.number().positive('Preço deve ser positivo').max(100000),
  oldPrice: z.number().positive().max(100000).optional(),
  category: z.enum(['Classic', 'Legendary', 'Shiny', 'Limited']),
  img: z.string().url('URL de imagem inválida').max(2048),
  images: z.array(z.string().url().max(2048)).max(10).optional(),
  description: z.string().trim().max(5000),
  stock: z.number().int().min(0).max(100000),
  height: z.string().trim().max(50),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Cor inválida (hex)'),
  badges: z.array(z.string().max(30)).max(5),
  sizes: z.array(z.string().max(10)).max(10).optional(),
  visible: z.boolean(),
})
export type ProductInput = z.infer<typeof productSchema>

// ─── Usuário (cadastro) ──────────────────────────────────────────────────
export const userRegisterSchema = z.object({
  name: nonEmpty('Nome').min(2).max(80),
  email: emailSchema,
  password: z
    .string()
    .min(8, 'Senha deve ter pelo menos 8 caracteres')
    .max(128, 'Senha muito longa')
    .regex(/[A-Z]/, 'Senha precisa de uma letra maiúscula')
    .regex(/[0-9]/, 'Senha precisa de um número'),
})
export type UserRegisterInput = z.infer<typeof userRegisterSchema>

export const userLoginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Senha obrigatória').max(128),
})

// ─── Endereço (checkout) ─────────────────────────────────────────────────
const addressSchema = z.object({
  cep: z.string().trim().regex(/^\d{5}-?\d{3}$/, 'CEP inválido'),
  rua: nonEmpty('Rua').max(200),
  numero: z.string().trim().max(20),
  complemento: z.string().trim().max(100).optional(),
  bairro: nonEmpty('Bairro').max(100),
  cidade: nonEmpty('Cidade').max(100),
  estado: z.string().trim().length(2, 'UF inválido'),
})

// ─── Pedido / Checkout ───────────────────────────────────────────────────
export const orderItemSchema = z.object({
  productId: z.string().max(128),
  slug: z.string().max(128),
  name: nonEmpty('Nome do produto').max(200),
  price: z.number().positive().max(100000),
  quantity: z.number().int().positive().max(100),
  img: z.string().url().max(2048).optional(),
})

export const checkoutSchema = z.object({
  name: nonEmpty('Nome').max(120),
  email: emailSchema,
  phone: brazilianPhone,
  address: addressSchema,
  items: z.array(orderItemSchema).min(1, 'Carrinho vazio').max(50),
  couponCode: z.string().trim().max(30).optional(),
  shippingMethod: z.enum(['pac', 'sedex', 'retirada']).optional(),
  notes: z.string().trim().max(500).optional(),
})
export type CheckoutInput = z.infer<typeof checkoutSchema>

// ─── Review ──────────────────────────────────────────────────────────────
export const reviewSchema = z.object({
  productSlug: z.string().trim().min(1).max(128),
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().min(3).max(1000),
  userName: nonEmpty('Nome').max(80),
})

// ─── Newsletter ──────────────────────────────────────────────────────────
export const newsletterSchema = z.object({ email: emailSchema })

// ─── Cupom ───────────────────────────────────────────────────────────────
export const couponSchema = z.object({
  code: z.string().trim().toUpperCase().regex(/^[A-Z0-9_-]{3,30}$/, 'Código inválido'),
  type: z.enum(['percent', 'fixed']),
  value: z.number().positive().max(100000),
  minOrder: z.number().min(0).max(100000).optional(),
  active: z.boolean(),
  expiresAt: z.string().datetime().optional(),
})
