"use client";

import Sidebar from "../../components/Sidebar";
import Image from "next/image";
import { MapPin, Calendar, CheckCircle } from "lucide-react";

export default function HistoryPage() {
    const pastTrips = [
        {
            title: "Pondy Bazaar Shopping Spree",
            date: "Oct 15, 2025",
            image: "https://images.unsplash.com/photo-1596440409224-b1b01df222d4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
            rating: 5,
            note: "Amazing street food near the textile shops."
        },
        {
            title: "East Coast Road Drive",
            date: "Sep 02, 2025",
            image: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
            rating: 4,
            note: "Started late, missed the sunrise but great cafes."
        }
    ];

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex">
            <Sidebar />

            <main className="flex-1 ml-64 p-8">
                <div className="max-w-4xl mx-auto">
                    <div className="mb-10">
                        <h1 className="text-3xl font-bold mb-2">Travel History</h1>
                        <p className="text-zinc-600 dark:text-zinc-400">Look back at your past adventures and memories.</p>
                    </div>

                    <div className="space-y-6">
                        {pastTrips.map((trip, i) => (
                            <div key={i} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 flex flex-col sm:flex-row gap-6 items-start sm:items-center shadow-sm">
                                <div className="relative w-full sm:w-48 h-32 rounded-xl overflow-hidden shrink-0">
                                    <Image src={trip.image} alt={trip.title} fill className="object-cover" />
                                </div>

                                <div className="flex-1">
                                    <div className="flex items-start justify-between mb-2">
                                        <h3 className="text-xl font-bold">{trip.title}</h3>
                                        <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-1 rounded-full text-xs font-semibold">
                                            <CheckCircle className="w-3.5 h-3.5" />
                                            Completed
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-600 dark:text-zinc-400 mb-4">
                                        <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> {trip.date}</span>
                                        <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> Chennai</span>
                                    </div>

                                    <div className="bg-zinc-50 dark:bg-zinc-950 px-4 py-3 rounded-xl border border-zinc-100 dark:border-zinc-800 text-sm text-zinc-700 dark:text-zinc-300 italic">
                                        "{trip.note}"
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}
