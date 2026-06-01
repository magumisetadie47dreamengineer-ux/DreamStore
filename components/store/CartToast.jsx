"use client";

import { useUiStore } from "@/store/uiStore";

export default function CartToast() {
  const toast = useUiStore((s) => s.toast);

  if (!toast) return null;

  return (
    <div
      className="toast toast-top toast-end z-[100] mt-16"
      role="status"
      aria-live="polite"
    >
      <div className="alert bg-base-200 border border-base-content/20 text-sm shadow-lg rounded-sm">
        <span className="text-primary font-mono text-xs">✓</span>
        <span>{toast}</span>
      </div>
    </div>
  );
}
