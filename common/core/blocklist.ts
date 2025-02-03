import { storage } from "wxt/storage";

const BLOCKLIST_STORAGE_KEY = "local:blocklist";

export function parseDomainFromURL(websiteURL: string): string {
  const url = new URL(websiteURL);
  return url.hostname;
}

interface BlocklistStorage {
  id: string;
  url: string;
  type: string;
}

export async function addToLocalStorage(
  value: BlocklistStorage
): Promise<void> {
  const blocklist = await getBlocklistFromLocalStorage();
  blocklist.push(value);
  storage.setItem(BLOCKLIST_STORAGE_KEY, blocklist);
}

export async function removeFromLocalStorage(id: string): Promise<void> {
  const blocklist = await getBlocklistFromLocalStorage();
  const newBlocklist = blocklist.filter((item) => item.id !== id);
  storage.setItem(BLOCKLIST_STORAGE_KEY, newBlocklist);
}

export async function getBlocklistFromLocalStorage(): Promise<
  BlocklistStorage[]
> {
  return (
    (await storage.getItem<BlocklistStorage[]>(BLOCKLIST_STORAGE_KEY)) || []
  );
}
