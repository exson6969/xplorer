"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Sidebar from "../components/Sidebar";
import { Copy, Navigation, Plus, MoreHorizontal, MapPin, Loader2, Hotel, Car, CheckCircle2, Calendar } from "lucide-react";
import useChatStore from "../../store/useChatStore";

export default function TripsPage() {
    const { sessions, fetchSessions, fetchMoreSessions, hasMoreSessions, isLoading, bookings, fetchBookings } = useChatStore();
    const [activeTab, setActiveTab] = useState("trips");

    useEffect(() => {
        fetchSessions(10);
        fetchBookings();
    }, []);

    const handleLoadMore = () => {
        fetchMoreSessions(10);
    };

    // Filter sessions that have an itinerary
    const trips = sessions.filter(s => s.has_itinerary);

    return (
        <div className="min-h-screen flex">
            <Sidebar />

            <main className="flex-1 ml-64 p-8">
                <div className="max-w-6xl mx-auto">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-3xl font-bold mb-2">Travel Planner</h1>
                            <p className="text-zinc-600 dark:text-zinc-400">Manage your itineraries and confirmed bookings.</p>
                        </div>
                        <Link 
                            href="/chat"
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-full font-medium inline-flex items-center gap-2 transition-colors"
                        >
                            <Plus className="w-5 h-5" />
                            New Trip
                        </Link>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-4 mb-8 border-b border-zinc-200 dark:border-zinc-800">
                        <button 
                            onClick={() => setActiveTab("trips")}
                            className={`pb-4 px-2 text-sm font-bold transition-all relative ${activeTab === "trips" ? "text-indigo-600" : "text-zinc-400 hover:text-zinc-600"}`}
                        >
                            My Planned Trips ({trips.length})
                            {activeTab === "trips" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full" />}
                        </button>
                        <button 
                            onClick={() => setActiveTab("bookings")}
                            className={`pb-4 px-2 text-sm font-bold transition-all relative ${activeTab === "bookings" ? "text-indigo-600" : "text-zinc-400 hover:text-zinc-600"}`}
                        >
                            Confirmed Bookings ({bookings.hotels.length + bookings.transport.length})
                            {activeTab === "bookings" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full" />}
                        </button>
                    </div>

                    {activeTab === "trips" ? (
                        <>
                            {isLoading && sessions.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20">
                                    <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mb-4" />
                                    <p className="text-zinc-500">Loading your trips...</p>
                                </div>
                            ) : trips.length === 0 ? (
                                <div className="text-center py-20 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                                    <div className="w-16 h-16 bg-zinc-50 dark:bg-zinc-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                        <MapPin className="w-8 h-8 text-zinc-400" />
                                    </div>
                                    <h3 className="text-xl font-bold mb-2">No itineraries found</h3>
                                    <p className="text-zinc-500 mb-8 max-w-sm mx-auto">Start a consultation with our AI to generate a personalized travel plan for Chennai.</p>
                                    <Link 
                                        href="/chat"
                                        className="text-indigo-600 font-bold hover:underline"
                                    >
                                        Start planning now →
                                    </Link>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {trips.map((trip) => (
                                        <div key={trip.convo_id} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm group hover:shadow-md transition-all">
                                            <div className="p-6">
                                                <div className="flex items-start justify-between mb-4">
                                                    <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                                                        <MapPin className="w-6 h-6" />
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <span className="bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20">
                                                            Itinerary Ready
                                                        </span>
                                                    </div>
                                                </div>
                                                
                                                <h3 className="text-xl font-bold mb-2 truncate">{trip.conversation_title}</h3>
                                                <div className="flex items-center gap-4 text-sm text-zinc-600 dark:text-zinc-400 mb-6">
                                                    <span className="flex items-center gap-1">
                                                        <Navigation className="w-4 h-4" /> 
                                                        {new Date(trip.created_at).toLocaleDateString()}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Copy className="w-4 h-4" /> 
                                                        {trip.message_count} messages
                                                    </span>
                                                </div>
                                                <Link 
                                                    href={`/chat?id=${trip.convo_id}`}
                                                    className="w-full bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-medium py-2.5 rounded-xl transition-colors flex items-center justify-center"
                                                >
                                                    View Itinerary
                                                </Link>
                                            </div>
                                        </div>
                                    ))}

                                    {hasMoreSessions && (
                                        <div className="col-span-full flex justify-center pt-6">
                                            <button 
                                                onClick={handleLoadMore}
                                                disabled={isLoading}
                                                className="px-8 py-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 font-bold transition-colors disabled:opacity-50 flex items-center gap-2"
                                            >
                                                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                                                Load More Trips
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    ) : (
                        /* Bookings Tab */
                        <div className="space-y-8">
                            {/* Hotels Section */}
                            <div>
                                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                                    <Hotel className="w-5 h-5 text-amber-500" />
                                    Booked Stays
                                </h2>
                                {bookings.hotels.length === 0 ? (
                                    <div className="p-10 text-center bg-white dark:bg-zinc-900 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl">
                                        <p className="text-zinc-500">No hotel bookings yet.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {bookings.hotels.map((b, i) => (
                                            <div key={i} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-2xl shadow-sm flex items-start gap-4">
                                                <div className="w-12 h-12 bg-amber-50 dark:bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
                                                    <Hotel className="w-6 h-6" />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <h4 className="font-bold text-zinc-900 dark:text-zinc-50">{b.name}</h4>
                                                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full uppercase">Confirmed</span>
                                                    </div>
                                                    <p className="text-xs text-zinc-500 flex items-center gap-1 mb-2">
                                                        <MapPin className="w-3 h-3" /> {b.location}
                                                    </p>
                                                    <div className="flex items-center justify-between pt-3 border-t border-zinc-100 dark:border-zinc-800">
                                                        <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">{b.room_type}</span>
                                                        <span className="text-sm font-bold text-emerald-600">₹{b.price}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Transport Section */}
                            <div>
                                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                                    <Car className="w-5 h-5 text-indigo-500" />
                                    Booked Transport
                                </h2>
                                {bookings.transport.length === 0 ? (
                                    <div className="p-10 text-center bg-white dark:bg-zinc-900 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl">
                                        <p className="text-zinc-500">No transport bookings yet.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {bookings.transport.map((b, i) => (
                                            <div key={i} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-2xl shadow-sm flex items-start gap-4">
                                                <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                                                    <Car className="w-6 h-6" />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <h4 className="font-bold text-zinc-900 dark:text-zinc-50">{b.model || b.type}</h4>
                                                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full uppercase">Confirmed</span>
                                                    </div>
                                                    <p className="text-xs text-zinc-500 flex items-center gap-1 mb-2">
                                                        <CheckCircle2 className="w-3 h-3" /> {b.agency}
                                                    </p>
                                                    <div className="flex items-center justify-between pt-3 border-t border-zinc-100 dark:border-zinc-800">
                                                        <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">{b.type}</span>
                                                        <span className="text-sm font-bold text-emerald-600">₹{b.price}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
