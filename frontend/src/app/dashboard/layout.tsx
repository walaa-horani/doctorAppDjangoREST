"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, logout } = useAuth();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    if (!user) {
        return null;
    }

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
            {/* Desktop Sidebar */}
            <aside className="w-64 bg-white dark:bg-gray-800 border-r hidden md:block">
                <div className="p-6">
                    <h2 className="text-2xl font-bold text-teal-600">MediCare</h2>
                    <p className="text-sm text-gray-500 mt-1 uppercase tracking-wider font-semibold">{user.role}</p>
                </div>
                <nav className="mt-6 px-4 space-y-2">
                    <NavLinks role={user.role} />
                    <Button variant="ghost" className="w-full justify-start mt-10 text-red-500 hover:text-red-600 hover:bg-red-50" onClick={logout}>
                        Logout
                    </Button>
                </nav>
            </aside>

            {/* Mobile Sidebar (Overlay) */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-50 flex md:hidden">
                    <div className="fixed inset-0 bg-black/50" onClick={() => setIsMobileMenuOpen(false)}></div>
                    <aside className="relative w-64 bg-white dark:bg-gray-800 h-full shadow-xl flex flex-col">
                        <div className="p-6 border-b flex justify-between items-center">
                            <h2 className="text-xl font-bold text-teal-600">MediCare</h2>
                            <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)}>
                                <span className="sr-only">Close</span>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                            </Button>
                        </div>
                        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                            <NavLinks role={user.role} onClick={() => setIsMobileMenuOpen(false)} />
                            <Button variant="ghost" className="w-full justify-start mt-10 text-red-500 hover:text-red-600 hover:bg-red-50" onClick={logout}>
                                Logout
                            </Button>
                        </nav>
                    </aside>
                </div>
            )}

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden">
                <header className="h-16 bg-white dark:bg-gray-800 border-b flex items-center justify-between px-4 md:hidden">
                    <span className="font-bold text-lg text-teal-600">MediCare</span>
                    <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(true)}>
                        <span className="sr-only">Open menu</span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6"><line x1="4" x2="20" y1="12" y2="12" /><line x1="4" x2="20" y1="6" y2="6" /><line x1="4" x2="20" y1="18" y2="18" /></svg>
                    </Button>
                </header>
                <div className="flex-1 overflow-y-auto p-4 md:p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}

function NavLinks({ role, onClick }: { role: string, onClick?: () => void }) {
    return (
        <>
            {role === 'PROVIDER' && (
                <>
                    <Link href="/dashboard/provider" onClick={onClick} className="block px-4 py-2 rounded-md hover:bg-teal-50 text-slate-700 hover:text-teal-700 font-medium transition-colors">Overview</Link>
                    <Link href="/dashboard/provider/services" onClick={onClick} className="block px-4 py-2 rounded-md hover:bg-teal-50 text-slate-700 hover:text-teal-700 font-medium transition-colors">My Services</Link>
                    <Link href="/dashboard/provider/schedule" onClick={onClick} className="block px-4 py-2 rounded-md hover:bg-teal-50 text-slate-700 hover:text-teal-700 font-medium transition-colors">Schedule</Link>
                </>
            )}
            {role === 'CLIENT' && (
                <>
                    <Link href="/dashboard/client" onClick={onClick} className="block px-4 py-2 rounded-md hover:bg-teal-50 text-slate-700 hover:text-teal-700 font-medium transition-colors">My Appointments</Link>
                    <Link href="/browse" onClick={onClick} className="block px-4 py-2 rounded-md hover:bg-teal-50 text-slate-700 hover:text-teal-700 font-medium transition-colors">Browse Providers</Link>
                </>
            )}
        </>
    );
}
