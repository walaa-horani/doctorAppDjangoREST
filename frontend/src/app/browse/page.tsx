"use client";

import { Search, MapPin, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { BookingModal } from "@/components/booking-modal";
import api from "@/lib/api";
import { useEffect, useState } from "react";
import Link from "next/link";

interface Provider {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    provider_profile?: {
        business_name: string;
        is_verified: boolean;
        bio?: string;
        profile_image?: string;
    };
}

export default function BrowseProviders() {
    const [providers, setProviders] = useState<Provider[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch all providers
        const fetchProviders = async () => {
            try {
                const res = await api.get("/auth/providers/");
                setProviders(res.data);
            } catch (err) {
                console.error("Failed to fetch providers:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchProviders();
    }, []);

    const filteredProviders = providers.filter(provider => {
        const fullName = `${provider.first_name} ${provider.last_name}`.toLowerCase();
        const businessName = (provider.provider_profile?.business_name || "").toLowerCase();
        const query = searchQuery.toLowerCase();

        return fullName.includes(query) || businessName.includes(query);
    });

    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Find a Provider</h1>
                    <p className="text-slate-600 mt-1">Discover and book appointments with top-rated medical professionals.</p>
                </div>

                {/* Search Bar */}
                <div className="relative w-full md:w-96">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-slate-400" />
                    </div>
                    <Input
                        type="text"
                        className="pl-10 w-full"
                        placeholder="Search by name or clinic..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {loading ? (
                <div className="text-center py-20 text-slate-500">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
                    Loading providers...
                </div>
            ) : filteredProviders.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-lg border border-slate-200 shadow-sm">
                    <Search className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-900">No providers found</h3>
                    <p className="text-slate-500 mt-1">Try adjusting your search terms.</p>
                    <Button
                        variant="outline"
                        className="mt-4"
                        onClick={() => setSearchQuery("")}
                    >
                        Clear Search
                    </Button>
                </div>
            ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {filteredProviders.map((provider) => (
                        <Card key={provider.id} className="overflow-hidden group flex flex-col h-full bg-white hover:shadow-lg transition-shadow duration-300">
                            <div className="h-48 bg-slate-100 relative">
                                <img
                                    src={
                                        provider.provider_profile?.profile_image
                                            ? (provider.provider_profile.profile_image.startsWith('http')
                                                ? provider.provider_profile.profile_image
                                                : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}${provider.provider_profile.profile_image}`)
                                            : `https://images.unsplash.com/photo-${1537368910025 + provider.id}?auto=format&fit=crop&q=80&w=800`
                                    }
                                    alt={provider.first_name}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=800" }}
                                />
                                {provider.provider_profile?.is_verified && (
                                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-semibold text-teal-700 shadow-sm">
                                        Verified
                                    </div>
                                )}
                            </div>
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle className="text-lg text-slate-900">
                                            {provider.provider_profile?.business_name || `Dr. ${provider.last_name}`}
                                        </CardTitle>
                                        <p className="text-sm font-medium text-teal-600 mt-1">
                                            {provider.first_name} {provider.last_name}
                                        </p>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="flex-grow text-sm text-slate-600">
                                <p className="line-clamp-3 mb-4">
                                    {provider.provider_profile?.bio || "Experienced specialist dedicated to providing comprehensive patient care."}
                                </p>
                                <div className="space-y-2 mt-auto">
                                    <div className="flex items-center gap-2 text-slate-500 text-xs">
                                        <MapPin className="h-4 w-4" />
                                        <span>Available Online & In-Person</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-slate-500 text-xs text-yellow-500">
                                        <Star className="h-4 w-4 fill-current" />
                                        <span className="text-slate-700 font-medium">4.9 (120 reviews)</span>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="pt-4 border-t border-slate-100 pb-5">
                                <BookingModal
                                    providerId={provider.id}
                                    providerName={`Dr. ${provider.last_name}`}
                                />
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
