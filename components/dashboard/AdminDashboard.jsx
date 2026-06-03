"use client";

import { useCallback, useEffect, useState } from "react";
import { formatPrice } from "@/lib/formatPrice";
import { apiFetch } from "@/lib/apiClient";
import DashboardShell from "./DashboardShell";

const STATUS_OPTIONS = [
  "paid",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

export default function AdminDashboard() {
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [branches, setBranches] = useState([]);
  const [tab, setTab] = useState("orders");
  const [message, setMessage] = useState("");
  const [branchForm, setBranchForm] = useState({
    name: "",
    code: "",
    address: "",
    phone: "",
  });

  const load = useCallback(async () => {
    const [o, u, b] = await Promise.all([
      apiFetch("/api/orders"),
      apiFetch("/api/users"),
      apiFetch("/api/branches"),
    ]);
    if (o.ok) setOrders(await o.json());
    if (u.ok) setUsers(await u.json());
    if (b.ok) setBranches(await b.json());
  }, []);

  useEffect(() => {
    load();
    apiFetch("/api/admin/init", { method: "POST" }).catch(() => {});
  }, [load]);

  useEffect(() => {
    if (tab !== "orders") return;
    const interval = setInterval(() => {
      if (!document.hidden) load();
    }, 8000);
    const onFocus = () => load();
    window.addEventListener("focus", onFocus);
    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", onFocus);
    };
  }, [tab, load]);

  const updateOrderStatus = async (orderId, status) => {
    const res = await apiFetch(`/api/orders/${orderId}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      setMessage(`Order marked ${status}`);
      load();
    }
  };

  const issueInvoice = async (orderId) => {
    const res = await apiFetch("/api/invoices", {
      method: "POST",
      body: JSON.stringify({ orderId }),
    });
    const data = await res.json();
    if (res.ok) {
      setMessage(`Invoice ${data.invoiceNumber} issued`);
      load();
    } else {
      setMessage(data.message || "Failed to issue invoice");
    }
  };

  const setUserRole = async (userId, role) => {
    const res = await apiFetch(`/api/users/${userId}/role`, {
      method: "PATCH",
      body: JSON.stringify({ role }),
    });
    if (res.ok) {
      setMessage(`User role updated to ${role}`);
      load();
    }
  };

  const createBranch = async (e) => {
    e.preventDefault();
    const res = await apiFetch("/api/branches", {
      method: "POST",
      body: JSON.stringify(branchForm),
    });
    if (res.ok) {
      setMessage("Branch created");
      setBranchForm({ name: "", code: "", address: "", phone: "" });
      load();
    }
  };

  return (
    <DashboardShell
      title="Admin dashboard"
      subtitle="Process orders, issue invoices, manage branches and staff roles"
      allowedRoles={["admin"]}
    >
      {message && (
        <div className="alert bg-base-200 border border-base-content/10 mb-6 text-sm">
          {message}
        </div>
      )}

      <div className="tabs tabs-boxed bg-base-200 mb-6 w-fit rounded-sm">
        {["orders", "users", "branches"].map((t) => (
          <button
            key={t}
            type="button"
            className={`tab capitalize ${tab === t ? "tab-active" : ""}`}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "orders" && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3 mb-2">
            <button
              type="button"
              className="btn btn-ghost btn-xs"
              onClick={load}
            >
              Refresh orders
            </button>
            <span className="text-xs font-mono text-base-content/40">
              Auto-refreshes every 8s
            </span>
          </div>
          {orders.length === 0 && (
            <p className="text-base-content/50">No orders yet.</p>
          )}
          {orders.map((order) => (
            <div
              key={order._id}
              className="rounded-sm border border-base-content/10 bg-base-200 p-4"
            >
              <div className="flex flex-wrap justify-between gap-2">
                <div>
                  <p className="font-mono text-xs text-base-content/50">
                    {new Date(order.createdAt).toLocaleString()}
                  </p>
                  <p className="font-semibold">
                    {order.userId?.name || "Customer"} · {order.userId?.email}
                  </p>
                  <p className="text-primary font-mono font-bold mt-1">
                    {formatPrice(order.total)}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="badge badge-outline capitalize">{order.status}</span>
                  {order.paymentMethod && (
                    <span className="text-[10px] font-mono uppercase text-base-content/40">
                      {order.paymentMethod.replace(/_/g, " ")}
                    </span>
                  )}
                </div>
              </div>
              <ul className="mt-2 text-sm text-base-content/60">
                {order.items?.map((item, i) => (
                  <li key={i}>
                    {item.name} × {item.quantity}
                  </li>
                ))}
              </ul>
              {order.invoiceId?.invoiceNumber && (
                <p className="mt-2 text-xs font-mono text-primary">
                  Invoice: {order.invoiceId.invoiceNumber}
                </p>
              )}
              <div className="mt-4 flex flex-wrap gap-2">
                <select
                  className="select select-bordered select-sm rounded-sm"
                  value={order.status}
                  onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                {!order.invoiceId && ["paid", "processing"].includes(order.status) && (
                  <button
                    type="button"
                    className="btn btn-primary btn-sm rounded-sm"
                    onClick={() => issueInvoice(order._id)}
                  >
                    Issue invoice
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "users" && (
        <div className="overflow-x-auto">
          <table className="table table-sm">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Assign</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.name}</td>
                  <td className="font-mono text-xs">{u.email}</td>
                  <td>
                    <span className="badge badge-sm uppercase">{u.role}</span>
                  </td>
                  <td>
                    {u.role !== "admin" && (
                      <div className="flex gap-1">
                        <button
                          type="button"
                          className="btn btn-xs rounded-sm"
                          onClick={() => setUserRole(u.id, "accounts")}
                        >
                          Accounts
                        </button>
                        <button
                          type="button"
                          className="btn btn-ghost btn-xs"
                          onClick={() => setUserRole(u.id, "buyer")}
                        >
                          Buyer
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "branches" && (
        <div className="grid gap-8 lg:grid-cols-2">
          <form
            onSubmit={createBranch}
            className="rounded-sm border border-base-content/10 bg-base-200 p-4 space-y-3"
          >
            <h3 className="font-semibold">Add branch</h3>
            <input
              className="input input-bordered w-full rounded-sm"
              placeholder="Branch name"
              value={branchForm.name}
              onChange={(e) =>
                setBranchForm({ ...branchForm, name: e.target.value })
              }
              required
            />
            <input
              className="input input-bordered w-full rounded-sm font-mono uppercase"
              placeholder="Code (e.g. HRE)"
              value={branchForm.code}
              onChange={(e) =>
                setBranchForm({ ...branchForm, code: e.target.value })
              }
              required
            />
            <input
              className="input input-bordered w-full rounded-sm"
              placeholder="Address"
              value={branchForm.address}
              onChange={(e) =>
                setBranchForm({ ...branchForm, address: e.target.value })
              }
            />
            <button type="submit" className="btn btn-primary btn-sm rounded-sm">
              Create branch
            </button>
          </form>
          <ul className="space-y-2">
            {branches.map((b) => (
              <li
                key={b._id}
                className="rounded-sm border border-base-content/10 p-3 flex justify-between"
              >
                <div>
                  <p className="font-semibold">{b.name}</p>
                  <p className="text-xs font-mono text-base-content/50">{b.code}</p>
                </div>
                {b.isPrimary && (
                  <span className="badge badge-sm">Primary</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </DashboardShell>
  );
}
