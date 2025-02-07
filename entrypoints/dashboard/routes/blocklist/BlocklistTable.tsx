import { useState } from "react";
import { BlockListModel, useDeleteBlocklist } from "@/common/api/api";
import { getIconURLFromDomain } from "@/common/core/blocklist";

export function BlockListTable(props: {
  data: BlockListModel[];
  userId: string;
}) {
  const { data, userId } = props;
  const deleteBlocklist = useDeleteBlocklist();
  const [selectedItem, setSelectedItem] = useState<BlockListModel | null>(null);

  const handleDelete = () => {
    if (selectedItem) {
      deleteBlocklist.mutate({ userId, blocklistId: selectedItem.id });
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
            <button
              className="bg-white border border-gray-400 text-gray-600 px-3 py-1 rounded transition 
                         hover:border-gray-600 hover:text-black disabled:bg-gray-100 disabled:text-gray-500"
              onClick={() => setSelectedItem(item)}
              disabled={deleteBlocklist.isPending}
            >
              Remove
            </button>
          </div>
        ))}
      </div>
      {selectedItem && (
        <div className="fixed inset-0 flex items-center justify-center bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-lg font-semibold">Are you sure?</h2>
            <p className="mt-2 text-gray-700">
              Are you sure you want to remove{" "}
              <strong>{selectedItem.domain}</strong> from the list?
            </p>
            <div className="mt-4 flex flex-col gap-2">
              <button
                className="bg-red-300 hover:bg-red-400 text-black px-4 py-2 rounded"
                onClick={handleDelete}
                disabled={deleteBlocklist.isPending}
              >
                {deleteBlocklist.isPending
                  ? "Removing..."
                  : "Yes, unblock this site"}
              </button>
              <button
                className="bg-gray-300 hover:bg-gray-400 text-black px-4 py-2 rounded"
                onClick={() => setSelectedItem(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
