"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "../../context/AuthContext";
import AuthOverlay from "./AuthOverlay";
import { Search, Compass, LogIn, LayoutDashboard } from "lucide-react";

export default function Navbar() {
    const { user } = useAuth();
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

    return (
        <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-zinc-200 dark:bg-zinc-950/80 dark:border-zinc-800 transition-colors">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-indigo-800 text-white flex items-center justify-center font-bold text-xl">
                            E
                        </div>
                        <span className="font-bold text-xl tracking-tight text-zinc-900 dark:text-zinc-50">
                            EXPLORER
                        </span>
                    </Link>

                    {/* Center Links */}
                    <div className="hidden md:flex space-x-8">
                        <Link href="/features" className="text-zinc-600 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400 font-medium transition-colors">
                            Features
                        </Link>
                        <Link href="/stories" className="text-zinc-600 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400 font-medium transition-colors">
                            Stories
                        </Link>
                        <Link href="/about" className="text-zinc-600 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400 font-medium transition-colors">
                            About
                        </Link>
                    </div>

                    {/* Right Actions */}
                    <div className="flex items-center gap-4">
                        {user ? (
                            <Link href="/home" className="hidden sm:flex items-center gap-2 text-sm font-bold text-indigo-600 dark:text-indigo-400 transition-colors">
                                <LayoutDashboard className="w-4 h-4" />
                                Dashboard
                            </Link>
                        ) : (
                            <button
                                onClick={() => setIsAuthModalOpen(true)}
                                className="hidden sm:flex items-center gap-2 text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50 transition-colors"
                            >
                                <LogIn className="w-4 h-4" />
                                Sign In
                            </button>
                        )}

                        <Link
                            href={user ? "/chat" : "#"}
                            onClick={(e) => {
                                if (!user) {
                                    e.preventDefault();
                                    setIsAuthModalOpen(true);
                                }
                            }}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-full font-medium text-sm transition-all hover:shadow-lg hover:shadow-indigo-500/25 flex items-center gap-2"
                        >
                            <Compass className="w-4 h-4" />
                            {user ? "Start Planning" : "Start Exploring"}
                        </Link>
                    </div>
                </div>
            </div>

            <AuthOverlay
                isOpen={isAuthModalOpen}
                onClose={() => setIsAuthModalOpen(false)}
            />
        </nav>
    );
}
