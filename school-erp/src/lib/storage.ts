import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { storage } from "./firebase";

const MAX_SIZE = 5 * 1024 * 1024; // 5MB

function ensureStorage() {
  if (!storage) throw new Error("Firebase Storage not configured — check env vars");
  return storage;
}

export async function uploadFile(path: string, file: File): Promise<string> {
  if (file.size > MAX_SIZE) {
    throw new Error(`File exceeds ${MAX_SIZE / 1024 / 1024}MB limit`);
  }
  const storageRef = ref(ensureStorage(), path);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
}

export async function uploadSchoolFile(schoolId: string, folder: string, file: File): Promise<string> {
  const filename = `${Date.now()}-${file.name}`;
  return uploadFile(`schools/${schoolId}/${folder}/${filename}`, file);
}

export async function deleteFile(path: string): Promise<void> {
  return deleteObject(ref(ensureStorage(), path));
}
