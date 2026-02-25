"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import {
    CalendarDays, Clock, DollarSign, CheckCircle2,
    XCircle, Timer, AlertCircle, Filter
} from "lucide-react";
import { toast } from "sonner";

interface Appointment {
    id: number;
    service_details: { name: string; duration: number; price: string };
    client_details: { first_name: string; last_name: string; email: string };
    date: string;
    time_slot: string;
    status: string;
    notes?: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
    PENDING: { label: "Pending", color: "text-amber-700", bg: "bg-amber-50 border-amber-200", icon: Timer },
    CONFIRMED: { label: "Confirmed", color: "text-teal-700", bg: "bg-teal-50 border-teal-200", icon: CheckCircle2 },
    COMPLETED: { label: "Completed", color: "text-slate-600", bg: "bg-slate-100 border-slate-200", icon: CheckCircle2 },
    CANCELLED: { label: "Cancelled", color: "text-red-600", bg: "bg-red-50 border-red-200", icon: XCircle },
    REJECTED: { label: "Rejected", color: "text-red-600", bg: "bg-red-50 border-red-200", icon: XCircle },
};

export default function ProviderAppointmentsPage() {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState("ALL");
    const [updating, setUpdating] = useState<number | null>(null);

    const fetchAppointments = () => {
        api.get("/appointments/")
            .then(res => setAppointments(res.data))
            .catch(console.error)
            .finally(() => setIsLoading(false));
    };

    useEffect(() => { fetchAppointments(); }, []);

    const updateStatus = async (id: number, status: string) => {
        setUpdating(id);
        try {
            await api.patch(`/appointments/${id}/`, { status });
            toast.success(`Appointment ${status.toLowerCase()}`);
            fetchAppointments();
        } catch {
            toast.error("Failed to update status");
        } finally {
            setUpdating(null);
        }
    };

    const filters = ["ALL", "PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"];
    const filtered = filter === "ALL" ? appointments : appointments.filter(a => a.status === filter);

    const formatDate = (d: string) => new Date(d).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
    const formatTime = (t: string) => {
        const [h, m] = t.split(":");
        const dt = new Date(); dt.setHours(+h, +m);
        return dt.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
    };

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Appointments</h1>
                <p className="text-slate-500 text-sm mt-0.5">Manage all your patient appointments</p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200">
                {/* Filter Bar */}
                <div className="flex flex-wrap items-center gap-2 p-4 border-b border-slate-100">
                    <Filter size={14} className="text-slate-400" />
                    {filters.map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filter === f ? "bg-teal-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                }`}
                        >
                            {f === "ALL" ? `All (${appointments.length})` : `${STATUS_CONFIG[f]?.label} (${appointments.filter(a => a.status === f).length})`}
                        </button>
                    ))}
                </div>

                {/* List */}
                <div className="divide-y divide-slate-100">
                    {isLoading ? (
                        [...Array(5)].map((_, i) => (
                            <div key={i} className="flex items-center gap-4 p-4 animate-pulse">
                                <div className="w-10 h-10 rounded-full bg-slate-200 flex-shrink-0" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-3 w-36 bg-slate-200 rounded" />
                                    <div className="h-2.5 w-24 bg-slate-100 rounded" />
                                </div>
                                <div className="flex gap-2">
                                    <div className="h-8 w-20 bg-slate-100 rounded-lg" />
                                    <div className="h-8 w-20 bg-slate-100 rounded-lg" />
                                </div>
                            </div>
                        ))
                    ) : filtered.length === 0 ? (
                        <div className="py-16 text-center">
                            <AlertCircle size={28} className="mx-auto mb-3 text-slate-300" />
                            <p className="text-slate-500 text-sm font-medium">No appointments found</p>
                        </div>
                    ) : (
                        filtered.map(appt => {
                            const cfg = STATUS_CONFIG[appt.status] || STATUS_CONFIG.PENDING;
                            const Icon = cfg.icon;
                            return (
                                <div key={appt.id} className="flex flex-col lg:flex-row lg:items-center gap-4 p-4 hover:bg-slate-50 transition-colors">
                                    {/* Patient Info */}
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                                            {appt.client_details?.first_name?.[0] || "?"}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-semibold text-slate-900">
                                                {appt.client_details?.first_name} {appt.client_details?.last_name}
                                            </p>
                                            <p className="text-xs text-slate-500 truncate">{appt.service_details.name} · {appt.service_details.duration}min · ${appt.service_details.price}</p>
                                        </div>
                                    </div>

                                    {/* Date/Time */}
                                    <div className="flex items-center gap-4 text-xs text-slate-500 pl-13 lg:pl-0">
                                        <span className="flex items-center gap-1.5"><CalendarDays size={12} className="text-slate-400" />{formatDate(appt.date)}</span>
                                        <span className="flex items-center gap-1.5"><Clock size={12} className="text-slate-400" />{formatTime(appt.time_slot)}</span>
                                    </div>

                                    {/* Status + Actions */}
                                    <div className="flex items-center gap-2 pl-13 lg:pl-0">
                                        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium ${cfg.color} ${cfg.bg}`}>
                                            <Icon size={11} /> {cfg.label}
                                        </div>
                                        {appt.status === "PENDING" && (
                                            <>
                                                <button
                                                    onClick={() => updateStatus(appt.id, "CONFIRMED")}
                                                    disabled={updating === appt.id}
                                                    className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-medium transition-colors disabled:opacity-50"
                                                >
                                                    Confirm
                                                </button>
                                                <button
                                                    onClick={() => updateStatus(appt.id, "REJECTED")}
                                                    disabled={updating === appt.id}
                                                    className="px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-medium transition-colors disabled:opacity-50"
                                                >
                                                    Reject
                                                </button>
                                            </>
                                        )}
                                        {appt.status === "CONFIRMED" && (
                                            <button
                                                onClick={() => updateStatus(appt.id, "COMPLETED")}
                                                disabled={updating === appt.id}
                                                className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors disabled:opacity-50"
                                            >
                                                Mark Done
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}
