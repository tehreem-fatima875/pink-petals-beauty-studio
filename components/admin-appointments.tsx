"use client";

import { useEffect, useState } from "react";
import { formatInTimeZone } from "date-fns-tz";
import { salon } from "@/lib/config";

type AdminAppointment = {
  _id: string;
  reference: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  serviceName: string;
  staffId: string;
  startsAt: string;
  endsAt: string;
  status: "confirmed" | "cancelled" | "completed";
};

export default function AdminAppointments({ canManage }: { canManage: boolean }) {
  const [appointments, setAppointments] = useState<AdminAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [cursor, setCursor] = useState<string | null>(null);

  async function loadAppointments(append = false) {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter !== "all") params.set("status", filter);
      if (query) params.set("q", query);
      if (append && cursor) params.set("after", cursor);
      const response = await fetch(`/api/admin/appointments?${params.toString()}`);
      const payload = await response.json() as { appointments?: AdminAppointment[]; nextCursor?: string | null; error?: string };
      if (!response.ok) throw new Error(payload.error || "Could not load appointments.");
      setAppointments((current) => append ? [...current, ...(payload.appointments ?? [])] : payload.appointments ?? []);
      setCursor(payload.nextCursor ?? null);
      setMessage("");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not load appointments.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void loadAppointments(); }, [filter, query]);

  async function updateStatus(id: string, status: "cancelled" | "completed") {
    setMessage("");
    try {
      const response = await fetch("/api/admin/appointments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      const payload = await response.json() as { error?: string };
      if (!response.ok) throw new Error(payload.error || "Could not update appointment.");
      await loadAppointments();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not update appointment.");
    }
  }

  const visible = appointments.filter((item) => filter === "all" || item.status === filter);
  return (
    <>
      <div className="admin-controls">
        <label>Filter appointments<select value={filter} onChange={(event) => setFilter(event.target.value)}><option value="all">All statuses</option><option value="confirmed">Confirmed</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option></select></label>
        <form className="admin-search" onSubmit={(event) => { event.preventDefault(); setQuery(search.trim()); }}>
          <label htmlFor="admin-search">Search appointments</label>
          <input id="admin-search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Guest, service or reference" />
          <button className="button button-outline" type="submit">Search</button>
        </form>
        <button className="button button-outline" type="button" onClick={() => void loadAppointments()}>Refresh</button>
      </div>
      {cursor && <div className="admin-load-more"><button className="button button-outline" type="button" disabled={loading} onClick={() => void loadAppointments(true)}>{loading ? "Loading…" : "Load more appointments"}</button></div>}
      {message && <p className="form-status" role="alert">{message}</p>}
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead><tr><th>When</th><th>Guest</th><th>Service</th><th>Reference</th><th>Status</th>{canManage && <th>Actions</th>}</tr></thead>
          <tbody>
            {loading
              ? <tr><td colSpan={canManage ? 6 : 5}>Loading appointments…</td></tr>
              : visible.length === 0
                ? <tr><td colSpan={canManage ? 6 : 5}>No appointments to show.</td></tr>
                : visible.map((item) => (
                  <tr key={item._id}>
                    <td>{formatInTimeZone(new Date(item.startsAt), salon.timezone, "EEE, MMM d · h:mm a")}</td>
                    <td>{item.customerName}<small className="admin-customer">{item.customerEmail}<br />{item.customerPhone}</small></td>
                    <td>{item.serviceName}</td><td>{item.reference}</td><td><span className={`status-pill status-${item.status}`}>{item.status}</span></td>
                    {canManage && <td>{item.status === "confirmed" && <div className="admin-actions"><button type="button" onClick={() => void updateStatus(item._id, "completed")}>Complete</button><button type="button" onClick={() => void updateStatus(item._id, "cancelled")}>Cancel</button></div>}</td>}
                  </tr>
                ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
