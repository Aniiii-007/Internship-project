/*import { useState, useEffect, useCallback } from "react";
import { adminApi } from "../api/admin.api";

// ─── useAdminTutors ───────────────────────────────────────────────────────────

export function useAdminTutors(statusFilter?: string) {
  const [tutors, setTutors] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const fetchTutors = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await adminApi.getTutors(statusFilter);
      setTutors(Array.isArray(data) ? data : data.tutors ?? []);
    } catch {
      setError("Failed to load tutors.");
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => { fetchTutors(); }, [fetchTutors]);

  const approve = async (tutorId: string) => {
    setActionLoadingId(tutorId);
    try {
      await adminApi.approveTutor(tutorId);
      setTutors((prev) =>
        prev.map((t) => t.id === tutorId ? { ...t, status: "approved" } : t)
      );
    } catch { setError("Failed to approve tutor."); }
    finally { setActionLoadingId(null); }
  };

  const reject = async (tutorId: string) => {
    setActionLoadingId(tutorId);
    try {
      await adminApi.rejectTutor(tutorId);
      setTutors((prev) =>
        prev.map((t) => t.id === tutorId ? { ...t, status: "rejected" } : t)
      );
    } catch { setError("Failed to reject tutor."); }
    finally { setActionLoadingId(null); }
  };

  const suspend = async (tutorId: string) => {
    setActionLoadingId(tutorId);
    try {
      await adminApi.suspendTutor(tutorId);
      setTutors((prev) =>
        prev.map((t) => t.id === tutorId ? { ...t, status: "suspended" } : t)
      );
    } catch { setError("Failed to suspend tutor."); }
    finally { setActionLoadingId(null); }
  };

  return { tutors, isLoading, error, actionLoadingId, approve, reject, suspend, refetch: fetchTutors };
}

// ─── useAdminStats ────────────────────────────────────────────────────────────

export function useAdminStats() {
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    adminApi.getStats()
      .then(setStats)
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  return { stats, isLoading };
}

// ─── useAdminStudents ─────────────────────────────────────────────────────────

export function useAdminStudents() {
  const [students, setStudents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    adminApi.getStudents()
      .then((data) => setStudents(Array.isArray(data) ? data : data.students ?? []))
      .catch(() => setError("Failed to load students."))
      .finally(() => setIsLoading(false));
  }, []);

  return { students, isLoading, error };
}*/




/*import { useState, useEffect, useCallback } from "react";
import { adminApi } from "../api/admin.api";

// ─── useAdminTutors ───────────────────────────────────────────────────────────

export function useAdminTutors() {
  const [tutors, setTutors] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const fetchTutors = useCallback(async () => {
    setIsLoading(true);
    try {
      // Only pending-tutors endpoint exists per API docs
      const data = await adminApi.getPendingTutors();
      setTutors(Array.isArray(data) ? data : data.tutors ?? []);
    } catch {
      setError("Failed to load tutors.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchTutors(); }, [fetchTutors]);

  const approve = async (tutorId: string, remarks?: string) => {
    setActionLoadingId(tutorId);
    try {
      await adminApi.reviewTutor(tutorId, "approved", remarks);
      setTutors((prev) =>
        prev.map((t) => t.id === tutorId ? { ...t, status: "approved" } : t)
      );
    } catch { setError("Failed to approve tutor."); }
    finally { setActionLoadingId(null); }
  };

  const reject = async (tutorId: string, remarks?: string) => {
    setActionLoadingId(tutorId);
    try {
      await adminApi.reviewTutor(tutorId, "rejected", remarks);
      setTutors((prev) =>
        prev.map((t) => t.id === tutorId ? { ...t, status: "rejected" } : t)
      );
    } catch { setError("Failed to reject tutor."); }
    finally { setActionLoadingId(null); }
  };

  const suspend = async (tutorId: string, remarks?: string) => {
    setActionLoadingId(tutorId);
    try {
      await adminApi.reviewTutor(tutorId, "suspended", remarks);
      setTutors((prev) =>
        prev.map((t) => t.id === tutorId ? { ...t, status: "suspended" } : t)
      );
    } catch { setError("Failed to suspend tutor."); }
    finally { setActionLoadingId(null); }
  };

  const pending = tutors.filter((t) => t.status === "pending");
  const approved = tutors.filter((t) => t.status === "approved");

  return {
    tutors, pending, approved,
    isLoading, error, actionLoadingId,
    approve, reject, suspend,
    refetch: fetchTutors,
  };
}

// ─── useAdminStats ────────────────────────────────────────────────────────────

export function useAdminStats() {
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    adminApi.getStats()
      .then(setStats)
      .catch(() => {}) // stats endpoint may not exist yet, fail silently
      .finally(() => setIsLoading(false));
  }, []);

  return { stats, isLoading };
}

// ─── useAdminStudents ─────────────────────────────────────────────────────────

export function useAdminStudents() {
  const [students, setStudents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    adminApi.getStudents()
      .then((data) => setStudents(Array.isArray(data) ? data : data.students ?? []))
      .catch(() => setError("Failed to load students."))
      .finally(() => setIsLoading(false));
  }, []);

  return { students, isLoading, error };
}
*/      




////The below code is written for fixing the admin panel issue where tutors are not visible

import { useState, useEffect, useCallback } from "react";
import { adminApi } from "../api/admin.api";

// ─── useAdminTutors ───────────────────────────────────────────────────────────

export function useAdminTutors() {
  const [tutors, setTutors] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const fetchTutors = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await adminApi.getPendingTutors();
      setTutors(Array.isArray(data) ? data : data.tutors ?? []);
    } catch {
      setError("Failed to load tutors.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchTutors(); }, [fetchTutors]);

  const approve = async (tutorId: string, remarks?: string) => {
    setActionLoadingId(tutorId);
    try {
      await adminApi.reviewTutor(tutorId, "approved", remarks);
      // Remove from pending list after approval
      setTutors((prev) => prev.filter((t) => t.id !== tutorId));
    } catch { setError("Failed to approve tutor."); }
    finally { setActionLoadingId(null); }
  };

  const reject = async (tutorId: string, remarks?: string) => {
    setActionLoadingId(tutorId);
    try {
      await adminApi.reviewTutor(tutorId, "rejected", remarks);
      // Remove from pending list after rejection
      setTutors((prev) => prev.filter((t) => t.id !== tutorId));
    } catch { setError("Failed to reject tutor."); }
    finally { setActionLoadingId(null); }
  };

  return {
    tutors,
    isLoading,
    error,
    actionLoadingId,
    approve,
    reject,
    refetch: fetchTutors,
  };
}

