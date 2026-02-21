"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
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

export default function ServicesPage() {
    const [services, setServices] = useState<Service[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const { register, handleSubmit, reset } = useForm();

    const fetchServices = () => {
        api.get("/services/")
            .then((res) => setServices(res.data))
            .catch((err) => console.error(err));
    };

    useEffect(() => {
        fetchServices();
    }, []);

    const onSubmit = async (data: any) => {
        try {
            await api.post("/services/", data);
            toast.success("Service created");
            setIsOpen(false);
            reset();
            fetchServices();
        } catch (error) {
            toast.error("Failed to create service");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">My Services</h1>
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger asChild>
                        <Button>Add New Service</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add Service</DialogTitle>
                            <DialogDescription>Create a new service offering.</DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <div>
                                <Label htmlFor="name">Name</Label>
                                <Input id="name" {...register("name", { required: true })} />
                            </div>
                            <div>
                                <Label htmlFor="description">Description</Label>
                                <Textarea id="description" {...register("description")} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="duration">Duration (mins)</Label>
                                    <Input id="duration" type="number" {...register("duration", { required: true })} />
                                </div>
                                <div>
                                    <Label htmlFor="price">Price ($)</Label>
                                    <Input id="price" type="number" step="0.01" {...register("price", { required: true })} />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit">Save</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {services.map((service) => (
                    <Card key={service.id}>
                        <CardHeader>
                            <CardTitle>{service.name}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-gray-500 mb-2">{service.description}</p>
                            <div className="flex justify-between font-bold">
                                <span>{service.duration} mins</span>
                                <span>${service.price}</span>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
