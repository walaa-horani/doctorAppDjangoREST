"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import {
    LayoutDashboard,
    CalendarDays,
    Stethoscope,
    Search,
    Clock,
    BarChart3,
    LogOut,
    Menu,
    X,
    Activity,
    User,
    Settings,
    ChevronRight,
    Home,
} from "lucide-react";

const clientNav = [
    { href: "/", label: "Home", icon: Home },
    { href: "/dashboard/client", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/client/appointments", label: "My Appointments", icon: CalendarDays },
    { href: "/browse", label: "Find Doctors", icon: Search },
];

const providerNav = [
    { href: "/", label: "Home", icon: Home },
    { href: "/dashboard/provider", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/provider/appointments", label: "Appointments", icon: CalendarDays },
    { href: "/dashboard/provider/services", label: "My Services", icon: Stethoscope },
    { href: "/dashboard/provider/schedule", label: "Schedule", icon: Clock },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { user, isLoading, logout } = useAuth();
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const pathname = usePathname();
    const router = useRouter();

    // Redirect unauthenticated users to login
    useEffect(() => {
        if (!isLoading && !user) {
            router.replace("/login");
        }
    }, [isLoading, user, router]);

    // Role-based redirect: prevent cross-dashboard access
    useEffect(() => {
        if (!user) return;
        const onProviderRoute = pathname.startsWith("/dashboard/provider");
        const onClientRoute = pathname.startsWith("/dashboard/client");
        if (user.role === "CLIENT" && onProviderRoute) {
            router.replace("/dashboard/client");
        } else if (user.role === "PROVIDER" && onClientRoute) {
            router.replace("/dashboard/provider");
        }
    }, [user, pathname, router]);

    // Show spinner while auth resolves
    if (isLoading) return (
        <div className="flex h-screen items-center justify-center bg-slate-50">
            <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    // Will redirect via useEffect above; show nothing in the meantime
    if (!user) return null;

    const navItems = user.role === "PROVIDER" ? providerNav : clientNav;
    const roleLabel = user.role === "PROVIDER" ? "Provider" : "Patient";
    const roleColor = user.role === "PROVIDER" ? "from-teal-500 to-cyan-500" : "from-violet-500 to-purple-500";

    const SidebarContent = ({ onClose }: { onClose?: () => void }) => (
        <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="px-6 py-5 border-b border-white/10">
                <Link href="/" className="flex items-center gap-2.5" onClick={onClose}>
                    <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center">
                        <Activity className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-xl font-bold text-white">MediCare</span>
                </Link>
            </div>

            {/* User Info */}
            <div className="px-4 py-4 border-b border-white/10">
                <div className="flex items-center gap-3 px-2 py-3 rounded-xl bg-white/5">
                    <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${roleColor} flex items-center justify-center text-white font-semibold text-sm flex-shrink-0`}>
                        {user.first_name?.[0] || user.email[0].toUpperCase()}
                    </div>
                    <div className="min-w-0">
                        <p className="text-white font-medium text-sm truncate">
                            {user.first_name ? `${user.first_name} ${user.last_name || ""}`.trim() : user.email}
                        </p>
                        <span className={`text-xs font-medium bg-gradient-to-r ${roleColor} bg-clip-text text-transparent`}>
                            {roleLabel}
                        </span>
                    </div>
                </div>
            </div>

            {/* Nav Links */}
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                <p className="px-3 text-xs font-semibold text-white/30 uppercase tracking-widest mb-3">Menu</p>
                {navItems.map(({ href, label, icon: Icon }) => {
                    const isActive = pathname === href || (href !== "/dashboard/client" && href !== "/dashboard/provider" && pathname.startsWith(href));
                    return (
                        <Link
                            key={href}
                            href={href}
                            onClick={onClose}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${isActive
                                ? "bg-teal-500/20 text-teal-400 border border-teal-500/30"
                                : "text-white/60 hover:text-white hover:bg-white/8"
                                }`}
                        >
                            <Icon className={`w-4.5 h-4.5 flex-shrink-0 ${isActive ? "text-teal-400" : "text-white/40 group-hover:text-white/70"}`} size={18} />
                            <span className="flex-1">{label}</span>
                            {isActive && <ChevronRight size={14} className="text-teal-400" />}
                        </Link>
                    );
                })}
            </nav>

            {/* Bottom actions */}
            <div className="px-3 pb-4 border-t border-white/10 pt-4 space-y-1">
                <Link
                    href="/settings"
                    onClick={onClose}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/60 hover:text-white hover:bg-white/8 transition-all"
                >
                    <Settings size={18} className="text-white/40" />
                    Settings
                </Link>
                <button
                    onClick={() => { onClose?.(); logout(); }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400/80 hover:text-red-400 hover:bg-red-500/10 transition-all"
                >
                    <LogOut size={18} />
                    Sign out
                </button>
            </div>
        </div>
    );

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden">
            {/* Desktop Sidebar */}
            <aside className="w-64 bg-slate-900 hidden md:flex flex-col flex-shrink-0">
                <SidebarContent />
            </aside>

            {/* Mobile Sidebar Overlay */}
            {isMobileOpen && (
                <div className="fixed inset-0 z-50 flex md:hidden">
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMobileOpen(false)} />
                    <aside className="relative w-72 bg-slate-900 flex flex-col shadow-2xl">
                        <button
                            onClick={() => setIsMobileOpen(false)}
                            className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/20 transition-all"
                        >
                            <X size={16} />
                        </button>
                        <SidebarContent onClose={() => setIsMobileOpen(false)} />
                    </aside>
                </div>
            )}

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Top Header Bar */}
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-6 flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setIsMobileOpen(true)}
                            className="md:hidden w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-all"
                        >
                            <Menu size={18} />
                        </button>
                        <div className="hidden md:block">
                            <h1 className="text-sm font-semibold text-slate-900">
                                {navItems.find(n => n.href === pathname)?.label || "Dashboard"}
                            </h1>
                            <p className="text-xs text-slate-500">Welcome back, {user.first_name || user.email.split("@")[0]}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r ${roleColor} bg-opacity-10`}>
                            <User size={13} className="text-white" />
                            <span className="text-xs font-medium text-white">{roleLabel}</span>
                        </div>
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center text-white font-semibold text-sm">
                            {user.first_name?.[0] || user.email[0].toUpperCase()}
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
