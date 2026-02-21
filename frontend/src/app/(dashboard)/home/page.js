"use client";

import Sidebar from "../../components/Sidebar";
import Image from "next/image";
import { Send, Sparkles, Map, Coffee, Camera, Compass } from "lucide-react";

export default function HomeDashboard() {
    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex">
            <Sidebar />

            <main className="flex-1 ml-64 p-8 pt-12 flex flex-col items-center">
                <div className="w-full max-w-4xl flex flex-col items-center mt-10">

                    <div className="text-center mb-10">
                        <h1 className="text-4xl font-bold mb-3 tracking-tight text-zinc-900 dark:text-zinc-50">Where to next in Chennai?</h1>
                        <p className="text-zinc-500 dark:text-zinc-400 text-lg">Ask our AI travel assistant to build your perfect local experience.</p>
                    </div>

                    {/* Prominent Chat Input Bar */}
                    <div className="w-full relative shadow-xl shadow-zinc-200/50 dark:shadow-none rounded-2xl overflow-hidden mb-6 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent transition-all">
                        <textarea
                            rows={3}
                            placeholder="E.g., I have 4 hours this afternoon. I want to try authentic filter coffee, visit a historical temple in Mylapore, and do some light shopping. I prefer walking..."
                            className="w-full resize-none p-5 pb-16 bg-transparent outline-none text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-400"
                        />
                        <div className="absolute bottom-3 right-3 flex items-center gap-3">
                            <button className="bg-indigo-600 hover:bg-indigo-700 text-white p-2.5 rounded-xl transition-transform hover:scale-105 active:scale-95 shadow-md">
                                <Send className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="absolute bottom-4 left-4 flex items-center gap-2 text-zinc-400 border border-zinc-200 dark:border-zinc-700 rounded-full px-3 py-1 text-xs">
                            <Sparkles className="w-3 h-3 text-indigo-500" /> AI powered
                        </div>
                    </div>

                    {/* Quick filter chips */}
                    <div className="flex flex-wrap items-center justify-center gap-2 mb-16 w-full">
                        <button className="px-4 py-2 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 text-sm font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors flex items-center gap-2">
                            <Compass className="w-4 h-4 text-emerald-500" /> Weekend Escapes
                        </button>
                        <button className="px-4 py-2 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 text-sm font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors flex items-center gap-2">
                            <Coffee className="w-4 h-4 text-amber-500" /> Culinary Trails
                        </button>
                        <button className="px-4 py-2 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 text-sm font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors flex items-center gap-2">
                            <Map className="w-4 h-4 text-indigo-500" /> Heritage Walks
                        </button>
                        <button className="px-4 py-2 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 text-sm font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors flex items-center gap-2">
                            <Camera className="w-4 h-4 text-pink-500" /> Photowalks
                        </button>
                    </div>

                    {/* Grid of suggested experiences */}
                    <div className="w-full">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-zinc-900 dark:text-锌-50">Popular in Chennai Right Now</h2>
                            <button className="text-sm text-indigo-600 dark:text-indigo-400 font-medium hover:underline">See all curated</button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[
                                { title: "Mylapore Mornings", tags: ["Heritage", "Walking"], img: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?ixlib=rb-4.0.3&w=400&h=300&fit=crop" },
                                { title: "Sowcarpet Street Food", tags: ["Culinary", "Evening"], img: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?ixlib=rb-4.0.3&w=400&h=300&fit=crop" },
                                { title: "ECR Coastal Drive", tags: ["Scenic", "Roadtrip"], img: "https://images.unsplash.com/photo-1569300627257-8ba34731ed59?ixlib=rb-4.0.3&w=400&h=300&fit=crop" }
                            ].map((item, i) => (
                                <div key={i} className="group bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-lg transition-all cursor-pointer">
                                    <div className="relative h-40 w-full overflow-hidden">
                                        <Image src={item.img} alt={item.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-80" />
                                        <h3 className="absolute bottom-3 left-4 text-white font-bold text-lg">{item.title}</h3>
                                    </div>
                                    <div className="p-4 flex gap-2">
                                        {item.tags.map(tag => (
                                            <span key={tag} className="text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 px-2 py-1 rounded">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}
