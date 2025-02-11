import { useState } from "react";
import { BlockListModel, useDeleteBlocklist } from "@/common/api/api";
import { getIconURLFromDomain } from "@/common/core/blocklist";
import { Button } from "@/common/components/ui/button";

export function BlockListTable(props: { data: BlockListModel[] }) {
  const { data } = props;
  const deleteBlocklist = useDeleteBlocklist();
  const [selectedItem, setSelectedItem] = useState<BlockListModel | null>(null);

  const handleDelete = () => {
    if (selectedItem) {
      deleteBlocklist.mutate({ blocklistId: selectedItem.id });
      setSelectedItem(null); // Close modal after deletion
    }
  };
  return (
    <div className="container mx-auto py-10">
      <div className="w-full space-y-3">
        {data.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-2">
              <img
                src={getIconURLFromDomain(item.domain)}
                alt="favicon"
                className="w-6 h-6"
              />
              <span className="text-gray-800 text-base font-medium">
                {item.domain}
              </span>
            </div>
            <Button
              variant="outline"
              onClick={() => setSelectedItem(item)}
              disabled={deleteBlocklist.isPending}
            >
              Remove
            </Button>
          </div>
        ))}
      </div>
      {selectedItem && (
        <div className="fixed inset-0 flex items-center justify-center text-center">
          <div className="bg-white p-6 rounded-lg shadow-2xl w-96">
            <h2 className="text-base">
              Are you sure you want to remove{" "}
              <strong>{selectedItem.domain}</strong> from the list?
            </h2>
            <div className="mt-4 flex flex-col gap-2">
              <Button
                className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded"
                onClick={handleDelete}
                disabled={deleteBlocklist.isPending}
              >
                {deleteBlocklist.isPending
                  ? "Removing..."
                  : "Yes, remove it from list"}
              </Button>
              <Button
                className="bg-gray-200 hover:bg-gray-100 text-black px-4 py-2 rounded"
                onClick={() => setSelectedItem(null)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
