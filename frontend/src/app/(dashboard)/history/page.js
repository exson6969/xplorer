"use client";

import Sidebar from "../../components/Sidebar";
import Image from "next/image";
import { Search, MapPin, Calendar, Star, Filter, ExternalLink, Image as ImageIcon } from "lucide-react";

export default function HistoryPage() {
    const historyData = [
        {
            month: "October 2025",
            trips: [
                {
                    title: "Pondy Bazaar Shopping Spree",
                    date: "Oct 15, 2025",
                    image: "https://images.unsplash.com/photo-1596440409224-b1b01df222d4?ixlib=rb-4.0.3&w=800&h=600&fit=crop",
                    rating: 5,
                    note: "Amazing street food near the textile shops.",
                    photos: 24,
                    locations: ["Pondy Bazaar", "T Nagar", "Saravana Bhavan"]
                }
            ]
        },
        {
            month: "September 2025",
            trips: [
                {
                    title: "East Coast Road Sunrise Drive",
                    date: "Sep 02, 2025",
                    image: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?ixlib=rb-4.0.3&w=800&h=600&fit=crop",
                    rating: 4,
                    note: "Started late, but cafes along the way made up for it.",
                    photos: 12,
                    locations: ["ECR Toll", "Mahabalipuram", "Kovalam"]
                },
                {
                    title: "DakshinaChitra Heritage Tour",
                    date: "Sep 18, 2025",
                    image: "https://images.unsplash.com/photo-1514222365289-40eafe525e98?ixlib=rb-4.0.3&w=800&h=600&fit=crop",
                    rating: 5,
                    note: "Incredible South Indian architecture. Don't skip the craft demo.",
                    photos: 45,
                    locations: ["Muttukadu", "DakshinaChitra"]
                }
            ]
        }
    ];

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex transition-colors">
            <Sidebar />

            <main className="flex-1 ml-64 p-8 pt-10">
                <div className="max-w-4xl mx-auto">

                    <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <h1 className="text-3xl font-bold mb-2 tracking-tight">Travel History</h1>
                            <p className="text-zinc-500 dark:text-zinc-400">Review your past itineraries, memories, and saved routes.</p>
                        </div>

                        <div className="flex items-center gap-3 w-full md:w-auto">
                            <div className="relative flex-1 md:w-64">
                                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                                <input
                                    type="text"
                                    placeholder="Search past trips..."
                                    className="w-full pl-9 pr-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm shadow-sm"
                                />
                            </div>
                            <button className="p-2 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 transition-colors shadow-sm">
                                <Filter className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    <div className="space-y-12">
                        {historyData.map((group, i) => (
                            <div key={i} className="space-y-6">

                                {/* Date-based section header */}
                                <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-4">
                                    {group.month}
                                    <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800"></div>
                                </h2>

                                <div className="space-y-4">
                                    {group.trips.map((trip, j) => (
                                        <div key={j} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col sm:flex-row gap-6 group">

                                            <div className="relative w-full sm:w-48 h-40 sm:h-auto rounded-xl overflow-hidden shrink-0">
                                                <Image src={trip.image} alt={trip.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                                                <div className="absolute top-2 right-2 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md px-2 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1 shadow-sm">
                                                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" /> {trip.rating}.0
                                                </div>
                                            </div>

                                            <div className="flex-1 flex flex-col justify-between py-1">
                                                <div>
                                                    <p className="text-xs font-semibold tracking-wider text-indigo-600 dark:text-indigo-400 uppercase mb-1 flex items-center gap-1">
                                                        <Calendar className="w-3.5 h-3.5" /> {trip.date}
                                                    </p>
                                                    <h3 className="text-xl font-bold mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{trip.title}</h3>

                                                    <p className="text-sm text-zinc-600 dark:text-zinc-400 italic mb-3">"{trip.note}"</p>

                                                    <div className="flex flex-wrap gap-1.5 mb-4">
                                                        {trip.locations.map((loc, idx) => (
                                                            <span key={idx} className="inline-flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/50 px-2 py-0.5 rounded text-xs text-zinc-600 dark:text-zinc-400">
                                                                <MapPin className="w-3 h-3" /> {loc}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-4 pt-4 border-t border-zinc-100 dark:border-zinc-800/80">
                                                    <button className="flex items-center gap-1.5 text-sm font-medium text-zinc-500 hover:text-indigo-600 transition-colors">
                                                        <ImageIcon className="w-4 h-4" /> {trip.photos} Gallery
                                                    </button>
                                                    <div className="ml-auto flex gap-2">
                                                        <button className="text-sm font-semibold text-zinc-600 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 px-4 py-2 rounded-lg transition-colors">
                                                            View Details
                                                        </button>
                                                        <button className="text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
                                                            Repeat Trip <ExternalLink className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                </div>
            </main >
        </div >
    );
}
