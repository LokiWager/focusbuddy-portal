import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useAuthFetch } from "../components/auth/AuthContext";
import {
  addToLocalStorage,
  getBlocklistFromLocalStorage,
  removeFromLocalStorage,
  setBlocklistToLocalStorage,
} from "../core/blocklist";
import {
  getFocusSessionsFromLocalStorage,
  getNextFocusSessionFromLocalStorage,
  setFocusSessionsToLocalStorage,
  setNextFocusSessionToLocalStorage,
} from "../core/focustimer";
import { getJWTFromLocalStorage, setJWTToLocalStorage } from "../core/user";

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
  Completed: 3,
} as const;

export const UserStatus = {
  Work: 0,
  Study: 1,
  Personal: 2,
  Other: 3,
  Idle: 4,
} as const;

export type BlockListType = (typeof BlockListType)[keyof typeof BlockListType];
export type FocusSessionType =
  (typeof FocusSessionType)[keyof typeof FocusSessionType];
export type FocusSessionStatus =
  (typeof FocusSessionStatus)[keyof typeof FocusSessionStatus];
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

export interface FocusSessionModel {
  session_status: FocusSessionStatus;
  start_date?: string;
  start_time?: string;
  duration?: number;
  break_duration?: number;
  session_type?: FocusSessionType;
  remaining_focus_time: number;
  remaining_break_time: number;
}

interface AnalyticsTotalsResponse {
  daily: number;
  weekly: number;
  completed_sessions: number;
}

export interface AnalyticsListWeeklyChartResponse {
  session_type: FocusSessionType;
  duration: number;
}

interface AnalyticsListChartResponse {
  summary: AnalyticsListWeeklyChartResponse[];
  status: string;
}

export function useListAnalyticsDashBoard() {
  const authFetch = useAuthFetch();

  const analyticsTotals = useQuery<AnalyticsTotalsResponse>({
    queryKey: ["analytics"],
    queryFn: async () => {
      const response = await authFetch(
        `${import.meta.env.WXT_API_BASE_URI}/analytics`,
      );
      const data: AnalyticsTotalsResponse = await response.json();
      return data;
    },
  });

  return {
    daily: analyticsTotals.data?.daily || 0,
    weekly: analyticsTotals.data?.weekly || 0,
    completed_sessions: analyticsTotals.data?.completed_sessions || 0,
  };
}

export function useListAnalyticsWeeklyChart(startDate: Date, endDate: Date) {
  const authFetch = useAuthFetch();

  const formatDate = (date: Date) => {
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  };

  const analyticsWeeklyChart = useQuery<AnalyticsListChartResponse>({
    queryKey: ["analyticschart", startDate, endDate],
    queryFn: async () => {
      const formattedStartDate = formatDate(startDate);
      const formattedEndDate = formatDate(endDate);
      const response = await authFetch(
        `${import.meta.env.WXT_API_BASE_URI}/analytics/weeklysummary?start_date=${formattedStartDate}&end_date=${formattedEndDate}`,
      );
      const data: AnalyticsListChartResponse = await response.json();
      return data;
    },
    enabled: !!startDate && !!endDate,
  });

  return {
    summary: analyticsWeeklyChart.data?.summary || [],
    status: analyticsWeeklyChart.data?.status,
  };
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
        `${import.meta.env.WXT_API_BASE_URI}/blocklist`,
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
  domain: string;
  list_type: BlockListType;
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
        },
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
    onSuccess: async (data) => {
      await addToLocalStorage({
        id: data.id,
        domain: data.domain,
        list_type: data.list_type,
      });
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
        },
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
    onSuccess: async (data, request) => {
      await removeFromLocalStorage(request.blocklistId);
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
        },
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
        },
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
    mutationFn: async (data: FocusSessionModel) => {
      const response = await authFetch(
        `${import.meta.env.WXT_API_BASE_URI}/focustimer`,
        {
          method: "POST",
          body: JSON.stringify(data),
        },
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
      client.invalidateQueries({ queryKey: ["nextFocusSession"] });
    },
  });
  return mutation;
}

export function useUpdateFocusSession() {
  const client = useQueryClient();
  const authFetch = useAuthFetch();

  const mutation = useMutation({
    mutationFn: async ({
      sessionId,
      data,
    }: {
      sessionId: string;
      data: FocusSessionModel;
    }) => {
      const response = await authFetch(
        `${import.meta.env.WXT_API_BASE_URI}/focustimer/${sessionId}`,
        {
          method: "PUT",
          body: JSON.stringify(data),
        },
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
      client.invalidateQueries({ queryKey: ["nextFocusSession"] });
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
        },
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
      client.invalidateQueries({ queryKey: ["nextFocusSession"] });
    },
  });
  return mutation;
}

