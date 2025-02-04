import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

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


// Focus Timer API
export interface SessionModel {
  user_id: string;
  session_id: string;
  session_status: number; 
  start_date: string;     // format: YYYY-MM-DD
  start_time: string;     // format: HH:MM:SS
  duration: number;       // in minutes
  break_time: number;     // in minutes
  type: number;           
  remaining_runtime: string;   // format: MM:SS
  remaining_breaktime: string; // format: MM:SS
}


export interface SessionsResponse {
  sessions: SessionModel[];
  status: string;
}


export function useListSessions() {
  const userID = "test";
  const sessions = useQuery<SessionsResponse>({
    queryKey: ["sessions", userID],
    queryFn: async () => {
      const response = await fetch(
        `${import.meta.env.WXT_API_BASE_URI}/sessions/${userID}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch sessions");
      }
      const data: SessionsResponse = await response.json();
      return data;
    },
  });

  return { sessions: sessions.data?.sessions };
}


export function useAddSession() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async (session: SessionModel) => {
      const response = await fetch(
        `${import.meta.env.WXT_API_BASE_URI}/sessions`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(session),
        }
      );
      if (!response.ok) {
        throw new Error("Failed to add session");
      }
      return response.json();
    },
    onSuccess: (_, session) => {
      // 使缓存失效并重新获取数据
      queryClient.invalidateQueries({
        queryKey: ["sessions", session.user_id],
      });
    },
  });

  return mutation;
}

export function useDeleteSession() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async (sessionId: string) => {
      const response = await fetch(
        `${import.meta.env.WXT_API_BASE_URI}/sessions/${sessionId}`,
        { method: "DELETE" }
      );
      if (!response.ok) {
        throw new Error("Failed to delete session");
      }
      return response.json();
    },
    onSuccess: () => {
      // 使缓存失效并重新获取数据
      queryClient.invalidateQueries({
        queryKey: ["sessions"],
      });
    },
  });

  return mutation;
}



