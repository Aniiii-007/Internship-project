import { useState, useEffect, useCallback } from "react";
import { tutorConnectionApi, tutorProfileApi } from "../api/tutor.api";

// ─── useTutorProfile ──────────────────────────────────────────────────────────

export function useTutorOwnProfile() {
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    tutorProfileApi
      .getProfile()
      .then((data) => setProfile(data.tutorProfile ?? data))
      .catch(() => setError("Failed to load profile."))
      .finally(() => setIsLoading(false));
  }, []);

  return { profile, isLoading, error };
}

// ─── useTutorConnections ──────────────────────────────────────────────────────

export function useTutorConnections() {
  const [connections, setConnections] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const fetchConnections = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await tutorConnectionApi.getRequests();
      setConnections(Array.isArray(data) ? data : data.connections ?? []);
    } catch {
      setError("Failed to load connections.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConnections();
  }, []);

  const accept = async (connectionId: string) => {
    setActionLoadingId(connectionId);
    try {
      await tutorConnectionApi.accept(connectionId);
      setConnections((prev) =>
        prev.map((c) =>
          c.id === connectionId ? { ...c, status: "accepted" } : c
        )
      );
    } catch {
      setError("Failed to accept request.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const reject = async (connectionId: string) => {
    setActionLoadingId(connectionId);
    try {
      await tutorConnectionApi.reject(connectionId);
      setConnections((prev) =>
        prev.map((c) =>
          c.id === connectionId ? { ...c, status: "rejected" } : c
        )
      );
    } catch {
      setError("Failed to reject request.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const pending = connections.filter((c) => c.status === "pending");
  const accepted = connections.filter((c) => c.status === "accepted");
  const rejected = connections.filter((c) => c.status === "rejected");

  return {
    connections,
    pending,
    accepted,
    rejected,
    isLoading,
    error,
    actionLoadingId,
    accept,
    reject,
    refetch: fetchConnections,
  };
}
