import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useAuthFetch } from "../components/auth/AuthContext";
import {
  getBlocklistFromLocalStorage,
  setBlocklistToLocalStorage,
} from "../core/blocklist";
import { setJWTToLocalStorage } from "../core/user";

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
  const client = useQueryClient();
  const authFetch = useAuthFetch();

  useEffect(() => {
    getBlocklistFromLocalStorage().then((blocklist) => {
      if (blocklist !== null) {
        client.setQueryData<BlocklistsResponse>(["blocklist"], {
          blocklist: blocklist,
          status: "success",
        });
      }
    });
  }, [client]);

  const blocklists = useQuery<BlocklistsResponse>({
    queryKey: ["blocklist"],
    queryFn: async () => {
      const response = await authFetch(
        `${import.meta.env.WXT_API_BASE_URI}/blocklist`
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
  const authFetch = useAuthFetch();

  const mutation = useMutation({
    mutationFn: async (data: { domain: string; list_type: BlockListType }) => {
      const response = await authFetch(
        `${import.meta.env.WXT_API_BASE_URI}/blocklist`,
        {
          method: "POST",
          body: JSON.stringify(data),
        }
      );
      if (response.status === 400) {
        throw new Error("Invalid website url, please enter a valid URL");
      }
      if (response.status === 409) {
        throw new Error("Website already exists in the blocklist");
      }
      if (!response.ok) {
        throw new Error("Failed to add website to blocklist, please try again");
      }
      const responseData: AddBlockListResponse = await response.json();
      return responseData;
    },
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ["blocklist"] });
    },
  });
  return mutation;
}

export function useDeleteBlocklist() {
  const client = useQueryClient();
  const authFetch = useAuthFetch();

  const mutation = useMutation({
    mutationFn: async ({ blocklistId }: { blocklistId: string }) => {
      const response = await authFetch(
        `${import.meta.env.WXT_API_BASE_URI}/blocklist/${blocklistId}`,
        {
          method: "DELETE",
        }
      );
      if (response.status === 400) {
        throw new Error("Invalid Blocklist ID");
      }
      if (response.status === 404) {
        throw new Error("Blocklist entry not found");
      }
      if (!response.ok) {
        throw new Error("Failed to delete blocklist entry");
      }
    },
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ["blocklist"] });
    },
  });
  return mutation;
}

export interface LoginResponse {
  jwt: string;
  picture: string;
  email: string;
}

export function useLogin() {
  const mutation = useMutation({
    mutationFn: async (data: { token: string }) => {
      const response = await fetch(
        `${import.meta.env.WXT_API_BASE_URI}/user/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token: data.token }),
        }
      );
      if (response.status === 400 || !response.ok) {
        throw new Error("Failed to login, please try again");
      }
      const responseData: LoginResponse = await response.json();
      return responseData;
    },
    onSuccess: (data) => {
      setJWTToLocalStorage(data);
    },
  });
  return mutation;
}
