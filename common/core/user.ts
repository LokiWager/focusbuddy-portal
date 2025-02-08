import { storage } from "wxt/storage";
import { LoginResponse } from "../api/api";

const JWT_STORAGE_KEY = "local:jwt";

export async function setJWTToLocalStorage(user: LoginResponse): Promise<void> {
  await storage.setItem(JWT_STORAGE_KEY, user);
}

export async function getJWTFromLocalStorage(): Promise<LoginResponse | null> {
  return await storage.getItem<LoginResponse>(JWT_STORAGE_KEY);
}
