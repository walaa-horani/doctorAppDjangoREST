"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import Link from "next/link";
import {
    CalendarDays, Clock, DollarSign, Search,
    CheckCircle2, XCircle, Timer, AlertCircle, ChevronRight
} from "lucide-react";

interface Appointment {
    id: number;
    service_details: { name: string; duration: number; price: string };
    provider_details: { first_name: string; last_name: string; email: string };
    date: string;
    time_slot: string;
    status: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
    PENDING: { label: "Pending", color: "text-amber-700", bg: "bg-amber-50 border-amber-200", icon: Timer },
    CONFIRMED: { label: "Confirmed", color: "text-teal-700", bg: "bg-teal-50 border-teal-200", icon: CheckCircle2 },
    COMPLETED: { label: "Completed", color: "text-slate-600", bg: "bg-slate-100 border-slate-200", icon: CheckCircle2 },
    CANCELLED: { label: "Cancelled", color: "text-red-600", bg: "bg-red-50 border-red-200", icon: XCircle },
    REJECTED: { label: "Rejected", color: "text-red-600", bg: "bg-red-50 border-red-200", icon: XCircle },
};

export default function ClientAppointmentsPage() {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState("ALL");

    useEffect(() => {
        api.get("/appointments/")
            .then(res => setAppointments(res.data))
            .catch(console.error)
            .finally(() => setIsLoading(false));
    }, []);

    const filters = ["ALL", "PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"];
    const filtered = filter === "ALL" ? appointments : appointments.filter(a => a.status === filter);

    const formatDate = (d: string) => new Date(d).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
    const formatTime = (t: string) => {
        const [h, m] = t.split(":");
        const dt = new Date(); dt.setHours(+h, +m);
        return dt.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">My Appointments</h1>
                    <p className="text-slate-500 text-sm mt-0.5">{appointments.length} total appointment{appointments.length !== 1 ? "s" : ""}</p>
                </div>
                <Link href="/browse" className="inline-flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium rounded-xl transition-colors">
                    <Search size={15} /> Book New
                </Link>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200">
                {/* Tabs */}
                <div className="flex flex-wrap gap-1.5 p-4 border-b border-slate-100">
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

                <div className="divide-y divide-slate-100">
                    {isLoading ? (
                        [...Array(4)].map((_, i) => (
                            <div key={i} className="flex items-center gap-4 p-4 animate-pulse">
                                <div className="w-10 h-10 rounded-full bg-slate-200 flex-shrink-0" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-3 w-36 bg-slate-200 rounded" />
                                    <div className="h-2.5 w-28 bg-slate-100 rounded" />
                                </div>
                                <div className="h-6 w-24 bg-slate-100 rounded-full" />
                            </div>
                        ))
                    ) : filtered.length === 0 ? (
                        <div className="py-20 text-center">
                            <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <AlertCircle size={24} className="text-slate-400" />
                            </div>
                            <p className="text-slate-600 font-semibold">No appointments here</p>
                            <p className="text-slate-400 text-sm mt-1">Find a doctor and book your first visit!</p>
                            <Link href="/browse" className="inline-flex items-center gap-1.5 mt-5 text-sm text-teal-600 font-medium hover:text-teal-700">
                                Browse doctors <ChevronRight size={14} />
                            </Link>
                        </div>
                    ) : (
                        filtered.map(appt => {
                            const cfg = STATUS_CONFIG[appt.status] || STATUS_CONFIG.PENDING;
                            const Icon = cfg.icon;
                            return (
                                <div key={appt.id} className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 hover:bg-slate-50 transition-colors">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                                        {appt.provider_details.first_name[0]}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-slate-900">{appt.service_details.name}</p>
                                        <p className="text-xs text-slate-500">Dr. {appt.provider_details.first_name} {appt.provider_details.last_name}</p>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pl-14 sm:pl-0">
                                        <span className="flex items-center gap-1.5"><CalendarDays size={12} className="text-slate-400" />{formatDate(appt.date)}</span>
                                        <span className="flex items-center gap-1.5"><Clock size={12} className="text-slate-400" />{formatTime(appt.time_slot)}</span>
                                        <span className="flex items-center gap-1.5"><DollarSign size={12} className="text-slate-400" />${appt.service_details.price}</span>
                                        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium ${cfg.color} ${cfg.bg}`}>
                                            <Icon size={11} /> {cfg.label}
                                        </div>
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
