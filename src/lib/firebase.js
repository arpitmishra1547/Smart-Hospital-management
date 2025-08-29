"use client"

import { initializeApp, getApps, getApp } from "firebase/app"
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth"

const firebaseConfig = {
  apiKey: "AIzaSyDmCIJd2z2edUEj-KW_wblLOWbVXl0xtUY",
  authDomain: "smart-hospital-managemen-a8697.firebaseapp.com",
  projectId: "smart-hospital-managemen-a8697",
  storageBucket: "smart-hospital-managemen-a8697.firebasestorage.app",
  messagingSenderId: "650667721054",
  appId: "1:650667721054:web:af3d0aef6ccc2be2684fcf",
  measurementId: "G-NMHBV7EM8F",
}

export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp()
export const auth = getAuth(app)

function ensureHiddenRecaptchaContainer() {
  const id = "recaptcha-container"
  let el = document.getElementById(id)
  if (!el) {
    el = document.createElement("div")
    el.id = id
    el.style.position = "fixed"
    el.style.bottom = "-10000px"
    el.style.opacity = "0"
    document.body.appendChild(el)
  }
  return id
}

export function createRecaptcha() {
  if (!window.recaptchaVerifier) {
    const containerId = ensureHiddenRecaptchaContainer()
    window.recaptchaVerifier = new RecaptchaVerifier(auth, containerId, { size: "invisible" })
  }
  return window.recaptchaVerifier
}

export async function sendOtpToPhone(e164Phone) {
  const verifier = createRecaptcha()
  return signInWithPhoneNumber(auth, e164Phone, verifier)
}


