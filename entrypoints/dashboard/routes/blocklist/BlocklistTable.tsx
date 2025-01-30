import { useListBlocklist } from "@/common/api/api";
import { Input } from "@/common/components/ui/input";
import { useState } from "react";

interface BlockList {
  id: string;
  icon: string;
  url: string;
}

function useData(): BlockList[] {
  const { blocklists } = useListBlocklist();
  const data = blocklists?.map((model) => ({
    id: model.id,
    icon: "https://www.google.com/s2/favicons?sz=128&domain=" + model.domain,
    url: model.domain,
  }));
  return data || [];
}

export function BlockListTable() {
  const data = useData();
  const [keyword, setKeyword] = useState("");
  const filteredData = data.filter((item) => item.url.includes(keyword));

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold">Blocklist</h1>
      <Input
        className="mt-4"
        placeholder="Search"
        onChange={(e) => {
          setKeyword(e.target.value);
        }}
        autoFocus
      />
      <div className="w-full mt-4">
        {filteredData.map((item) => (
          <div key={item.id}>
            <div className="flex items-center gap-2">
              <img src={item.icon} alt="favicon" className="w-6 h-6" />
              {item.url}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
