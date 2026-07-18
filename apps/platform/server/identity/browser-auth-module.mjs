export function createBrowserAuthModuleSource(identityProvider) {
  if (identityProvider === "firebase") {
    return `
export { getApps, initializeApp } from "https://esm.sh/firebase@10.12.2/app";
export {
  browserLocalPersistence,
  getAuth,
  GoogleAuthProvider,
  onIdTokenChanged,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as signOutFirebaseAuth,
} from "https://esm.sh/firebase@10.12.2/auth";
`;
  }
  return `
export const browserLocalPersistence = null;
export function getApps() { return []; }
export function initializeApp(config, name) { return { config, name }; }
export function getAuth() { return null; }
export class GoogleAuthProvider {}
export function onIdTokenChanged(_auth, listener) {
  queueMicrotask(() => listener(null));
  return () => {};
}
export async function setPersistence() {}
export async function signInWithEmailAndPassword() {
  throw new Error("Password sign-in is managed by the configured OIDC provider.");
}
export async function signInWithPopup() {
  throw new Error("Social sign-in is managed by the configured OIDC provider.");
}
export async function signOutFirebaseAuth() {}
`;
}
