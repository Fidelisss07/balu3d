import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  type User,
} from 'firebase/auth'
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from './firebase'
import { userLoginSchema, userRegisterSchema } from './schemas'
import { sanitizeText } from './sanitize'

// ─── Registro ────────────────────────────────────────────────────────────────

export async function register(name: string, email: string, password: string) {
  const parsed = userRegisterSchema.parse({ name, email, password })
  const safeName = sanitizeText(parsed.name)

  const credential = await createUserWithEmailAndPassword(auth, parsed.email, parsed.password)
  await updateProfile(credential.user, { displayName: safeName })

  // Cria documento do usuário no Firestore (role fixa = customer;
  // nunca aceitamos role vindo do cliente).
  await setDoc(doc(db, 'users', credential.user.uid), {
    uid: credential.user.uid,
    name: safeName,
    email: parsed.email,
    role: 'customer',
    createdAt: serverTimestamp(),
  })

  return credential.user
}

// ─── Login ───────────────────────────────────────────────────────────────────

export async function login(email: string, password: string) {
  const parsed = userLoginSchema.parse({ email, password })
  const credential = await signInWithEmailAndPassword(auth, parsed.email, parsed.password)
  return credential.user
}

// ─── Logout ──────────────────────────────────────────────────────────────────

export async function logout() {
  await signOut(auth)
}

// ─── Recuperar senha ─────────────────────────────────────────────────────────

export async function resetPassword(email: string) {
  await sendPasswordResetEmail(auth, email)
}

// ─── Buscar perfil do Firestore ──────────────────────────────────────────────

export async function getUserProfile(user: User) {
  const snap = await getDoc(doc(db, 'users', user.uid))
  return snap.exists() ? snap.data() : null
}
