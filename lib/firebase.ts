import { initializeApp, getApps } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: "AIzaSyDGYOZLXtjisklfRRVU6oZ9Lu6D3Rb6VbE",
  authDomain: "balu3d-6433e.firebaseapp.com",
  projectId: "balu3d-6433e",
  storageBucket: "balu3d-6433e.firebasestorage.app",
  messagingSenderId: "80221225815",
  appId: "1:80221225815:web:b7b041d471d66285e3b412",
  measurementId: "G-B1RNVZSRFZ",
}

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]

export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)
export default app
