// src/firebase.js

import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
// Analytics é opcional, então só importa se for usar
// import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyAAfFtBS5kI13Mqdm80mj1RgH1iPN_BPHw",
  authDomain: "prateleira-digital.firebaseapp.com",
  projectId: "prateleira-digital",
  storageBucket: "prateleira-digital.appspot.com",
  messagingSenderId: "382656710618",
  appId: "1:382656710618:web:d367dee2ca11bade4562e3",
  measurementId: "G-CDZ4ZTWWRW"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// ⚠️ Analytics desativado por segurança em localhost
// const analytics = getAnalytics(app);

export { db, auth };
