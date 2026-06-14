"use client";

import { useEffect, useMemo, useState } from "react";
import { formatPrice } from "@/lib/formatPrice";
import { apiFetch } from "@/lib/apiClient";
import { useRealtimeInventory } from "@/hooks/useRealtimeInventory";
import DashboardShell from "./DashboardShell";

const TABS = [
  { id: "finance", label: "Finance (P&L)" },
  { id: "inventory", label: "Live stock" },
  { id: "history", label: "Stock history" },
];

function LiveBadge({ live, updatedAt }) {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setTick((n) => n + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const ago =
    updatedAt != null
      ? Math.max(0, Math.floor((Date.now() - updatedAt) / 1000))
      : null;

  return (
    <span className="inline-flex items-center gap-2 text-xs font-mono">
      <span
        className={`inline-block h-2 w-2 rounded-full ${
          live ? "bg-success animate-pulse" : "bg-base-content/30"
        }`}
        aria-hidden
      />
      {live ? "Live" : "Reconnecting…"}
      {ago != null && live && (
        <span className="text-base-content/40">· updated {ago}s ago</span>
      )}
    </span>
  );
}

export default function AccountsDashboard() {
  const [tab, setTab] = useState("finance");
  const [branches, setBranches] = useState([]);
  const [branchId, setBranchId] = useState("");
  const [pnl, setPnl] = useState(null);
  const [adjustQty, setAdjustQty] = useState({});

  const [historyFrom, setHistoryFrom] = useState("");
  const [historyTo, setHistoryTo] = useState("");
  const [movements, setMovements] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const [preStock, setPreStock] = useState({
    productId: "",
    incomingQty: "",
    scheduledDate: "",
    note: "",
  });
  const [preStockMsg, setPreStockMsg] = useState("");

  const { rows, updatedAt, loading, live, error, refresh } = useRealtimeInventory(
    branchId || undefined,
    { enabled: tab === "inventory" }
  );

  const productOptions = useMemo(
    () =>
      rows.map((row) => {
        const p = row.productId;
        const pid = typeof p === "object" ? p._id : p;
        return {
          id: pid,
          name: typeof p === "object" ? p.name : "Product",
        };
      }),
    [rows]
  );

  useEffect(() => {
    apiFetch("/api/branches")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setBranches(data);
          const primary = data.find((b) => b.isPrimary) || data[0];
          if (primary) setBranchId(primary._id);
        }
      });
    apiFetch("/api/admin/init", { method: "POST" }).catch(() => {});
  }, []);

  useEffect(() => {
    apiFetch("/api/reports/pnl?days=30")
      .then((r) => r.json())
      .then(setPnl)
      .catch(() => {});
  }, [updatedAt, tab]);

  const loadHistory = async () => {
    if (!branchId) return;
    setHistoryLoading(true);
    const qs = new URLSearchParams({ branchId });
    if (historyFrom) qs.set("from", historyFrom);
    if (historyTo) qs.set("to", historyTo);
    const res = await apiFetch(`/api/inventory/movements?${qs.toString()}`);
    if (res.ok) {
      const data = await res.json();
      setMovements(data.movements || []);
    }
    setHistoryLoading(false);
  };

  useEffect(() => {
    if (tab === "history" && branchId) {
      loadHistory();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, branchId, historyFrom, historyTo]);

  const saveQuantity = async (productId, quantity) => {
    const res = await apiFetch("/api/inventory", {
      method: "PATCH",
      body: JSON.stringify({
        branchId,
        productId,
        quantity: Number(quantity),
      }),
    });
    if (res.ok) refresh();
  };

  const submitPreStock = async (e) => {
    e.preventDefault();
    setPreStockMsg("");
    const res = await apiFetch("/api/inventory/movements", {
      method: "POST",
      body: JSON.stringify({
        branchId,
        productId: preStock.productId,
        incomingQty: Number(preStock.incomingQty),
        scheduledDate: preStock.scheduledDate,
        note: preStock.note || undefined,
      }),
    });
    const data = await res.json();
    if (res.ok) {
      setPreStockMsg("Pre-stock logged.");
      setPreStock({
        productId: "",
        incomingQty: "",
        scheduledDate: "",
        note: "",
      });
      if (tab === "history") loadHistory();
    } else {
      setPreStockMsg(data.message || "Failed to log pre-stock");
    }
  };

  const reasonLabel = (reason) => {
    const map = {
      adjustment: "Adjustment",
      sale: "Sale",
      restock: "Restock",
      pre_stock: "Pre-stock",
    };
    return map[reason] || reason;
  };

  return (
    <DashboardShell
      title="Finance & inventory"
      subtitle="P&L, live branch stock, and stock history with pre-stock dates"
      allowedRoles={["admin", "accounts"]}
    >
      <div className="tabs tabs-boxed rounded-sm mb-8 w-fit max-w-full flex-wrap">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`tab ${tab === t.id ? "tab-active" : ""}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-4 mb-6">
        <label className="flex items-center gap-2 text-sm">
          Branch
          <select
            className="select select-bordered select-sm rounded-sm"
            value={branchId}
            onChange={(e) => setBranchId(e.target.value)}
          >
            {branches.map((b) => (
              <option key={b._id} value={b._id}>
                {b.name} ({b.code})
              </option>
            ))}
          </select>
        </label>
        {tab === "inventory" && (
          <>
            <LiveBadge live={live} updatedAt={updatedAt} />
            <button
              type="button"
              className="btn btn-ghost btn-xs"
              onClick={refresh}
            >
              Refresh now
            </button>
          </>
        )}
      </div>

      {tab === "finance" && (
        <>
          {pnl ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-sm border border-base-content/10 bg-base-200 p-4">
                <p className="text-xs font-mono uppercase text-base-content/50">
                  Revenue (30d)
                </p>
                <p className="text-xl font-bold font-mono text-primary">
                  {formatPrice(pnl.revenue)}
                </p>
              </div>
              <div className="rounded-sm border border-base-content/10 bg-base-200 p-4">
                <p className="text-xs font-mono uppercase text-base-content/50">
                  Gross profit
                </p>
                <p className="text-xl font-bold font-mono">
                  {formatPrice(pnl.grossProfit)}
                </p>
                <p className="text-xs text-base-content/40">
                  {pnl.marginPct?.toFixed(1)}% margin
                </p>
              </div>
              <div className="rounded-sm border border-base-content/10 bg-base-200 p-4">
                <p className="text-xs font-mono uppercase text-base-content/50">
                  Inventory value
                </p>
                <p className="text-xl font-bold font-mono">
                  {formatPrice(pnl.inventoryValue)}
                </p>
              </div>
              <div className="rounded-sm border border-base-content/10 bg-base-200 p-4">
                <p className="text-xs font-mono uppercase text-base-content/50">
                  Low stock SKUs
                </p>
                <p className="text-xl font-bold font-mono">
                  {pnl.lowStockCount}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-base-content/50">Loading P&L…</p>
          )}
          <p className="mt-6 text-sm text-base-content/50">
            Use the <strong>Live stock</strong> tab to adjust quantities. Use{" "}
            <strong>Stock history</strong> to see previous stock levels by date
            and log incoming pre-stock.
          </p>
        </>
      )}

      {tab === "inventory" && (
        <>
          {loading ? (
            <p className="text-base-content/50">Loading inventory…</p>
          ) : error ? (
            <div className="rounded-sm border border-error/30 bg-error/10 p-4 text-sm">
              <p className="font-medium text-error">{error}</p>
              <button
                type="button"
                className="btn btn-outline btn-sm mt-3 rounded-sm"
                onClick={refresh}
              >
                Try again
              </button>
            </div>
          ) : rows.length === 0 ? (
            <p className="text-base-content/50">
              No branch stock yet for this branch. Stock is seeded from products
              on first load — try{" "}
              <button
                type="button"
                className="link link-primary"
                onClick={refresh}
              >
                refreshing
              </button>
              .
            </p>
          ) : (
            <div className="overflow-x-auto rounded-sm border border-base-content/10">
              <table className="table table-sm">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Qty</th>
                    <th>Store total</th>
                    <th>Update</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => {
                    const p = row.productId;
                    const pid = typeof p === "object" ? p._id : p;
                    const low = row.quantity <= (row.lowStockThreshold ?? 5);
                    return (
                      <tr key={row._id} className={low ? "bg-base-300/50" : ""}>
                        <td className="font-medium">
                          {typeof p === "object" ? p.name : "—"}
                        </td>
                        <td className="text-xs font-mono">
                          {typeof p === "object" ? p.category : ""}
                        </td>
                        <td>
                          <span
                            className={
                              low ? "text-warning font-bold" : "font-mono"
                            }
                          >
                            {row.quantity}
                          </span>
                        </td>
                        <td className="font-mono text-xs">
                          {typeof p === "object" ? p.stock : "—"}
                        </td>
                        <td>
                          <div className="flex gap-1">
                            <input
                              type="number"
                              min={0}
                              className="input input-bordered input-xs w-20 rounded-sm"
                              value={adjustQty[pid] ?? row.quantity}
                              onChange={(e) =>
                                setAdjustQty({
                                  ...adjustQty,
                                  [pid]: e.target.value,
                                })
                              }
                            />
                            <button
                              type="button"
                              className="btn btn-primary btn-xs rounded-sm"
                              onClick={() =>
                                saveQuantity(pid, adjustQty[pid] ?? row.quantity)
                              }
                            >
                              Save
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {tab === "history" && (
        <>
          <form
            onSubmit={submitPreStock}
            className="mb-8 rounded-sm border border-base-content/10 bg-base-200 p-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5 items-end"
          >
            <p className="sm:col-span-2 lg:col-span-5 text-sm font-medium">
              Log pre-stock (expected incoming)
            </p>
            <label className="form-control">
              <span className="label-text text-xs">Product</span>
              <select
                className="select select-bordered select-sm rounded-sm"
                required
                value={preStock.productId}
                onChange={(e) =>
                  setPreStock({ ...preStock, productId: e.target.value })
                }
              >
                <option value="">Select…</option>
                {productOptions.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="form-control">
              <span className="label-text text-xs">Incoming qty</span>
              <input
                type="number"
                min={1}
                required
                className="input input-bordered input-sm rounded-sm"
                value={preStock.incomingQty}
                onChange={(e) =>
                  setPreStock({ ...preStock, incomingQty: e.target.value })
                }
              />
            </label>
            <label className="form-control">
              <span className="label-text text-xs">Expected date</span>
              <input
                type="date"
                required
                className="input input-bordered input-sm rounded-sm"
                value={preStock.scheduledDate}
                onChange={(e) =>
                  setPreStock({ ...preStock, scheduledDate: e.target.value })
                }
              />
            </label>
            <label className="form-control">
              <span className="label-text text-xs">Note</span>
              <input
                type="text"
                className="input input-bordered input-sm rounded-sm"
                value={preStock.note}
                onChange={(e) =>
                  setPreStock({ ...preStock, note: e.target.value })
                }
              />
            </label>
            <button type="submit" className="btn btn-primary btn-sm rounded-sm">
              Log pre-stock
            </button>
            {preStockMsg && (
              <p className="lg:col-span-5 text-xs text-base-content/60">
                {preStockMsg}
              </p>
            )}
          </form>

          <div className="flex flex-wrap gap-3 mb-4 items-end">
            <label className="form-control">
              <span className="label-text text-xs">From</span>
              <input
                type="date"
                className="input input-bordered input-sm rounded-sm"
                value={historyFrom}
                onChange={(e) => setHistoryFrom(e.target.value)}
              />
            </label>
            <label className="form-control">
              <span className="label-text text-xs">To</span>
              <input
                type="date"
                className="input input-bordered input-sm rounded-sm"
                value={historyTo}
                onChange={(e) => setHistoryTo(e.target.value)}
              />
            </label>
            <button
              type="button"
              className="btn btn-outline btn-sm rounded-sm"
              onClick={loadHistory}
            >
              Apply dates
            </button>
          </div>

          {historyLoading ? (
            <p className="text-base-content/50">Loading history…</p>
          ) : movements.length === 0 ? (
            <p className="text-base-content/50">
              No movements for this branch and date range yet. Adjust stock or
              log pre-stock to build history.
            </p>
          ) : (
            <div className="overflow-x-auto rounded-sm border border-base-content/10">
              <table className="table table-sm">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Product</th>
                    <th>Type</th>
                    <th>Pre-stock</th>
                    <th>Change</th>
                    <th>After</th>
                    <th>Expected</th>
                    <th>By</th>
                  </tr>
                </thead>
                <tbody>
                  {movements.map((m) => {
                    const p = m.productId;
                    const u = m.userId;
                    return (
                      <tr key={m._id}>
                        <td className="text-xs font-mono whitespace-nowrap">
                          {new Date(m.createdAt).toLocaleString()}
                        </td>
                        <td>{typeof p === "object" ? p.name : "—"}</td>
                        <td className="text-xs">{reasonLabel(m.reason)}</td>
                        <td className="font-mono">{m.quantityBefore}</td>
                        <td
                          className={`font-mono ${
                            m.change > 0 ? "text-success" : m.change < 0 ? "text-error" : ""
                          }`}
                        >
                          {m.change > 0 ? `+${m.change}` : m.change}
                        </td>
                        <td className="font-mono">{m.quantityAfter}</td>
                        <td className="text-xs font-mono">
                          {m.scheduledDate
                            ? new Date(m.scheduledDate).toLocaleDateString()
                            : "—"}
                        </td>
                        <td className="text-xs">
                          {typeof u === "object" ? u.name : "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </DashboardShell>
  );
}
