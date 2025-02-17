import { browser } from "wxt/browser";

export async function blockSites(
  /**
   * An array of patterns to block. A pattern is a string that is part of a URL.
   *
   * Any URL that contains the pattern will be blocked, achieved by adding `*` before and after the pattern. See https://developer.chrome.com/docs/extensions/reference/api/declarativeNetRequest#property-RuleCondition-urlFilter for more information.
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
        urlFilter: `*${pattern}*`,
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
 * Unblocks all sites that are currently blocked.
 */
export async function unblockAllSites() {
  const enabledRules = await chrome.declarativeNetRequest.getDynamicRules();
  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: enabledRules.map((rule) => rule.id),
  });
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
        await blockSites(["youtube.com", "xiaohongshu.com"]);
        console.log("Blocked");
      } catch (e) {
        console.error(e);
        throw e;
      }
    },
    unblock: async () => {
      try {
        await unblockAllSites();
        console.log("Unblocked");
      } catch (e) {
        console.error(e);
        throw e;
      }
    },
  };
}
