"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function ProviderDashboard() {
    const [stats, setStats] = useState({ services: 0, appointments: 0, revenue: 0 });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // Fetch services and appointments in parallel
                const [servicesRes, appointmentsRes] = await Promise.all([
                    api.get('/services/'),
                    api.get('/appointments/')
                ]);

                // Calculate total revenue from non-cancelled appointments
                const revenue = appointmentsRes.data.reduce((sum: number, app: any) => {
                    if (app.status !== 'CANCELLED' && app.status !== 'REJECTED') {
                        return sum + parseFloat(app.service_details?.price || "0");
                    }
                    return sum;
                }, 0);

                // Assuming the user context is handling their own filtering,
                // or the endpoints will be fixed to filter by the requesting provider.
                setStats({
                    services: servicesRes.data?.length || 0,
                    appointments: appointmentsRes.data?.length || 0,
                    revenue: revenue
                });
            } catch (error) {
                console.error("Failed to fetch provider dashboard stats", error);
            }
        };

        fetchStats();
    }, []);

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Provider Dashboard</h1>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Total Services</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.services}</div>
                        <p className="text-xs text-gray-500">Active services listed</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Upcoming Appointments</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.appointments}</div>
                        <p className="text-xs text-gray-500">Scheduled for this week</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Revenue</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${stats.revenue.toFixed(2)}</div>
                        <p className="text-xs text-gray-500">Projected metrics</p>
                    </CardContent>
                </Card>
            </div>

            <div className="flex gap-4">
                <Link href="/dashboard/provider/services">
                    <Button>Manage Services</Button>
                </Link>
                <Link href="/dashboard/provider/schedule">
                    <Button variant="outline">Update Schedule</Button>
                </Link>
            </div>
        </div>
    );
}
