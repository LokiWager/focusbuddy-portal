import { useQuery } from "@tanstack/react-query";

interface BlockListModel {
  id: string;
  domain: string;
}

interface BlocklistsResponse {
  blocklist: BlockListModel[];
  status: string;
}

export function useListBlocklist() {
  // TODO: read from local first
  const userID = "test";
  const blocklists = useQuery<BlocklistsResponse>({
    queryKey: ["blocklist", userID],
    queryFn: async () => {
      const response = await fetch(
        `${import.meta.env.WXT_API_BASE_URI}/blocklist/${userID}`
      );
      const data: BlocklistsResponse = await response.json();
      return data;
    },
  });

  return { blocklists: blocklists.data?.blocklist };
}
