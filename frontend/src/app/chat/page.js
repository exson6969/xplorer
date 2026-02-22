"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Sidebar from "../components/Sidebar";
import MessageBubble from "../components/MessageBubble";
import ItineraryPanel from "../components/ItineraryPanel";
import TripPlannerView from "../components/TripPlannerView";
import useChatStore from "../../store/useChatStore";
import { Send, Sparkles, Loader2, Plus } from "lucide-react";

export default function ChatPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const sessionId = searchParams.get("id");

    const {
        currentMessages,
        currentSessionId,
        currentItinerary,
        confirmedTrip,
        routeData,
        isLoading,
        sendMessage,
        setCurrentSession,
        confirmItinerary,
        clearConfirmedTrip,
        fetchSessions,
        sessions
    } = useChatStore();

    const [input, setInput] = useState("");
    const scrollRef = useRef(null);

    useEffect(() => {
        if (currentSessionId && !sessionId) {
            router.push(`/chat?id=${currentSessionId}`, { scroll: false });
        }
    }, [currentSessionId, sessionId, router]);

    useEffect(() => {
        fetchSessions();
        if (sessionId) {
            setCurrentSession(sessionId);
        } else {
            setCurrentSession(null);
        }
    }, [sessionId]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [currentMessages, isLoading]);

    const handleSend = async (e) => {
        if (e) e.preventDefault();
        if (!input.trim() || isLoading) return;

        const text = input;
        setInput("");
        try {
            await sendMessage(text);
        } catch (err) {
            console.error("Failed to send message:", err);
        }
    };

    const handleFormSubmit = async (formData) => {
        try {
            await sendMessage("Information updated.", formData);
        } catch (err) {
            console.error("Failed to submit form:", err);
        }
    };

    const handleConfirmItinerary = async (placeNames, hotelName) => {
        try {
            await confirmItinerary(placeNames, hotelName);
        } catch (err) {
            console.error("Failed to confirm itinerary:", err);
        }
    };

    // ─── CONFIRMED TRIP: SPLIT VIEW ───
    if (confirmedTrip && routeData) {
        return (
            <div className="min-h-screen  flex font-sans">
                <Sidebar />
                <main className="flex-1 ml-64 flex flex-col h-screen relative">
                    {/* Header */}
                    <header className="h-16  backdrop-blur-md flex items-center justify-between px-8 z-10 shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white">
                                <Sparkles className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="font-bold text-zinc-900 dark:text-zinc-50">
                                    {sessions.find(s => s.convo_id === currentSessionId)?.conversation_title || "Trip Planner"}
                                </h2>
                                <p className="text-[10px] text-emerald-600 dark:text-emerald-500 font-bold uppercase tracking-widest flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                    Route Optimized
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={clearConfirmedTrip}
                            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors px-4 py-2 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-500/10"
                        >
                            ← Back to Chat
                        </button>
                    </header>

                    {/* Split View */}
                    <div className="flex-1 overflow-hidden">
                        <TripPlannerView
                            routeData={routeData}
                            onBackToChat={clearConfirmedTrip}
                        />
                    </div>

                    {/* Chat input stays active */}
                    <div className="p-5 bg-white dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 shrink-0">
                        <form
                            onSubmit={handleSend}
                            className="max-w-4xl mx-auto relative group"
                        >
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Ask to modify your trip..."
                                className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl py-4 pl-6 pr-14 text-sm outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all shadow-sm group-hover:shadow-md"
                            />
                            <button
                                type="submit"
                                disabled={!input.trim() || isLoading}
                                className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 flex items-center justify-center hover:scale-105 transition-all disabled:opacity-50 disabled:scale-100"
                            >
                                <Send className="w-5 h-5" />
                            </button>
                        </form>
                    </div>
                </main>
            </div>
        );
    }

    // ─── NORMAL CHAT VIEW ───
    return (
        <div className="min-h-screen flex font-sans">
            <Sidebar />

            <main className="flex-1 ml-64 flex flex-col h-screen relative">
                {/* Chat Header */}
                <header className="h-16 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md flex items-center justify-between px-8 z-10">
                    <div className="flex items-center gap-3">
                        
                        <div>
                            <h2 className="font-bold text-zinc-900 dark:text-zinc-50">
                                {currentSessionId
                                    ? sessions.find(s => s.convo_id === currentSessionId)?.conversation_title || "Active Consultation"
                                    : "New Consultation"
                                }
                            </h2>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => {
                                setCurrentSession(null);
                                router.push('/chat');
                            }}
                            className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors text-zinc-500"
                            title="New Chat"
                        >
                            <Plus className="w-5 h-5" />
                        </button>
                    </div>
                </header>

                {/* Messages & Itinerary Layout */}
                <div className="flex-1 flex overflow-hidden">
                    {/* Chat Column (Messages + Input) */}
                    <div className="flex-1 flex flex-col min-w-0">
                        {/* Messages Area */}
                        <div
                            ref={scrollRef}
                            className="flex-1 overflow-y-auto p-8 space-y-8 scroll-smooth"
                        >
                            {currentMessages.length === 0 && !isLoading && (
                                <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto pt-20">
                                    <div className="w-20 h-20 rounded-3xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-6">
                                        <Sparkles className="w-10 h-10" />
                                    </div>
                                    <p className="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed">
                                        I'm your Xplorer AI. Mention your interests, travel dates, or specific spots you want to visit, and I'll craft the perfect itinerary.
                                    </p>
                                </div>
                            )}

                            {currentMessages.map((msg) => (
                                <MessageBubble
                                    key={msg.id}
                                    message={msg}
                                    onSubmitData={handleFormSubmit}
                                />
                            ))}

                            {isLoading && (
                                <div className="flex items-center gap-3 text-zinc-500 dark:text-zinc-400 text-xs font-medium pl-1">
                                    <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                                    AI is thinking...
                                </div>
                            )}
                        </div>

                        {/* Input Area */}
                        <div className="p-6 bg-white dark:bg-zinc-950 border-t border-zinc-100 dark:border-zinc-800">
                            <form
                                onSubmit={handleSend}
                                className="max-w-4xl mx-auto relative group"
                            >
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Message Xplorer AI..."
                                    className="w-full border border-zinc-200 dark:border-zinc-800 rounded-2xl py-4 pl-6 pr-14 text-sm outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all shadow-sm group-hover:shadow-md"
                                />
                                <button
                                    type="submit"
                                    disabled={!input.trim() || isLoading}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 flex items-center justify-center hover:scale-105 transition-all disabled:opacity-50 disabled:scale-100"
                                >
                                    <Send className="w-5 h-5" />
                                </button>
                            </form>
                            <p className="text-center mt-3 text-[10px] text-zinc-400 font-medium">
                                Xplorer AI can make mistakes. Verify important travel information.
                            </p>
                        </div>
                    </div>

                    {/* Itinerary Side Panel */}
                    <ItineraryPanel
                        itinerary={currentItinerary}
                        onConfirm={handleConfirmItinerary}
                    />
                </div>
            </main>
        </div>
    );
}
