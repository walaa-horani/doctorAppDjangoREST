"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Stethoscope, Clock, DollarSign, AlertCircle } from "lucide-react";

interface Service {
    id: number;
    name: string;
    description: string;
    duration: number;
    price: string;
    is_active: boolean;
}

function SkeletonServiceCard() {
    return (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 animate-pulse space-y-4">
            <div className="h-4 w-40 bg-slate-200 rounded" />
            <div className="h-3 w-full bg-slate-100 rounded" />
            <div className="h-3 w-3/4 bg-slate-100 rounded" />
            <div className="flex gap-4 pt-2">
                <div className="h-5 w-20 bg-slate-100 rounded-full" />
                <div className="h-5 w-16 bg-slate-100 rounded-full" />
            </div>
        </div>
    );
}

export default function ServicesPage() {
    const [services, setServices] = useState<Service[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        api.get("/services/")
            .then(res => setServices(res.data))
            .catch(console.error)
            .finally(() => setIsLoading(false));
    }, []);

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">My Services</h1>
                <p className="text-slate-500 text-sm mt-0.5">
                    {isLoading ? "Loading..." : `${services.length} service${services.length !== 1 ? "s" : ""} assigned to your profile`}
                    <span className="ml-2 text-xs text-slate-400">· Managed by administrator</span>
                </p>
            </div>

            {/* Info Banner */}
            <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
                <AlertCircle size={16} className="flex-shrink-0 mt-0.5 text-blue-600" />
                <p>
                    Services are managed by the <strong>administrator</strong> via the Django admin panel.
                    Contact your admin if you need to add, modify, or remove a service.
                </p>
            </div>

            {isLoading ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {[...Array(6)].map((_, i) => <SkeletonServiceCard key={i} />)}
                </div>
            ) : services.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 py-20 text-center">
                    <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Stethoscope size={24} className="text-slate-400" />
                    </div>
                    <p className="text-slate-700 font-semibold">No services assigned</p>
                    <p className="text-slate-400 text-sm mt-1">Ask your administrator to add services to your profile.</p>
                </div>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {services.map(service => (
                        <div key={service.id} className={`bg-white rounded-2xl border flex flex-col gap-3 p-5 transition-all hover:shadow-sm ${service.is_active ? "border-slate-200" : "border-slate-100 opacity-60"}`}>
                            <div className="w-9 h-9 rounded-xl bg-teal-50 flex items-center justify-center">
                                <Stethoscope size={16} className="text-teal-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-slate-900 text-sm">{service.name}</h3>
                                {service.description && <p className="text-xs text-slate-500 mt-1 line-clamp-2">{service.description}</p>}
                            </div>
                            <div className="flex items-center gap-3 mt-auto pt-2 border-t border-slate-100">
                                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                    <Clock size={12} className="text-slate-400" />
                                    {service.duration} min
                                </div>
                                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-900">
                                    <DollarSign size={12} className="text-teal-600" />
                                    {parseFloat(service.price).toFixed(2)}
                                </div>
                                <div className={`ml-auto px-2 py-0.5 rounded-full text-xs font-medium ${service.is_active ? "bg-teal-50 text-teal-700" : "bg-slate-100 text-slate-500"}`}>
                                    {service.is_active ? "Active" : "Inactive"}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
