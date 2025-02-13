import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useAuthFetch } from "../components/auth/AuthContext";
import {
  getBlocklistFromLocalStorage,
  setBlocklistToLocalStorage,
} from "../core/blocklist";
import { setJWTToLocalStorage, getJWTFromLocalStorage } from "../core/user";

export const BlockListType = {
  Work: 0,
  Study: 1,
  Personal: 2,
  Other: 3,
  Permanent: 4,
} as const;

export const FocusSessionType = {
  Work: 0,
  Study: 1,
  Personal: 2,
  Other: 3,
} as const;

export const FocusSessionStatus = {
  Upcoming: 0,
  Ongoing: 1,
  Paused: 2,
  Completed: 3
} as const;

export const UserStatus = {
  Work: 0,
  Study: 1,
  Personal: 2,
  Other: 3,
  Idle: 4,
} as const;

export type BlockListType = (typeof BlockListType)[keyof typeof BlockListType];
export type FocusSessionType = (typeof FocusSessionType)[keyof typeof FocusSessionType];
export type FocusSessionStatus = (typeof FocusSessionStatus)[keyof typeof FocusSessionStatus];
export type UserStatus = (typeof UserStatus)[keyof typeof UserStatus];

export interface BlockListModel {
  id: string;
  domain: string;
  list_type: BlockListType;
}

interface BlocklistsResponse {
  blocklist: BlockListModel[];
  status: string;
}

interface FocusSessionModel {
  session_status: FocusSessionStatus;
  start_date?: string;
  start_time?: string;
  duration?: number;
  break_duration?: number;
  session_type?: FocusSessionType;
  remaining_focus_time: number;
  remaining_break_time: number;
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

export interface EditFocusSessionResponse {
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

export function useUpdateUserStatus() {
  const client = useQueryClient();
  const authFetch = useAuthFetch();

  const mutation = useMutation({
    mutationFn: async (status: UserStatus) => {
      const response = await authFetch(
        `${import.meta.env.WXT_API_BASE_URI}/user/status`,
        {
          method: "PUT",
          body: JSON.stringify({ user_status: status }),
        }
      );
      if (!response.ok) {
        throw new Error("Failed to update user status, please try again");
      }
    },
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ["user"] });
    },
  });
  return mutation;
}

export function useAddFocusSession() {
  const client = useQueryClient();
  const authFetch = useAuthFetch();

  const mutation = useMutation({
    mutationFn: async ( data: FocusSessionModel ) => {
      const response = await authFetch(
        `${import.meta.env.WXT_API_BASE_URI}/focustimer`,
        {
          method: "POST",
          body: JSON.stringify(data),
        }
      );
      if (response.status === 409) {
        throw new Error("Focus session conflict with upcoming sessions");
      }
      if (!response.ok) {
        throw new Error("Failed to add focus session, please try again");
      }
      const responseData: EditFocusSessionResponse = await response.json();
      return responseData;
    },
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ["focustimer"] });
    },
  });
  return mutation;
}

export function useUpdateFocusSession() {
  const client = useQueryClient();
  const authFetch = useAuthFetch();

  const mutation = useMutation({
    mutationFn: async ({ sessionId, data }: { sessionId: string; data: FocusSessionModel }) => {
      const response = await authFetch(
        `${import.meta.env.WXT_API_BASE_URI}/focustimer/${sessionId}`,
        {
          method: "PUT",
          body: JSON.stringify(data),
        }
      );
      if (response.status === 400) {
        throw new Error("No fields to update");
      }
      if (!response.ok) {
        throw new Error("Failed to update focus session, please try again");
      }
      const responseData: EditFocusSessionResponse = await response.json();
      return responseData;
    },
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ["focustimer"] });
    },
  });
  return mutation;
}

export function useDeleteFocusSession() {
  const client = useQueryClient();
  const authFetch = useAuthFetch();

  const mutation = useMutation({
    mutationFn: async ({ sessionId }: { sessionId: string }) => {
      const response = await authFetch(
        `${import.meta.env.WXT_API_BASE_URI}/focustimer/${sessionId}`,
        {
          method: "DELETE",
        }
      );
      if (response.status === 404) {
        throw new Error("Focus session not found");
      }
      if (!response.ok) {
        throw new Error("Failed to delete focus session");
      }
    },
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ["focustimer"] });
    },
  });
  return mutation;
}

export function updateFocusSession(sessionId: string, data: any): Promise<any> {
  return getJWTFromLocalStorage().then((user) => {
    if (!user?.jwt) {
      return Promise.reject(new Error("No JWT token found"));
    }

    return fetch(`${import.meta.env.WXT_API_BASE_URI}/focustimer/${sessionId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-Auth-Token": user.jwt,
      },
      body: JSON.stringify(data),
    })
      .then(async (response) => {
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to update session");
        }
        return response.json();
      })
      .catch((error) => {
        console.error("Error updating focus session:", error);
        throw error;
      });
  });
}

export function updateUserStatus(data: any): Promise<any> {
  return getJWTFromLocalStorage().then((user) => {
    if (!user?.jwt) {
      return Promise.reject(new Error("No JWT token found"));
    }

    return fetch(`${import.meta.env.WXT_API_BASE_URI}/user/status`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-Auth-Token": user.jwt,
      },
      body: JSON.stringify(data),
    })
      .then(async (response) => {
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to update user status");
        }
        return response.json();
      })
      .catch((error) => {
        console.error("Error updating user status:", error);
        throw error;
      });
  });
}
