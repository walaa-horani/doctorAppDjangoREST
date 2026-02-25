"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, LogIn } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

interface BookingModalProps {
    providerId: number;
    providerName: string;
    trigger?: React.ReactNode;
}

interface Service {
    id: number;
    name: string;
    duration: number;
    price: string;
}

export function BookingModal({ providerId, providerName, trigger }: BookingModalProps) {
    const { user } = useAuth();
    const router = useRouter();
    const [date, setDate] = useState<Date>();
    const [services, setServices] = useState<Service[]>([]);
    const [selectedService, setSelectedService] = useState<string>("");
    const [timeSlot, setTimeSlot] = useState<string>("");
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const timeSlots = [
        "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
        "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00"
    ];

    // When modal opens, fetch this provider's services using ?provider= filter
    useEffect(() => {
        if (isOpen) {
            api.get(`/services/?provider=${providerId}`)
                .then(res => setServices(res.data))
                .catch(err => console.error("Failed to fetch services", err));
        }
    }, [isOpen, providerId]);

    // Intercept trigger click — if not logged in, redirect to /login instead of opening modal
    const handleTriggerClick = (e: React.MouseEvent) => {
        if (!user) {
            e.preventDefault();
            e.stopPropagation();
            toast.info("Please sign in to book an appointment", {
                action: {
                    label: "Sign in",
                    onClick: () => router.push("/login"),
                },
            });
            router.push("/login");
        }
        // If logged in, the DialogTrigger will handle opening normally
    };

    // Also guard: providers shouldn't book appointments
    const handleBook = async () => {
        if (!user) {
            toast.error("Please login to book an appointment");
            router.push("/login");
            return;
        }
        if (user.role === "PROVIDER") {
            toast.error("Providers cannot book appointments as clients.");
            return;
        }
        if (!date || !selectedService || !timeSlot) {
            toast.error("Please select a service, date, and time");
            return;
        }

        setIsLoading(true);
        try {
            const formattedDate = format(date, "yyyy-MM-dd");
            const formattedTime = `${timeSlot}:00`;

            await api.post("/appointments/", {
                service: parseInt(selectedService),
                date: formattedDate,
                time_slot: formattedTime,
            });

            toast.success("Appointment booked successfully!");
            setIsOpen(false);
            setDate(undefined);
            setSelectedService("");
            setTimeSlot("");
        } catch (error: any) {
            toast.error("Booking failed: " + (error.response?.data?.detail || "Unknown error"));
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild onClick={handleTriggerClick}>
                {trigger || <Button>Book Appointment</Button>}
            </DialogTrigger>

            {/* Only render content if user is logged in and is a CLIENT */}
            {user && user.role !== "PROVIDER" && (
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Book with {providerName}</DialogTitle>
                        <DialogDescription>
                            Select a service, date, and time for your appointment.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        {/* Service Selection */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Service</label>
                            <Select onValueChange={setSelectedService} value={selectedService}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a service" />
                                </SelectTrigger>
                                <SelectContent>
                                    {services.length === 0 ? (
                                        <SelectItem value="none" disabled>No services available</SelectItem>
                                    ) : (
                                        services.map(service => (
                                            <SelectItem key={service.id} value={service.id.toString()}>
                                                {service.name} ({service.duration} min) - ${service.price}
                                            </SelectItem>
                                        ))
                                    )}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Date Selection */}
                        <div className="space-y-2 flex flex-col">
                            <label className="text-sm font-medium">Date</label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant={"outline"}
                                        className={cn(
                                            "w-full justify-start text-left font-normal",
                                            !date && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {date ? format(date, "PPP") : <span>Pick a date</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={date}
                                        onSelect={setDate}
                                        initialFocus
                                        disabled={(date) => date < new Date()}
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>

                        {/* Time Selection */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Time</label>
                            <Select onValueChange={setTimeSlot} value={timeSlot}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a time" />
                                </SelectTrigger>
                                <SelectContent>
                                    {timeSlots.map(time => (
                                        <SelectItem key={time} value={time}>{time}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button onClick={handleBook} disabled={isLoading} className="w-full">
                            {isLoading ? "Booking..." : "Confirm Booking"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            )}

            {/* Show "please log in" dialog content if not authenticated */}
            {!user && (
                <DialogContent className="sm:max-w-sm text-center">
                    <DialogHeader>
                        <DialogTitle>Sign in required</DialogTitle>
                        <DialogDescription>
                            You need to be logged in as a patient to book an appointment.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col gap-3 pt-2">
                        <Button onClick={() => router.push("/login")} className="w-full gap-2">
                            <LogIn size={15} /> Sign in
                        </Button>
                        <Button variant="outline" onClick={() => router.push("/register")} className="w-full">
                            Create an account
                        </Button>
                    </div>
                </DialogContent>
            )}
        </Dialog>
    );
}
