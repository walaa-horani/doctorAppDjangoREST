"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Appointment {
    id: number;
    service_details: { name: string; duration: number; price: string };
    provider_details: { first_name: string; last_name: string; email: string };
    date: string;
    time_slot: string;
    status: string;
}

export default function ClientDashboard() {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        api.get("/appointments/")
            .then((res) => setAppointments(res.data))
            .catch((err) => console.error(err))
            .finally(() => setIsLoading(false));
    }, []);

    if (isLoading) return <div>Loading...</div>;

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">My Appointments</h1>

            {appointments.length === 0 ? (
                <p>No appointments found.</p>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {appointments.map((appt) => (
                        <Card key={appt.id}>
                            <CardHeader>
                                <CardTitle>{appt.service_details.name}</CardTitle>
                                <CardDescription>
                                    with {appt.provider_details.first_name} {appt.provider_details.last_name}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-medium">{appt.date} at {appt.time_slot}</span>
                                    <Badge variant={appt.status === 'CONFIRMED' ? 'default' : 'secondary'}>
                                        {appt.status}
                                    </Badge>
                                </div>
                                <p className="text-sm text-gray-500">{appt.service_details.duration} mins - ${appt.service_details.price}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
