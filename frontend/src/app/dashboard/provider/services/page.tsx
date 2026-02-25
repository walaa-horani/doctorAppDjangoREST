"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Stethoscope, Plus, Clock, DollarSign, Trash2, ToggleLeft, ToggleRight, AlertCircle } from "lucide-react";
import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

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
    const [isOpen, setIsOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const { register, handleSubmit, reset, formState: { errors } } = useForm();

    const fetchServices = () => {
        api.get("/services/")
            .then(res => setServices(res.data))
            .catch(console.error)
            .finally(() => setIsLoading(false));
    };

    useEffect(() => { fetchServices(); }, []);

    const onSubmit = async (data: any) => {
        setIsSaving(true);
        try {
            await api.post("/services/", data);
            toast.success("Service created successfully!");
            setIsOpen(false);
            reset();
            fetchServices();
        } catch {
            toast.error("Failed to create service. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    const toggleActive = async (service: Service) => {
        try {
            await api.patch(`/services/${service.id}/`, { is_active: !service.is_active });
            toast.success(`Service ${service.is_active ? "deactivated" : "activated"}`);
            fetchServices();
        } catch {
            toast.error("Failed to update service");
        }
    };

    const deleteService = async (id: number) => {
        if (!confirm("Are you sure you want to delete this service?")) return;
        try {
            await api.delete(`/services/${id}/`);
            toast.success("Service deleted");
            fetchServices();
        } catch {
            toast.error("Failed to delete service");
        }
    };

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">My Services</h1>
                    <p className="text-slate-500 text-sm mt-0.5">{services.length} service{services.length !== 1 ? "s" : ""} listed</p>
                </div>
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger asChild>
                        <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium rounded-xl transition-colors">
                            <Plus size={15} />
                            Add New Service
                        </button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Create New Service</DialogTitle>
                            <DialogDescription>Add a service that patients can book with you.</DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
                            <div className="space-y-1.5">
                                <Label htmlFor="name">Service Name *</Label>
                                <Input id="name" placeholder="e.g. General Consultation" {...register("name", { required: "Name is required" })} />
                                {errors.name && <p className="text-xs text-red-500">{String(errors.name.message)}</p>}
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="description">Description</Label>
                                <Textarea id="description" placeholder="Brief description of the service..." rows={3} {...register("description")} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="duration">Duration (minutes) *</Label>
                                    <Input id="duration" type="number" min={5} placeholder="30" {...register("duration", { required: "Required" })} />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="price">Price (USD) *</Label>
                                    <Input id="price" type="number" step="0.01" min={0} placeholder="100.00" {...register("price", { required: "Required" })} />
                                </div>
                            </div>
                            <DialogFooter className="mt-2">
                                <button type="button" onClick={() => setIsOpen(false)} className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors">
                                    Cancel
                                </button>
                                <button type="submit" disabled={isSaving} className="px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium transition-colors disabled:opacity-60">
                                    {isSaving ? "Saving..." : "Create Service"}
                                </button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
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
                    <p className="text-slate-700 font-semibold">No services yet</p>
                    <p className="text-slate-400 text-sm mt-1 mb-5">Create your first service so patients can book with you.</p>
                    <button onClick={() => setIsOpen(true)} className="inline-flex items-center gap-2 px-4 py-2.5 bg-teal-600 text-white text-sm font-medium rounded-xl hover:bg-teal-700 transition-colors">
                        <Plus size={15} /> Add First Service
                    </button>
                </div>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {services.map(service => (
                        <div key={service.id} className={`bg-white rounded-2xl border p-5 flex flex-col gap-3 transition-all hover:shadow-sm ${service.is_active ? "border-slate-200" : "border-slate-100 opacity-60"}`}>
                            <div className="flex items-start justify-between gap-2">
                                <div className="w-9 h-9 rounded-xl bg-teal-50 flex items-center justify-center flex-shrink-0">
                                    <Stethoscope size={16} className="text-teal-600" />
                                </div>
                                <div className="flex gap-1">
                                    <button onClick={() => toggleActive(service)} className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors" title={service.is_active ? "Deactivate" : "Activate"}>
                                        {service.is_active ? <ToggleRight size={16} className="text-teal-600" /> : <ToggleLeft size={16} />}
                                    </button>
                                    <button onClick={() => deleteService(service.id)} className="w-7 h-7 rounded-lg hover:bg-red-50 flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors" title="Delete">
                                        <Trash2 size={14} />
                                    </button>
                                </div>
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
