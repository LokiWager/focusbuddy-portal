import { BlockListModel } from "@/common/api/api";
import { getIconURLFromDomain } from "@/common/core/blocklist";

export function BlockListTable(props: { data: BlockListModel[] }) {
  const { data } = props;

  return (
    <div className="container mx-auto py-10">
      <div className="w-full">
        {data.map((item) => (
          <div key={item.id}>
            <div className="flex items-center gap-2">
              <img
                src={getIconURLFromDomain(item.domain)}
                alt="favicon"
                className="w-6 h-6"
              />
              {item.domain}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
