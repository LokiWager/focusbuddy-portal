import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import {
  getBlocklistFromLocalStorage,
  setBlocklistToLocalStorage,
} from "../core/blocklist";

export const BlockListType = {
  Work: 0,
  Study: 1,
  Personal: 2,
  Other: 3,
  Permanent: 4,
} as const;

export type BlockListType = (typeof BlockListType)[keyof typeof BlockListType];

export interface BlockListModel {
  id: string;
  domain: string;
  list_type: BlockListType;
}

interface BlocklistsResponse {
  blocklist: BlockListModel[];
  status: string;
}

export function useListBlocklist() {
  const userID = "test";
  const client = useQueryClient();
  useEffect(() => {
    getBlocklistFromLocalStorage().then((blocklist) => {
      client.setQueryData<BlocklistsResponse>(["blocklist", userID], {
        blocklist: blocklist,
        status: "success",
      });
    });
  }, [client]);
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

  useEffect(() => {
    if (blocklists.data?.blocklist) {
      setBlocklistToLocalStorage(blocklists.data.blocklist);
    }
  }, [blocklists.data?.blocklist]);
  return { blocklists: blocklists.data?.blocklist };
}

export interface AddBlockListResponse {
  status: string;
  id: string;
}

export function useAddBlocklist() {
  const client = useQueryClient();
  const mutation = useMutation({
    mutationFn: async (data: { domain: string; list_type: BlockListType }) => {
      const response = await fetch(
        `${import.meta.env.WXT_API_BASE_URI}/blocklist/test`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );
      const responseData: AddBlockListResponse = await response.json();
      return responseData;
    },
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ["blocklist", "test"] });
    },
  });
  return mutation;
}
