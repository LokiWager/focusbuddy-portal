import { browser } from "wxt/browser";
import { getBlocklistFromLocalStorage } from "@/common/core/blocklist";
import { BlockListType } from "@/common/api/api";

/**
 * Blocks all sites of a given type.
 */
export async function blockSites(type: BlockListType | null) {
  const blocklist = await getBlocklistFromLocalStorage();
  if (!blocklist) {
    return;
  }
  const patterns = blocklist
    .filter(
      (item) =>
        item.list_type === type || item.list_type === BlockListType.Permanent
    )
    .map((item) => {
      return item.domain.replace(/^https?:\/\//, "||");
    });
  console.log("[blockSites]", `Blocking ${patterns.length} sites.`);
  await blockPatterns(patterns);
}

export async function blockPatterns(
  /**
   * An array of patterns to block. A pattern is a string that is part of a URL. See https://developer.chrome.com/docs/extensions/reference/api/declarativeNetRequest#property-RuleCondition-urlFilter for syntax information.
   */
  patterns: string[]
) {
  const enabledRules = await chrome.declarativeNetRequest.getDynamicRules();
  console.log("[blockSites]", `Found ${enabledRules.length} enabled rules.`);
  const idGenerator = getIdGenerator(enabledRules.map((rule) => rule.id));

  const addRules: chrome.declarativeNetRequest.Rule[] = patterns.map(
    (pattern) => ({
      id: idGenerator.next().value,
      priority: 1,
      action: {
        type: chrome.declarativeNetRequest.RuleActionType.REDIRECT,
        redirect: {
          url: browser.runtime.getURL("/dashboard.html#/blocked"),
        },
      },
      condition: {
        urlFilter: pattern,
        resourceTypes: [chrome.declarativeNetRequest.ResourceType.MAIN_FRAME],
      },
    })
  );
  console.log("[blockSites]", `Adding ${addRules.length} rules.`);

  await chrome.declarativeNetRequest.updateDynamicRules({
    addRules,
    removeRuleIds: enabledRules.map((rule) => rule.id),
  });

  console.log("[blockSites]", "Rules added.");
}

/**
 * Unblocks all non-permanent sites that are currently blocked.
 */
export async function blockPermanentSites() {
  await blockSites(null);
}

function* getIdGenerator(
  existingIds: number[] | Set<number>
): Generator<number> {
  const existingIdsSet = new Set(existingIds);

  let i = 1;
  while (true) {
    if (!existingIdsSet.has(i)) {
      yield i;
    }
    i++;
  }
}

export function blockDebugger() {
  return {
    block: async () => {
      try {
        await blockPatterns(["||youtube.com", "||xiaohongshu.com"]);
        console.log("Blocked");
      } catch (e) {
        console.error(e);
        throw e;
      }
    },
    unblock: async () => {
      try {
        await blockPermanentSites();
        console.log("Unblocked");
      } catch (e) {
        console.error(e);
        throw e;
      }
    },
  };
}
