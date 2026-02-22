"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import useChatStore from "../../store/useChatStore";
import { Home, Compass, Map, User, Settings, LogOut, Clock, MessageSquare, Trash2, ChevronRight } from "lucide-react";

export default function Sidebar() {
    const { logout } = useAuth();
    const pathname = usePathname();
    const { sessions, deleteSession, fetchSessions } = useChatStore();

    useEffect(() => {
        // Fetch sessions on mount if we don't have any
        if (sessions.length === 0) {
            fetchSessions(10);
        }
    }, []);

    const navItems = [
        { href: "/chat", label: "Plan Trip", icon: Compass },
        { href: "/trips", label: "My Trips", icon: Map },
        { href: "/history", label: "History", icon: Clock },
    ];

    return (
        <aside className="w-64 bg-white  h-screen fixed left-0 top-0 flex flex-col z-40">
            <div className="h-16 flex items-center px-6">
                <Link href="/" className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-indigo-800 text-white flex items-center justify-center font-bold text-xl">
                        X
                    </div>
                    <span className="font-bold text-xl tracking-tight text-zinc-900 dark:text-zinc-50">
                        XPLORER
                    </span>
                </Link>
            </div>

            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {navItems.map(item => {
                    const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors ${isActive
                                ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
                                : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900"
                                }`}
                        >
                            <item.icon className="w-5 h-5" />
                            {item.label}
                        </Link>
                    );
                })}

                {/* Recent Chat Sessions */}
                {sessions.length > 0 && (
                    <div className="mt-6 pt-4 ">
                        <div className="flex items-center justify-between px-3 mb-2">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Recent Chats</p>
                            <Link href="/history" className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-0.5 transition-colors">
                                See all <ChevronRight className="w-2.5 h-2.5" />
                            </Link>
                        </div>
                        {sessions.slice(0, 8).map(session => (
                            <div key={session.convo_id} className="group flex items-center gap-2">
                                <Link
                                    href={`/chat?id=${session.convo_id}`}
                                    className={`flex-1 flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-colors truncate ${pathname === "/chat" && new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '').get('id') === session.convo_id
                                        ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
                                        : "text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900"
                                        }`}
                                >
                                    <MessageSquare className="w-3.5 h-3.5 shrink-0" />
                                    <span className="truncate">{session.conversation_title}</span>
                                </Link>
                                <button
                                    onClick={() => deleteSession(session.convo_id)}
                                    className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-50 dark:hover:bg-red-500/10 text-zinc-400 hover:text-red-500 transition-all"
                                >
                                    <Trash2 className="w-3 h-3" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </nav>

            <div className="p-4  space-y-1">
                <button
                    onClick={() => logout()}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors mt-4"
                >
                    <LogOut className="w-5 h-5" />
                    Sign Out
                </button>
            </div>
        </aside>
    );
}

