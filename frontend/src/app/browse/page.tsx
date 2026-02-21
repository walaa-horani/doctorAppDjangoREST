"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

interface Service {
    id: number;
    name: string;
    description: string;
    duration: number;
    price: string;
    provider: number; // Provider ID
    // We might need provider details which should be populated by serializer
}

export default function BrowsePage() {
    const [services, setServices] = useState<Service[]>([]);
    const { user } = useAuth();

    useEffect(() => {
        api.get("/services/")
            .then((res) => setServices(res.data))
            .catch((err) => console.error(err));
    }, []);

    const bookAppointment = async (serviceId: number) => {
        if (!user) {
            toast.error("Please login to book");
            return;
        }

        // Setup for a booking modal or simple auto-book for now (demo)
        // ideally show a calendar
        try {
            await api.post("/appointments/", {
                service: serviceId,
                date: new Date().toISOString().split('T')[0], // Today
                time_slot: "10:00:00", // Hardcoded for demo
            });
            toast.success("Appointment request sent!");
        } catch (error) {
            toast.error("Failed to book");
        }
    };

    return (
        <div className="container mx-auto py-10 px-4">
            <h1 className="text-3xl font-bold mb-6">Browse Services</h1>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {services.map((service) => (
                    <Card key={service.id}>
                        <CardHeader>
                            <CardTitle>{service.name}</CardTitle>
                            <CardDescription>${service.price} • {service.duration} mins</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-gray-500">{service.description}</p>
                        </CardContent>
                        <CardFooter>
                            <Button onClick={() => bookAppointment(service.id)}>Book Now</Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    );
}
