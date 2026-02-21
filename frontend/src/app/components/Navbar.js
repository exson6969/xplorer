"use client";

import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
    const [mobileOpen, setMobileOpen] = useState(false);

    const navLinks = [
        { href: "/home", label: "Home" },
        { href: "/trips", label: "Trips" },
        { href: "/history", label: "History" },
    ];

    return (
        <header className="w-full px-6 py-6 md:px-12 lg:px-20 flex items-center justify-between z-50 relative">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
                <div className="size-9 text-primary bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all duration-300">
                    <span className="material-symbols-outlined text-[22px]">explore</span>
                </div>
                <h2 className="text-slate-900 text-xl font-bold tracking-tight">
                    EXPLORER
                </h2>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-8">
                {navLinks.map((link) => (
                    <Link
                        key={link.href}
                        href={link.href}
                        className="text-sm font-medium text-slate-600 hover:text-primary transition-colors relative after:content-[''] after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-primary after:transition-all after:duration-300 hover:after:w-full"
                    >
                        {link.label}
                    </Link>
                ))}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-4">
                <Link
                    href="/home"
                    className="hidden sm:block text-sm font-medium text-slate-900 hover:text-primary transition-colors"
                >
                    Login
                </Link>
                <Link
                    href="/home"
                    className="bg-primary hover:bg-primary/90 text-white text-sm font-bold py-2.5 px-5 rounded-lg transition-all shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-0.5 flex items-center gap-2"
                >
                    <span>Get Started</span>
                    <span className="material-symbols-outlined text-[16px]">
                        arrow_forward
                    </span>
                </Link>

                {/* Mobile Hamburger */}
                <button
                    className="md:hidden flex flex-col gap-1.5 p-2"
                    onClick={() => setMobileOpen(!mobileOpen)}
                    aria-label="Toggle navigation"
                >
                    <span
                        className={`block w-6 h-0.5 bg-slate-900 transition-transform duration-300 ${mobileOpen ? "rotate-45 translate-y-2" : ""}`}
                    />
                    <span
                        className={`block w-6 h-0.5 bg-slate-900 transition-opacity duration-300 ${mobileOpen ? "opacity-0" : ""}`}
                    />
                    <span
                        className={`block w-6 h-0.5 bg-slate-900 transition-transform duration-300 ${mobileOpen ? "-rotate-45 -translate-y-2" : ""}`}
                    />
                </button>
            </div>

            {/* Mobile Menu */}
            {mobileOpen && (
                <div className="absolute top-full left-0 w-full bg-white/95 backdrop-blur-xl border-b border-slate-100 shadow-lg md:hidden z-50 animate-fade-in">
                    <nav className="flex flex-col px-6 py-4 gap-1">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="text-base font-medium text-slate-700 hover:text-primary py-3 px-4 rounded-lg hover:bg-primary/5 transition-all"
                                onClick={() => setMobileOpen(false)}
                            >
                                {link.label}
                            </Link>
                        ))}
                        <Link
                            href="/home"
                            className="text-base font-medium text-slate-700 hover:text-primary py-3 px-4 rounded-lg hover:bg-primary/5 transition-all"
                        >
                            Login
                        </Link>
                    </nav>
                </div>
            )}
        </header>
    );
}
