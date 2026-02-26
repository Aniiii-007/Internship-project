import { useState, useEffect, useCallback } from "react";
import { sessionApi } from "../api/session.api";
import type { Session } from "../types/session.types";

export function useSessions() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await sessionApi.getSessions();
      setSessions(data);
    } catch {
      setError("Failed to load sessions.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, []);

  return { sessions, isLoading, error, refetch: fetch };
}

export function useSession(id: string | null) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    sessionApi.getSession(id)
      .then(setSession)
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [id]);

  return { session, isLoading };
}

export function useSessionActions() {
  const [isLoading, setIsLoading] = useState(false);

  const start = async (id: string) => {
    setIsLoading(true);
    try {
      return await sessionApi.startSession(id);
    } finally {
      setIsLoading(false);
    }
  };

  const complete = async (id: string) => {
    setIsLoading(true);
    try {
      return await sessionApi.completeSession(id);
    } finally {
      setIsLoading(false);
    }
  };

  return { start, complete, isLoading };
}
