"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Clock, CheckCircle2 } from "lucide-react";
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
    const [date, setDate] = useState<Date>();
    const [services, setServices] = useState<Service[]>([]);
    const [selectedService, setSelectedService] = useState<string>("");
    const [timeSlot, setTimeSlot] = useState<string>("");
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Mock time slots for now - ideal implementation fetches availability from backend
    const timeSlots = [
        "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
        "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00"
    ];

    useEffect(() => {
        if (isOpen) {
            // Fetch services for this provider
            // Since our API currently doesn't filter services by provider ID easily in one call without param,
            // we might need to fetch all and filter client side OR update backend.
            // Let's try fetching all and filtering for now (optimization for later).
            api.get("/services/")
                .then(res => {
                    const providerServices = res.data.filter((s: any) => s.provider === providerId);
                    setServices(providerServices);
                })
                .catch(err => console.error("Failed to fetch services", err));
        }
    }, [isOpen, providerId]);

    const handleBook = async () => {
        if (!user) {
            toast.error("Please login to book an appointment");
            return;
        }
        if (!date || !selectedService || !timeSlot) {
            toast.error("Please select a service, date, and time");
            return;
        }

        setIsLoading(true);
        try {
            const formattedDate = format(date, "yyyy-MM-dd");
            // Format time to HH:MM:ss
            const formattedTime = `${timeSlot}:00`;

            await api.post("/appointments/", {
                service: parseInt(selectedService),
                date: formattedDate,
                time_slot: formattedTime,
            });

            toast.success("Appointment booked successfully!");
            setIsOpen(false);
            // Reset form
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
            <DialogTrigger asChild>
                {trigger || <Button>Book Appointment</Button>}
            </DialogTrigger>
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
                                    <SelectItem key={time} value={time}>
                                        {time}
                                    </SelectItem>
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
        </Dialog>
    );
}
