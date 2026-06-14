"use client";

import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "@/lib/apiClient";
import { useAuthStore } from "@/store/authStore";

/** Polling interval — avoids long-lived SSE that exhausts Vercel + MongoDB on Hobby. */
const POLL_MS = 8000;

/**
 * @param {string | undefined} branchId
 * @param {{ enabled?: boolean }} [options] — set enabled false when tab is hidden
 */
export function useRealtimeInventory(branchId, options = {}) {
  const { enabled = true } = options;
  const [rows, setRows] = useState([]);
  const [updatedAt, setUpdatedAt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [live, setLive] = useState(false);
  const [error, setError] = useState("");
  const hasHydrated = useAuthStore((s) => s._hasHydrated);
  const user = useAuthStore((s) => s.user);
  const userId = user?.id ?? user?._id;

  const applyPayload = useCallback((data) => {
    if (Array.isArray(data?.rows)) {
      setRows(data.rows);
      setUpdatedAt(data.updatedAt ?? Date.now());
      setLive(true);
      setError("");
    }
    setLoading(false);
  }, []);

  const fetchInventory = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      setLive(false);
      setError("Sign in again to view live stock.");
      return;
    }

    try {
      const qs = new URLSearchParams();
      if (branchId) qs.set("branchId", branchId);
      const res = await apiFetch(`/api/inventory?${qs.toString()}`);
      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        applyPayload(data);
        return;
      }

      setLoading(false);
      setLive(false);
      setError(data.message || `Could not load inventory (${res.status})`);
    } catch {
      setLoading(false);
      setLive(false);
      setError("Network error loading inventory.");
    }
  }, [branchId, applyPayload, userId]);

  useEffect(() => {
    if (!hasHydrated) return;

    if (!enabled) {
      setLive(false);
      return;
    }

    if (!userId) {
      setLoading(false);
      setLive(false);
      setError("Sign in again to view live stock.");
      return;
    }

    setLoading(true);
    setLive(false);
    setError("");

    const runIfVisible = () => {
      if (typeof document !== "undefined" && document.hidden) return;
      fetchInventory();
    };

    runIfVisible();

    const interval = setInterval(runIfVisible, POLL_MS);

    const onVisibility = () => {
      if (!document.hidden) fetchInventory();
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [branchId, userId, enabled, hasHydrated, fetchInventory]);

  return { rows, updatedAt, loading, live, error, refresh: fetchInventory };
}
