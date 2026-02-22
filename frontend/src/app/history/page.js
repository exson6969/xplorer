"use client";

import { useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { MapPin, Calendar, CheckCircle, MessageSquare, Loader2, ChevronRight } from "lucide-react";
import useChatStore from "../../store/useChatStore";
import Link from "next/link";

export default function HistoryPage() {
    const { sessions, fetchSessions, fetchMoreSessions, hasMoreSessions, isLoading } = useChatStore();

    useEffect(() => {
        fetchSessions(10); // Initial fetch
    }, []);

    const handleLoadMore = () => {
        fetchMoreSessions(10);
    };

    return (
        <div className="min-h-screen flex">
            <Sidebar />

            <main className="flex-1 ml-64 p-8">
                <div className="max-w-4xl mx-auto">
                    <div className="mb-10">
                        <h1 className="text-3xl font-bold mb-2">Travel History</h1>
                        <p className="text-zinc-600 dark:text-zinc-400">Look back at your past adventures and memories.</p>
                    </div>

                    <div className="space-y-6">
                        {sessions.length === 0 && !isLoading ? (
                            <div className="text-center py-20 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800">
                                <div className="w-16 h-16 bg-zinc-50 dark:bg-zinc-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <MessageSquare className="w-8 h-8 text-zinc-400" />
                                </div>
                                <h3 className="text-xl font-bold mb-2">No history found</h3>
                                <p className="text-zinc-500 mb-8 max-w-sm mx-auto">Start a consultation with our AI to begin your travel journey.</p>
                                <Link href="/chat" className="text-indigo-600 font-bold hover:underline">
                                    Start chatting now →
                                </Link>
                            </div>
                        ) : (
                            <>
                                {sessions.map((session) => (
                                    <Link 
                                        key={session.convo_id} 
                                        href={`/chat?id=${session.convo_id}`}
                                        className="block group"
                                    >
                                        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 flex flex-col sm:flex-row gap-6 items-start sm:items-center shadow-sm hover:shadow-md transition-all group-hover:border-indigo-300 dark:group-hover:border-indigo-500/50">
                                            <div className="flex-1 w-full">
                                                <div className="flex items-start justify-between mb-2">
                                                    <h3 className="text-xl font-bold group-hover:text-indigo-600 transition-colors truncate pr-4">
                                                        {session.conversation_title}
                                                    </h3>
                                                    <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0">
                                                        <CheckCircle className="w-3.5 h-3.5" />
                                                        {session.has_itinerary ? "Itinerary Created" : "Consultation"}
                                                    </div>
                                                </div>

                                                <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-600 dark:text-zinc-400 mb-4">
                                                    <span className="flex items-center gap-1.5">
                                                        <Calendar className="w-4 h-4" /> 
                                                        {new Date(session.updated_at).toLocaleDateString(undefined, { 
                                                            year: 'numeric', 
                                                            month: 'short', 
                                                            day: 'numeric' 
                                                        })}
                                                    </span>
                                                    <span className="flex items-center gap-1.5">
                                                        <MessageSquare className="w-4 h-4" /> 
                                                        {session.message_count} messages
                                                    </span>
                                                    <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> Chennai</span>
                                                </div>

                                                <div className="flex items-center justify-between">
                                                    <div className="text-xs text-zinc-500">
                                                        Session ID: <span className="font-mono">{session.convo_id.slice(0, 8)}...</span>
                                                    </div>
                                                    <div className="text-indigo-600 dark:text-indigo-400 font-bold text-sm flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        Continue Chat <ChevronRight className="w-4 h-4" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ))}

                                {hasMoreSessions && (
                                    <div className="flex justify-center pt-6">
                                        <button 
                                            onClick={handleLoadMore}
                                            disabled={isLoading}
                                            className="px-8 py-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 font-bold transition-colors disabled:opacity-50 flex items-center gap-2"
                                        >
                                            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                                            Load More History
                                        </button>
                                    </div>
                                )}
                            </>
                        )}

                        {isLoading && sessions.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-20">
                                <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mb-4" />
                                <p className="text-zinc-500">Loading your history...</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
