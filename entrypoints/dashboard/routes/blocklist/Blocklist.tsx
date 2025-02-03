import { useState } from "react";
import { BlockListTable } from "./BlocklistTable";
import { Tabs, TabsList, TabsTrigger } from "@/common/components/ui/tabs";

export function Blocklist() {
  const [activeTab, setActiveTab] = useState<TabKey>("work");
  return (
    <div>
      <BlockListTabs activeTab={activeTab} onSelect={setActiveTab} />
      <BlockListTable />
    </div>
  );
}

const TABS = ["work", "study", "personal", "other"] as const;
const TabLabel: Record<TabKey, string> = {
  work: "Work",
  study: "Study",
  personal: "Personal",
  other: "Other",
};
type TabKey = (typeof TABS)[number];

function BlockListTabs(props: {
  activeTab: TabKey;
  onSelect: (tab: TabKey) => void;
}) {
  const { activeTab, onSelect } = props;
  return (
    <Tabs value={activeTab} onValueChange={(v) => onSelect(v as TabKey)}>
      <TabsList>
        {TABS.map((tab) => (
          <TabsTrigger key={tab} value={tab}>
            {TabLabel[tab]}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
