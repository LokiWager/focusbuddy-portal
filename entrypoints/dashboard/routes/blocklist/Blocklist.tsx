import { BlockListType, useListBlocklist } from "@/common/api/api";
import { Input } from "@/common/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/common/components/ui/tabs";
import { useState } from "react";
import { AddBlocklist } from "./AddBlocklist";
import { BlockListTable } from "./BlocklistTable";

export function Blocklist() {
  const [activeTab, setActiveTab] = useState<BlockListType>(BlockListType.Work);
  const { blocklists } = useListBlocklist();
  const data = blocklists || [];
  const [keyword, setKeyword] = useState("");
  const filteredData = data.filter(
    (item) => item.domain.includes(keyword) && item.list_type === activeTab
  );

  return (
    <div>
      <h1 className="text-2xl font-bold">Blocklist</h1>
      <div className="flex items-center justify-between gap-4 mt-4">
        <BlockListTabs activeTab={activeTab} onSelect={setActiveTab} />
        <Input
          placeholder="Search"
          onChange={(e) => {
            setKeyword(e.target.value);
          }}
          autoFocus
        />
        <AddBlocklist
          defaultListType={activeTab}
          onAdded={(added) => {
            setActiveTab(added.list_type);
          }}
        />
      </div>
      <BlockListTable data={filteredData} userId="test" />
    </div>
  );
}

function BlockListTabs(props: {
  activeTab: BlockListType;
  onSelect: (tab: BlockListType) => void;
}) {
  const { activeTab, onSelect } = props;
  return (
    <Tabs
      value={activeTab.toString()}
      onValueChange={(v) => onSelect(Number(v) as BlockListType)}
    >
      <TabsList>
        {Object.entries(BlockListType).map(([tabName, tabValue]) => (
          <TabsTrigger key={tabValue} value={tabValue.toString()}>
            {tabName}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
