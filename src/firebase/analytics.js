import { doc, setDoc, increment, onSnapshot } from "firebase/firestore";
import { db } from "./config";

const viewsDoc = doc(db, "analytics", "pageViews");

export async function trackPageView() {
  try {
    await setDoc(viewsDoc, { count: increment(1) }, { merge: true });
  } catch {
    // analytics should never break the app
  }
}

export function subscribeToPageViews(callback) {
  return onSnapshot(viewsDoc, (snap) => {
    callback(snap.exists() ? (snap.data().count ?? 0) : 0);
  }, () => callback(null));
}
