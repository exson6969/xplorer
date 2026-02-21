"use client";

import Sidebar from "../../components/Sidebar";
import Image from "next/image";
import { Copy, Navigation, Plus, MoreHorizontal } from "lucide-react";

export default function TripsPage() {
    const trips = [
        {
            title: "Cultural Heritage Tour",
            duration: "3 Days",
            status: "Active",
            image: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
            locations: 12
        },
        {
            title: "Marina Beach & Beyond",
            duration: "1 Day",
            status: "Draft",
            image: "https://images.unsplash.com/photo-1610444583163-9af962458925?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
            locations: 5
        }
    ];

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex">
            <Sidebar />

            <main className="flex-1 ml-64 p-8">
                <div className="max-w-6xl mx-auto">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-3xl font-bold mb-2">My Trips</h1>
                            <p className="text-zinc-600 dark:text-zinc-400">Manage your upcoming and planned itineraries.</p>
                        </div>
                        <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-full font-medium inline-flex items-center gap-2 transition-colors">
                            <Plus className="w-5 h-5" />
                            New Trip
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {trips.map((trip, i) => (
                            <div key={i} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm group hover:shadow-md transition-all">
                                <div className="relative h-48 w-full">
                                    <Image
                                        src={trip.image}
                                        alt={trip.title}
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                    <div className="absolute top-4 left-4">
                                        <span className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold shadow-sm">
                                            {trip.status}
                                        </span>
                                    </div>
                                    <div className="absolute top-4 right-4">
                                        <button className="w-8 h-8 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md rounded-full flex items-center justify-center shadow-sm text-zinc-600 hover:text-indigo-600 transition-colors">
                                            <MoreHorizontal className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                                <div className="p-6">
                                    <h3 className="text-xl font-bold mb-2">{trip.title}</h3>
                                    <div className="flex items-center gap-4 text-sm text-zinc-600 dark:text-zinc-400 mb-6">
                                        <span className="flex items-center gap-1"><Navigation className="w-4 h-4" /> {trip.duration}</span>
                                        <span className="flex items-center gap-1"><Copy className="w-4 h-4" /> {trip.locations} spots</span>
                                    </div>
                                    <button className="w-full bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-medium py-2.5 rounded-xl transition-colors">
                                        View Itinerary
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}
