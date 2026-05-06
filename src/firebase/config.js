import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyCEYH9EQsThuybLbO_9uo3fLJ-Qjx90s70",
  authDomain: "igroteka-znaniy-cd40a.firebaseapp.com",
  projectId: "igroteka-znaniy-cd40a",
  storageBucket: "igroteka-znaniy-cd40a.firebasestorage.app",
  messagingSenderId: "690798643405",
  appId: "1:690798643405:web:3746154486ee369c9c4184",
  measurementId: "G-W0SS8RNL6J"
}

// Инициализация Firebase
const app = initializeApp(firebaseConfig)

// Сервисы
export const auth = getAuth(app)
export const db = getFirestore(app)
export default app