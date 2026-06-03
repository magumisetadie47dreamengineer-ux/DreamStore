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
  const userId = useAuthStore((s) => s.user?.id);

  const applyPayload = useCallback((data) => {
    if (data?.rows) {
      setRows(data.rows);
      setUpdatedAt(data.updatedAt);
      setLive(true);
    }
    setLoading(false);
  }, []);

  const fetchInventory = useCallback(async () => {
    const qs = new URLSearchParams();
    if (branchId) qs.set("branchId", branchId);
    const res = await apiFetch(`/api/inventory?${qs.toString()}`);
    if (res.ok) {
      applyPayload(await res.json());
    } else {
      setLoading(false);
      setLive(false);
    }
  }, [branchId, applyPayload]);

  useEffect(() => {
    if (!userId || !enabled) {
      setLive(false);
      return;
    }

    setLoading(true);
    setLive(false);

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
  }, [branchId, userId, enabled, fetchInventory]);

  return { rows, updatedAt, loading, live, refresh: fetchInventory };
}
