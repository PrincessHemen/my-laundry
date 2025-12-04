import { auth, googleProvider } from "./firebase";

import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup,
    sendPasswordResetEmail,
    signOut,
    updateProfile,
    User,
} from "firebase/auth";

export async function signUpWithEmail(name: string, email: string, password: string) {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    // set display name
    if (cred.user) {
      await updateProfile(cred.user, { displayName: name });
    }
    return cred.user;
}
  
export async function loginWithEmail(email: string, password: string) {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    return cred.user;
}
  
export async function signInWithGoogle() {
    const cred = await signInWithPopup(auth, googleProvider);
    return cred.user;
}
  
 export async function sendResetPasswordEmail(email: string) {
    await sendPasswordResetEmail(auth, email);
    return true;
}
  
export async function logout() {
    await signOut(auth);
    return true;
}