export function updateFocusSession(sessionId: string, data: any): Promise<any> {
  return getJWTFromLocalStorage().then((user) => {
    if (!user?.jwt) {
      return Promise.reject(new Error("No JWT token found"));
    }

    return fetch(
      `${import.meta.env.WXT_API_BASE_URI}/focustimer/${sessionId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-Auth-Token": user.jwt,
        },
        body: JSON.stringify(data),
      },
    )
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

export async function updateUserStatus(data: any): Promise<any> {
  const user = await getJWTFromLocalStorage();
  if (!user?.jwt) {
    return Promise.reject(new Error("No JWT token found"));
  }
  try {
    const response = await fetch(
      `${import.meta.env.WXT_API_BASE_URI}/user/status`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-Auth-Token": user.jwt,
        },
        body: JSON.stringify(data),
      },
    );
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to update user status");
    }
    return await response.json();
  } catch (error) {
    console.error("Error updating user status:", error);
    throw error;
  }
}

export interface GetFocusSessionResponse {
  session_id?: string;
  session_status?: FocusSessionStatus;
  start_date?: string;
  start_time?: string;
  duration?: number;
  break_duration?: number;
  session_type?: FocusSessionType;
  remaining_focus_time?: number;
  remaining_break_time?: number;
}

export interface GetAllFocusSessionResponse {
  focus_sessions?: GetFocusSessionResponse[];
  status: string;
}

export function useGetAllFocusSession(sessionStatus?: FocusSessionStatus) {
  const client = useQueryClient();
  const authFetch = useAuthFetch();

  useEffect(() => {
    getFocusSessionsFromLocalStorage().then((focusSessions) => {
      const currentData = client.getQueryData<GetAllFocusSessionResponse>([
        "focustimer",
        sessionStatus,
      ]);
      if (
        focusSessions !== null &&
        JSON.stringify(currentData) !== JSON.stringify(focusSessions)
      ) {
        client.setQueryData<GetAllFocusSessionResponse>(
          ["focustimer", sessionStatus],
          {
            focus_sessions: focusSessions,
            status: "success",
          },
        );
      }
    });
  }, [client, sessionStatus]);

  const query = useQuery({
    queryKey: ["focustimer", sessionStatus],
    queryFn: async () => {
      const url =
        sessionStatus !== undefined
          ? `${
              import.meta.env.WXT_API_BASE_URI
            }/focustimer?session_status=${sessionStatus}`
          : `${import.meta.env.WXT_API_BASE_URI}/focustimer`;

      const response = await authFetch(url, { method: "GET" });

      if (!response.ok) {
        throw new Error("Failed to fetch all focus sessions");
      }

      return response.json() as Promise<GetAllFocusSessionResponse>;
    },
  });

  useEffect(() => {
    if (query.data?.focus_sessions) {
      setFocusSessionsToLocalStorage(query.data.focus_sessions);
    }
  }, [query.data?.focus_sessions]);

  return query;
}

export interface GetNextFocusSessionResponse {
  focus_session?: GetFocusSessionResponse | null;
  status: string;
}

export function useGetNextFocusSession() {
  const client = useQueryClient();
  const authFetch = useAuthFetch();

  useEffect(() => {
    getNextFocusSessionFromLocalStorage().then((nextSession) => {
      if (nextSession !== null) {
        client.setQueryData<GetNextFocusSessionResponse>(["nextFocusSession"], {
          focus_session: nextSession,
          status: "success",
        });
      }
    });
  }, [client]);

  const query = useQuery({
    queryKey: ["nextFocusSession"],
    queryFn: async () => {
      const response = await authFetch(
        `${import.meta.env.WXT_API_BASE_URI}/focustimer/nextSession`,
        { method: "GET" },
      );

      if (!response.ok) {
        throw new Error("Failed to fetch next focus session");
      }

      return response.json() as Promise<GetNextFocusSessionResponse>;
    },
  });

  useEffect(() => {
    if (query.data?.focus_session !== undefined) {
      setNextFocusSessionToLocalStorage(query.data.focus_session);
    }
  }, [query.data?.focus_session]);

  return query;
}

export function getCurrFocusSession(): Promise<any> {
  return getJWTFromLocalStorage().then((user) => {
    if (!user?.jwt) {
      return Promise.reject(new Error("No JWT token found"));
    }

    return fetch(
      `${import.meta.env.WXT_API_BASE_URI}/focustimer?session_status=${
        FocusSessionStatus.Ongoing
      },${FocusSessionStatus.Paused}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "X-Auth-Token": user.jwt,
        },
      },
    )
      .then(async (response) => {
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to fetch focus session");
        }
        return response.json() as Promise<GetNextFocusSessionResponse>;
      })
      .catch((error) => {
        console.error("Error fetching current focus session:", error);
        throw error;
      });
  });
}
