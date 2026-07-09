import { ref, get, set, push, update, remove, query, orderByChild, equalTo, onValue, type Unsubscribe } from "firebase/database";
import { db } from "./firebase";

function ensureDb() {
  if (!db) throw new Error("Firebase Database not configured — check env vars");
  return db;
}

function schoolRef(schoolId: string, path: string) {
  return ref(ensureDb(), `schools/${schoolId}/${path}`);
}

export function getSchoolData<T>(schoolId: string, path: string): Promise<T | null> {
  return get(schoolRef(schoolId, path)).then((snap) => snap.val() as T | null);
}

export function setSchoolData<T>(schoolId: string, path: string, data: T) {
  return set(schoolRef(schoolId, path), data);
}

export function pushSchoolData<T>(schoolId: string, path: string, data: T) {
  return push(schoolRef(schoolId, path), data);
}

export function updateSchoolData(schoolId: string, path: string, data: Record<string, unknown>) {
  return update(schoolRef(schoolId, path), data);
}

export function removeSchoolData(schoolId: string, path: string) {
  return remove(schoolRef(schoolId, path));
}

export function querySchoolData(schoolId: string, path: string, orderBy: string, value: string) {
  return get(query(schoolRef(schoolId, path), orderByChild(orderBy), equalTo(value)));
}

export function subscribeSchoolData<T>(
  schoolId: string,
  path: string,
  callback: (data: T | null) => void
): Unsubscribe {
  return onValue(schoolRef(schoolId, path), (snap) => callback(snap.val() as T | null));
}
