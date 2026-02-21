"use client";

import Sidebar from "../../components/Sidebar";
import { Sparkles, ArrowRight, Calendar, MapPin } from "lucide-react";

export default function HomeDashboard() {
    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex">
            <Sidebar />

            <main className="flex-1 ml-64 p-8">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-3xl font-bold mb-2">Welcome back! 👋</h1>
                    <p className="text-zinc-600 dark:text-zinc-400 mb-8">Ready to explore Chennai today?</p>

                    {/* Quick Actions */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-xl shadow-indigo-500/20 relative overflow-hidden">
                            <div className="relative z-10">
                                <Sparkles className="w-8 h-8 mb-4 text-white/80" />
                                <h3 className="text-xl font-bold mb-2">Plan a New Trip</h3>
                                <p className="text-white/80 mb-6 max-w-sm">Let our AI craft the perfect itinerary tailored to your schedule and interests.</p>
                                <button className="bg-white text-indigo-600 px-6 py-2.5 rounded-full font-medium inline-flex items-center gap-2 hover:bg-zinc-50 transition-colors">
                                    Start Planning
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
                        </div>

                        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm flex flex-col">
                            <div className="mb-auto">
                                <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-800 rounded-xl flex items-center justify-center mb-4">
                                    <MapPin className="w-6 h-6 text-zinc-900 dark:text-white" />
                                </div>
                                <h3 className="text-xl font-bold mb-2">Explore Nearby</h3>
                                <p className="text-zinc-600 dark:text-zinc-400">Find hidden gems, cafes, and historic spots right around your current location.</p>
                            </div>
                            <button className="mt-6 w-full py-2.5 rounded-xl font-medium border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                                View Map
                            </button>
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <h2 className="text-2xl font-bold mb-6">Recent Plans</h2>
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
                        <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
                            <div className="p-6 flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-zinc-950/50 transition-colors cursor-pointer">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                                        <Calendar className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-zinc-900 dark:text-zinc-50">Temple Trail & Local Silk</h4>
                                        <p className="text-sm text-zinc-500 dark:text-zinc-400">Mylapore • 2 Days • Draft</p>
                                    </div>
                                </div>
                                <button className="text-indigo-600 dark:text-indigo-400 font-medium text-sm hover:underline">
                                    Continue
                                </button>
                            </div>
                            <div className="p-6 text-center text-zinc-500 dark:text-zinc-400 text-sm">
                                No more recent plans to show. Start a new trip above!
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
