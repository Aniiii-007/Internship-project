import { useState, useEffect, useCallback } from "react";
import { AxiosError } from "axios";
import { discoveryApi, connectionApi } from "../api/student.api";
import type {
  TutorSummary,
  TutorDetail,
  SearchParams,
  Connection,
} from "../types/student.types";

// ─── useRecommendations ───────────────────────────────────────────────────────

export function useRecommendations() {
  const [tutors, setTutors] = useState<TutorSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    discoveryApi
      .getRecommendations()
      .then((data) => setTutors(data.tutors))
      .catch(() => setError("Failed to load recommendations."))
      .finally(() => setIsLoading(false));
  }, []);

  return { tutors, isLoading, error };
}

// ─── useSearch ────────────────────────────────────────────────────────────────

export function useSearch() {
  const [tutors, setTutors] = useState<TutorSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [params, setParams] = useState<SearchParams>({
    page: 1,
    limit: 12,
  });

  const search = useCallback(async (newParams?: SearchParams) => {
    setIsLoading(true);
    setError(null);
    const merged = { ...params, ...newParams, page: newParams?.page ?? 1 };
    setParams(merged);
    try {
      const data = await discoveryApi.searchTutors(merged);
      setTutors(data.tutors ?? []);
      setTotal(data.total ?? 0);
    } catch {
      setError("Search failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [params]);

  // Initial load
  useEffect(() => {
    search();
  }, []);

  return { tutors, total, isLoading, error, params, search };
}

// ─── useTutorProfile ──────────────────────────────────────────────────────────

export function useTutorProfile(tutorId: string) {
  const [tutor, setTutor] = useState<TutorDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!tutorId) return;
    discoveryApi
      .getTutorById(tutorId)
      .then(setTutor)
      .catch(() => setError("Failed to load tutor profile."))
      .finally(() => setIsLoading(false));
  }, [tutorId]);

  return { tutor, isLoading, error };
}

// ─── useConnections ───────────────────────────────────────────────────────────

export function useConnections() {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    connectionApi
      .getAll()
      .then(setConnections)
      .catch(() => setError("Failed to load connections."))
      .finally(() => setIsLoading(false));
  }, []);

  const sendRequest = async (tutorId: string) => {
    setSendingId(tutorId);
    try {
      const result = await connectionApi.sendRequest(tutorId);
      setConnections((prev) => [...prev, result.connection]);
      return true;
    } catch (err) {
      const axiosError = err as AxiosError<{ message: string }>;
      setError(axiosError.response?.data?.message || "Failed to send request.");
      return false;
    } finally {
      setSendingId(null);
    }
  };

  const getConnectionStatus = (tutorId: string) => {
    return connections.find((c) => c.tutorId === tutorId)?.status ?? null;
  };

  return {
    connections,
    isLoading,
    sendingId,
    error,
    sendRequest,
    getConnectionStatus,
  };
}
