import { BlockListType, useAddBlocklist } from "@/common/api/api";
import { Button } from "@/common/components/ui/button";
import { Input } from "@/common/components/ui/input";
import { toast } from "@/common/hooks/use-toast";
import { useState } from "react";

export function AddBlocklist(props: {
  defaultListType: BlockListType;
  onAdded: (added: { domain: string; list_type: BlockListType }[]) => void;
}) {
  const { defaultListType, onAdded } = props;
  const [newWebsite, setNewWebsite] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<BlockListType[]>([defaultListType]);
  const addMutation = useAddBlocklist();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const isValid = newWebsite.length > 0;

  const toggleBlocklistType = (type: BlockListType) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    const requests = selectedTypes.map((type) => ({
      domain: newWebsite,
      list_type: type,
    }));

    for (const request of requests) {
      addMutation.mutate(request, {
        onError(err) {
          toast({
            variant: "destructive",
            title: "Uh oh! Something went wrong.",
            description: err.message,
          });
        },
      });
    }
    onAdded(requests);
    setIsModalOpen(false);
  };

  return (
    <div>
    <Button variant="outline" onClick={() => setIsModalOpen(true)}>New Website</Button>

    {isModalOpen && (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg shadow-2xl w-96">
        <center><h2 className="text-lg font-semibold">New Website</h2></center>
          <form className="grid gap-4 mt-4" onSubmit={handleSubmit}>
            <label className="text-base font-medium text-gray-700">Address:</label>
            <Input value={newWebsite} onChange={(e) => setNewWebsite(e.target.value)} />

            <label className="text-base font-medium text-gray-700 mt-1">Add to list:</label>
            <div className="flex flex-col space-y-2 text-sm">
              {Object.entries(BlockListType).map(([key, value]) => (
                <label key={value} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedTypes.includes(value as BlockListType)}
                    onChange={() => toggleBlocklistType(value as BlockListType)}
                  />
                  {key}
                </label>
              ))}
            </div>

            <div className="mt-4 flex flex-col gap-2">
              <Button type="submit" disabled={!isValid || addMutation.isPending}>
                {addMutation.isPending ? "Adding..." : "Add"}
              </Button>
              <Button className="bg-gray-200 hover:bg-gray-100 text-black px-4 py-2 rounded" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    )}
  </div>
);
}
