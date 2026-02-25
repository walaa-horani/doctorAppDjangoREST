"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import {
    Stethoscope, CalendarDays, DollarSign, TrendingUp,
    CheckCircle2, Clock, XCircle, Timer, ChevronRight,
    Plus, ArrowUpRight, Users
} from "lucide-react";

interface Appointment {
    id: number;
    service_details: { name: string; duration: number; price: string };
    client_details: { first_name: string; last_name: string; email: string };
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

function StatCard({ title, value, sub, icon: Icon, color, loading }: any) {
    if (loading) return (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 animate-pulse">
            <div className="h-3 w-24 bg-slate-200 rounded mb-3" />
            <div className="h-7 w-16 bg-slate-200 rounded" />
        </div>
    );
    return (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-sm transition-shadow">
            <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-slate-500 font-medium">{title}</p>
                <div className={`w-9 h-9 ${color} rounded-xl flex items-center justify-center`}>
                    <Icon size={16} className="text-white" />
                </div>
            </div>
            <p className="text-3xl font-bold text-slate-900">{value}</p>
            <p className="text-xs text-slate-400 mt-1">{sub}</p>
        </div>
    );
}

export default function ProviderDashboard() {
    const { user } = useAuth();
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [serviceCount, setServiceCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        Promise.all([api.get("/services/"), api.get("/appointments/")])
            .then(([svcRes, apptRes]) => {
                setServiceCount(svcRes.data.length);
                setAppointments(apptRes.data);
            })
            .catch(console.error)
            .finally(() => setIsLoading(false));
    }, []);

    const upcoming = appointments.filter(a => a.status === "CONFIRMED" || a.status === "PENDING");
    const completed = appointments.filter(a => a.status === "COMPLETED");
    const revenue = completed.reduce((sum, a) => sum + parseFloat(a.service_details.price), 0);
    const uniquePatients = new Set(appointments.map(a => a.client_details?.email)).size;

    const formatDate = (d: string) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const formatTime = (t: string) => {
        const [h, m] = t.split(":");
        const d = new Date(); d.setHours(+h, +m);
        return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
    };

    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">
                        Welcome, Dr. {user?.last_name || user?.first_name || "Doctor"} 👨‍⚕️
                    </h1>
                    <p className="text-slate-500 text-sm mt-0.5">Here's your practice overview</p>
                </div>
                <div className="flex gap-2">
                    <Link
                        href="/dashboard/provider/services"
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium rounded-xl transition-colors"
                    >
                        <Plus size={15} />
                        Add Service
                    </Link>
                    <Link
                        href="/dashboard/provider/schedule"
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-medium rounded-xl transition-colors"
                    >
                        <Clock size={15} />
                        Schedule
                    </Link>
                </div>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="My Services" value={serviceCount} sub="Active offerings" icon={Stethoscope} color="bg-teal-500" loading={isLoading} />
                <StatCard title="Upcoming" value={upcoming.length} sub="Confirmed + pending" icon={CalendarDays} color="bg-amber-500" loading={isLoading} />
                <StatCard title="Total Revenue" value={`$${revenue.toFixed(0)}`} sub="From completed" icon={DollarSign} color="bg-violet-500" loading={isLoading} />
                <StatCard title="Patients Seen" value={uniquePatients} sub="Unique patients" icon={Users} color="bg-cyan-500" loading={isLoading} />
            </div>

            {/* Quick Links */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                    { href: "/dashboard/provider/appointments", icon: CalendarDays, label: "Manage Appointments", desc: "View and update appointment status", color: "bg-teal-50 text-teal-700" },
                    { href: "/dashboard/provider/services", icon: Stethoscope, label: "Manage Services", desc: "Add, edit or remove your offerings", color: "bg-violet-50 text-violet-700" },
                    { href: "/dashboard/provider/schedule", icon: Clock, label: "Update Schedule", desc: "Set your availability hours", color: "bg-amber-50 text-amber-700" },
                ].map(({ href, icon: Icon, label, desc, color }) => (
                    <Link key={href} href={href} className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-sm hover:border-slate-300 transition-all group">
                        <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mb-3`}>
                            <Icon size={18} />
                        </div>
                        <p className="font-semibold text-slate-900 text-sm">{label}</p>
                        <p className="text-slate-500 text-xs mt-1">{desc}</p>
                        <div className="flex items-center gap-1 mt-3 text-xs font-medium text-slate-400 group-hover:text-teal-600 transition-colors">
                            Go <ChevronRight size={13} />
                        </div>
                    </Link>
                ))}
            </div>

            {/* Recent Appointments */}
            <div className="bg-white rounded-2xl border border-slate-200">
                <div className="flex items-center justify-between p-5 border-b border-slate-100">
                    <h2 className="text-base font-semibold text-slate-900">Recent Appointments</h2>
                    <Link href="/dashboard/provider/appointments" className="flex items-center gap-1 text-xs font-medium text-teal-600 hover:text-teal-700">
                        View all <ArrowUpRight size={13} />
                    </Link>
                </div>
                <div className="divide-y divide-slate-100">
                    {isLoading ? (
                        [...Array(4)].map((_, i) => (
                            <div key={i} className="flex items-center gap-4 p-4 animate-pulse">
                                <div className="w-9 h-9 rounded-full bg-slate-200 flex-shrink-0" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-3 w-32 bg-slate-200 rounded" />
                                    <div className="h-2.5 w-24 bg-slate-100 rounded" />
                                </div>
                                <div className="h-5 w-20 bg-slate-100 rounded-full" />
                            </div>
                        ))
                    ) : appointments.length === 0 ? (
                        <div className="py-12 text-center text-slate-400">
                            <CalendarDays size={32} className="mx-auto mb-3 opacity-30" />
                            <p className="text-sm font-medium">No appointments yet</p>
                        </div>
                    ) : (
                        appointments.slice(0, 6).map(appt => {
                            const cfg = STATUS_CONFIG[appt.status] || STATUS_CONFIG.PENDING;
                            const Icon = cfg.icon;
                            return (
                                <div key={appt.id} className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 hover:bg-slate-50 transition-colors">
                                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                                        {appt.client_details?.first_name?.[0] || "?"}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-slate-900 truncate">
                                            {appt.client_details?.first_name} {appt.client_details?.last_name}
                                        </p>
                                        <p className="text-xs text-slate-500 truncate">{appt.service_details.name}</p>
                                    </div>
                                    <div className="flex items-center gap-4 text-xs text-slate-400 pl-12 sm:pl-0">
                                        <span className="flex items-center gap-1"><CalendarDays size={11} /> {formatDate(appt.date)}</span>
                                        <span className="flex items-center gap-1"><Clock size={11} /> {formatTime(appt.time_slot)}</span>
                                        <div className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs font-medium ${cfg.color} ${cfg.bg}`}>
                                            <Icon size={10} /> {cfg.label}
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
