import { storage } from "wxt/storage";
import { GetFocusSessionResponse } from "../api/api";

const FOCUS_SESSION_STORAGE_KEY = "local:focus_sessions";
const NEXT_SESSION_STORAGE_KEY = "local:next_focus_session";


export async function getFocusSessionsFromLocalStorage(): Promise<GetFocusSessionResponse[] | null> {
  return await storage.getItem<GetFocusSessionResponse[]>(FOCUS_SESSION_STORAGE_KEY);
}


export async function setFocusSessionsToLocalStorage(focusSessions: GetFocusSessionResponse[]): Promise<void> {
  await storage.setItem(FOCUS_SESSION_STORAGE_KEY, focusSessions);
}


export async function getNextFocusSessionFromLocalStorage(): Promise<GetFocusSessionResponse | null> {
  return await storage.getItem<GetFocusSessionResponse>(NEXT_SESSION_STORAGE_KEY);
}


export async function setNextFocusSessionToLocalStorage(focusSession: GetFocusSessionResponse | null): Promise<void> {
  await storage.setItem(NEXT_SESSION_STORAGE_KEY, focusSession);
}
