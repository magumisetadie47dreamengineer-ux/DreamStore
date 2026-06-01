"use client";

import { useAuthStore } from "@/store/authStore";

export function authHeaders() {
  const user = useAuthStore.getState().user;
  if (!user?.id) return {};
  return {
    "Content-Type": "application/json",
    "x-user-id": user.id,
  };
}

export async function apiFetch(url, options = {}) {
  const headers = {
    ...authHeaders(),
    ...(options.headers || {}),
  };
  return fetch(url, { ...options, headers });
}
