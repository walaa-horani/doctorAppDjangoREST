"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function ProviderDashboard() {
    const [stats, setStats] = useState({ services: 0, appointments: 0 });

    useEffect(() => {
        // Mock stats for now or fetch
        // api.get('/api/provider/stats').then...
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
                        <div className="text-2xl font-bold">--</div>
                        <p className="text-xs text-gray-500">Active services listed</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Upcoming Appointments</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">--</div>
                        <p className="text-xs text-gray-500">Scheduled for this week</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Revenue</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">$0.00</div>
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
