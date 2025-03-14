import { BlockListType, useAddBlocklist } from "@/common/api/api";
import { Button } from "@/common/components/ui/button";
import { toast } from "@/common/hooks/use-toast";
import { useState, useEffect } from "react";
import { getIconURLFromDomain } from "@/common/core/blocklist";

export function AddBlocklist(props: {
  defaultListType: BlockListType;
  onAdded: (added: { domain: string; list_type: BlockListType }[]) => void;
}) {
  const { defaultListType, onAdded } = props;
  const [newWebsites, setNewWebsites] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<BlockListType[]>([]);
  const addMutation = useAddBlocklist();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const isValid = newWebsites.length > 0;

  useEffect(() => {
    if (isModalOpen) {
      setNewWebsites([]);
      setSelectedTypes([defaultListType]);
    }
  }, [isModalOpen, defaultListType]);

  const toggleBlocklistType = (type: BlockListType) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
    );
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    const requests = newWebsites.flatMap(domain =>
      selectedTypes.map((type) => ({ domain, list_type: type }))
    );

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
    toast({
      title: "Success!",
      description: `Added ${newWebsites.length} websites to your blocklist.`,
    });
    onAdded(requests);
    setIsModalOpen(false);
  };

  const suggestedWebsites = [
    "youtube.com", "facebook.com", "x.com", "tiktok.com",
    "reddit.com", "instagram.com", "netflix.com", "amazon.com"
  ];

  return (
    <div>
      <Button variant="outline" onClick={() => setIsModalOpen(true)}>
        New Website
      </Button>

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-2xl w-96">
            <center>
              <h2 className="text-lg font-semibold">New Website</h2>
            </center>
            <form className="grid gap-4 mt-4" onSubmit={handleSubmit}>
              <label className="text-base font-medium text-gray-700">
                URL:
              </label>
              <textarea
                data-testid="url-input"
                autoFocus
                placeholder="For multiple websites, enter one website per line"
                value={newWebsites.join("\n")}
                onChange={(e) => setNewWebsites(e.target.value.split("\n").map(site => site.trim()))}
                className="border p-2 rounded w-full"
              />
  
              <div className="mt-4">
                <p className="font-semibold mb-4">Suggested Websites:</p>
                <div className="grid grid-cols-2 gap-2">
                  {suggestedWebsites.map(site => (
                    <button
                      key={site}
                      className="border rounded px-3 py-2 flex items-center justify-between w-full hover:bg-gray-100"
                      onClick={() => setNewWebsites(prev => [...new Set([...prev, site])])}
                    >
                      <img src={getIconURLFromDomain(site)} alt={site} className="w-5 h-5 rounded" />
                      <span className="flex-1 text-center font-medium">{site}</span>
                      <span className="text-lg font-semibold">+</span>
                    </button>
                  ))}
                </div>
              </div>

              <label className="text-base font-medium text-gray-700 mt-1">
                Add to list:
              </label>
              <div className="flex flex-col space-y-2 text-sm">
                {Object.entries(BlockListType).map(([key, value]) => (
                  <label
                    key={value}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedTypes.includes(value as BlockListType)}
                      onChange={() =>
                        toggleBlocklistType(value as BlockListType)
                      }
                    />
                    {key}
                  </label>
                ))}
              </div>

              <div className="mt-4 flex flex-col gap-2">
                <Button
                  type="submit"
                  disabled={!isValid || addMutation.isPending}
                >
                  {addMutation.isPending ? "Adding..." : "Add"}
                </Button>
                <Button
                  className="bg-gray-200 hover:bg-gray-100 text-black px-4 py-2 rounded"
                  onClick={() => setIsModalOpen(false)}
                >
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
