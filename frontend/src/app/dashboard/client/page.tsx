"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import {
    CalendarDays, Clock, DollarSign, Search,
    CheckCircle2, XCircle, AlertCircle, Timer, ChevronRight
} from "lucide-react";

interface Appointment {
    id: number;
    service_details: { name: string; duration: number; price: string };
    provider_details: { first_name: string; last_name: string; email: string };
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

function SkeletonCard() {
    return (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 animate-pulse space-y-4">
            <div className="flex justify-between">
                <div className="space-y-2">
                    <div className="h-4 w-36 bg-slate-200 rounded" />
                    <div className="h-3 w-24 bg-slate-100 rounded" />
                </div>
                <div className="h-6 w-20 bg-slate-100 rounded-full" />
            </div>
            <div className="h-px bg-slate-100" />
            <div className="flex gap-4">
                <div className="h-3 w-28 bg-slate-100 rounded" />
                <div className="h-3 w-16 bg-slate-100 rounded" />
            </div>
        </div>
    );
}

export default function ClientDashboard() {
    const { user } = useAuth();
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState("ALL");

    useEffect(() => {
        api.get("/appointments/")
            .then((res) => setAppointments(res.data))
            .catch(console.error)
            .finally(() => setIsLoading(false));
    }, []);

    const upcoming = appointments.filter(a => a.status === "CONFIRMED" || a.status === "PENDING");
    const completed = appointments.filter(a => a.status === "COMPLETED");
    const totalSpent = completed.reduce((sum, a) => sum + parseFloat(a.service_details.price), 0);

    const filtered = filter === "ALL" ? appointments : appointments.filter(a => a.status === filter);
    const filters = ["ALL", "PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"];

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
    };
    const formatTime = (timeStr: string) => {
        const [h, m] = timeStr.split(":");
        const d = new Date(); d.setHours(+h, +m);
        return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
    };

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">
                        Hello, {user?.first_name || "there"} 👋
                    </h1>
                    <p className="text-slate-500 text-sm mt-0.5">Here's your health overview</p>
                </div>
                <Link
                    href="/browse"
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium rounded-xl transition-colors"
                >
                    <Search size={15} />
                    Find a Doctor
                </Link>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {isLoading ? (
                    [...Array(3)].map((_, i) => (
                        <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5 animate-pulse">
                            <div className="h-3 w-24 bg-slate-200 rounded mb-3" />
                            <div className="h-7 w-12 bg-slate-200 rounded" />
                        </div>
                    ))
                ) : (
                    <>
                        <div className="bg-white rounded-2xl border border-slate-200 p-5">
                            <div className="flex items-center justify-between mb-3">
                                <p className="text-sm text-slate-500 font-medium">Total Appointments</p>
                                <div className="w-9 h-9 bg-teal-50 rounded-xl flex items-center justify-center">
                                    <CalendarDays size={16} className="text-teal-600" />
                                </div>
                            </div>
                            <p className="text-3xl font-bold text-slate-900">{appointments.length}</p>
                            <p className="text-xs text-slate-400 mt-1">All time</p>
                        </div>
                        <div className="bg-white rounded-2xl border border-slate-200 p-5">
                            <div className="flex items-center justify-between mb-3">
                                <p className="text-sm text-slate-500 font-medium">Upcoming</p>
                                <div className="w-9 h-9 bg-amber-50 rounded-xl flex items-center justify-center">
                                    <Clock size={16} className="text-amber-600" />
                                </div>
                            </div>
                            <p className="text-3xl font-bold text-slate-900">{upcoming.length}</p>
                            <p className="text-xs text-slate-400 mt-1">Confirmed or pending</p>
                        </div>
                        <div className="bg-white rounded-2xl border border-slate-200 p-5">
                            <div className="flex items-center justify-between mb-3">
                                <p className="text-sm text-slate-500 font-medium">Total Spent</p>
                                <div className="w-9 h-9 bg-violet-50 rounded-xl flex items-center justify-center">
                                    <DollarSign size={16} className="text-violet-600" />
                                </div>
                            </div>
                            <p className="text-3xl font-bold text-slate-900">${totalSpent.toFixed(0)}</p>
                            <p className="text-xs text-slate-400 mt-1">Completed visits</p>
                        </div>
                    </>
                )}
            </div>

            {/* Appointments Section */}
            <div className="bg-white rounded-2xl border border-slate-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 border-b border-slate-100 gap-3">
                    <h2 className="text-base font-semibold text-slate-900">Appointments</h2>
                    <div className="flex gap-1.5 flex-wrap">
                        {filters.map(f => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${filter === f
                                        ? "bg-teal-600 text-white"
                                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                    }`}
                            >
                                {f === "ALL" ? "All" : STATUS_CONFIG[f]?.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="p-5 space-y-3">
                    {isLoading ? (
                        [...Array(3)].map((_, i) => <SkeletonCard key={i} />)
                    ) : filtered.length === 0 ? (
                        <div className="py-16 text-center">
                            <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <AlertCircle size={24} className="text-slate-400" />
                            </div>
                            <p className="text-slate-500 font-medium">No appointments found</p>
                            <p className="text-slate-400 text-sm mt-1">Book your first appointment with a doctor!</p>
                            <Link href="/browse" className="inline-flex items-center gap-1.5 mt-4 text-sm text-teal-600 font-medium hover:text-teal-700">
                                Browse doctors <ChevronRight size={14} />
                            </Link>
                        </div>
                    ) : (
                        filtered.map((appt) => {
                            const { label, color, bg, icon: Icon } = STATUS_CONFIG[appt.status] || STATUS_CONFIG.PENDING;
                            return (
                                <div key={appt.id} className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                                {appt.provider_details.first_name[0]}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-slate-900 text-sm">{appt.service_details.name}</p>
                                                <p className="text-xs text-slate-500 mt-0.5">
                                                    Dr. {appt.provider_details.first_name} {appt.provider_details.last_name}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-3 sm:gap-5 text-xs text-slate-500 pl-13">
                                        <div className="flex items-center gap-1.5">
                                            <CalendarDays size={13} className="text-slate-400" />
                                            {formatDate(appt.date)}
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <Clock size={13} className="text-slate-400" />
                                            {formatTime(appt.time_slot)}
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <DollarSign size={13} className="text-slate-400" />
                                            ${appt.service_details.price}
                                        </div>
                                        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium ${color} ${bg}`}>
                                            <Icon size={11} />
                                            {label}
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
