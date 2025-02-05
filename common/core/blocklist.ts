import { storage } from "wxt/storage";
import { BlockListModel } from "../api/api";

const BLOCKLIST_STORAGE_KEY = "local:blocklist";
const ICON_SERVICE_URL = "https://www.google.com/s2/favicons?sz=128&domain=";

export function parseDomainFromURL(websiteURL: string): string {
  if (!websiteURL.includes("://")) {
    websiteURL = "https://" + websiteURL;
  }
  const url = new URL(websiteURL);
  return url.hostname;
}

export function getIconURLFromDomain(domain: string): string {
  return ICON_SERVICE_URL + parseDomainFromURL(domain);
}

export async function addToLocalStorage(value: BlockListModel): Promise<void> {
  const blocklist = await getBlocklistFromLocalStorage();
  blocklist.push(value);
  await setBlocklistToLocalStorage(blocklist);
}

export async function removeFromLocalStorage(id: string): Promise<void> {
  const blocklist = await getBlocklistFromLocalStorage();
  const newBlocklist = blocklist.filter((item) => item.id !== id);
  await setBlocklistToLocalStorage(newBlocklist);
}

export async function getBlocklistFromLocalStorage(): Promise<
  BlockListModel[]
> {
  return (await storage.getItem<BlockListModel[]>(BLOCKLIST_STORAGE_KEY)) || [];
}

export async function setBlocklistToLocalStorage(
  blocklist: BlockListModel[]
): Promise<void> {
  await storage.setItem(BLOCKLIST_STORAGE_KEY, blocklist);
}
