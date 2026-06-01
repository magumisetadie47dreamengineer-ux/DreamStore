"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { apiFetch } from "@/lib/apiClient";
import { useAuthStore } from "@/store/authStore";

export function useRealtimeInventory(branchId) {
  const [rows, setRows] = useState([]);
  const [updatedAt, setUpdatedAt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [live, setLive] = useState(false);
  const userId = useAuthStore((s) => s.user?.id);
  const eventSourceRef = useRef(null);

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
    }
  }, [branchId, applyPayload]);

  useEffect(() => {
    if (!userId) return;

    setLoading(true);
    setLive(false);

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    const qs = new URLSearchParams({ userId });
    if (branchId) qs.set("branchId", branchId);
    const source = new EventSource(`/api/inventory/stream?${qs.toString()}`);

    source.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (!data.error) {
          applyPayload(data);
        }
      } catch {
        /* ignore malformed events */
      }
    };

    source.onerror = () => {
      setLive(false);
      source.close();
      eventSourceRef.current = null;
    };

    eventSourceRef.current = source;

    return () => {
      source.close();
      eventSourceRef.current = null;
    };
  }, [branchId, userId, applyPayload]);

  useEffect(() => {
    if (!live && userId) {
      fetchInventory();
      const fallback = setInterval(fetchInventory, 5000);
      return () => clearInterval(fallback);
    }
  }, [live, userId, fetchInventory]);

  return { rows, updatedAt, loading, live, refresh: fetchInventory };
}
