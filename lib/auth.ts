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

// ─── Registro ────────────────────────────────────────────────────────────────

export async function register(name: string, email: string, password: string) {
  const credential = await createUserWithEmailAndPassword(auth, email, password)
  await updateProfile(credential.user, { displayName: name })

  // Cria documento do usuário no Firestore
  await setDoc(doc(db, 'users', credential.user.uid), {
    uid: credential.user.uid,
    name,
    email,
    role: 'customer',
    createdAt: serverTimestamp(),
  })

  return credential.user
}

// ─── Login ───────────────────────────────────────────────────────────────────

export async function login(email: string, password: string) {
  const credential = await signInWithEmailAndPassword(auth, email, password)
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
