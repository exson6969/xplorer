"use client";

import Sidebar from "../../components/Sidebar";
import Image from "next/image";
import { Send, MapPin, Calendar, Clock, Navigation } from "lucide-react";

export default function TripsPage() {
    return (
        <div className="h-screen bg-zinc-50 dark:bg-zinc-950 flex overflow-hidden">
            <Sidebar />

            <main className="flex-1 ml-64 flex bg-white dark:bg-zinc-950">

                {/* Left Panel: Chat Interface (approx 60%) */}
                <div className="w-[60%] flex flex-col border-r border-zinc-200 dark:border-zinc-800">

                    {/* Chat Header */}
                    <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center bg-white/50 dark:bg-zinc-950/50 backdrop-blur-md z-10">
                        <div>
                            <h2 className="font-bold text-lg text-zinc-900 dark:text-zinc-50">Chennai Heritage Tour & Food</h2>
                            <p className="text-sm text-zinc-500">Draft Itinerary &bull; AI Assistant</p>
                        </div>
                        <button className="text-sm text-indigo-600 dark:text-indigo-400 font-medium hover:underline bg-indigo-50 dark:bg-indigo-500/10 px-3 py-1.5 rounded-lg">
                            Save Draft
                        </button>
                    </div>

                    {/* Chat Messages Area */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-zinc-50/50 dark:bg-zinc-900/10">
                        {/* User Message */}
                        <div className="flex flex-col items-end">
                            <div className="bg-indigo-600 text-white p-4 rounded-2xl rounded-tr-sm max-w-[80%] shadow-sm">
                                <p>I'd like to plan a 2-day trip to Chennai focusing on history and traditional food. We prefer walking and taking it slow.</p>
                            </div>
                        </div>

                        {/* AI Assistant Message */}
                        <div className="flex flex-col items-start">
                            <div className="flex items-center gap-2 mb-1 pl-1">
                                <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs">AI</div>
                                <span className="text-xs text-zinc-500 font-medium">Explorer Agent</span>
                            </div>
                            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 p-4 rounded-2xl rounded-tl-sm max-w-[85%] shadow-sm space-y-3">
                                <p>That sounds like a wonderful plan! For a historical walking tour mixed with great traditional food, the <strong>Mylapore</strong> and <strong>George Town</strong> neighborhoods are perfect.</p>
                                <p>I've drafted a relaxed 2-day itinerary for you (visible on the right). It starts with a morning visit to Kapaleeshwarar Temple followed by authentic filter coffee.</p>
                                <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-3 rounded-xl mt-3">
                                    <p className="text-sm font-medium mb-2">Question for you:</p>
                                    <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-3">On Day 2, would you prefer exploring the coastal Fort St. George or going museum-hopping in Egmore?</p>
                                    <div className="flex gap-2">
                                        <button className="flex-1 border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 py-2 rounded-lg text-sm font-medium transition-colors">Fort St. George</button>
                                        <button className="flex-1 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 py-2 rounded-lg text-sm font-medium transition-colors">Egmore Museums</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Chat Input Bar */}
                    <div className="p-4 bg-white dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800">
                        <div className="relative flex items-center bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-2 shadow-sm focus-within:ring-2 focus-within:ring-indigo-500/50">
                            <input
                                type="text"
                                placeholder="Reply to the assistant..."
                                className="flex-1 bg-transparent px-3 py-2 outline-none text-zinc-800 dark:text-zinc-200"
                            />
                            <button className="p-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-transform hover:scale-105">
                                <Send className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Panel: Itinerary Timeline (approx 40%) */}
                <div className="w-[40%] bg-zinc-50 dark:bg-zinc-900 flex flex-col h-full">
                    {/* Day Selector Tabs */}
                    <div className="flex border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                        <button className="flex-1 py-4 text-center border-b-2 border-indigo-500 text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-50/50 dark:bg-indigo-500/5 transition-colors">
                            Day 1<br /><span className="text-xs font-normal text-zinc-500">Mylapore</span>
                        </button>
                        <button className="flex-1 py-4 text-center border-b-2 border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300 font-medium hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors">
                            Day 2<br /><span className="text-xs font-normal text-zinc-500">George Town</span>
                        </button>
                    </div>

                    {/* Timeline View */}
                    <div className="flex-1 overflow-y-auto p-6">
                        <div className="relative before:absolute before:inset-0 before:ml-3 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-zinc-200 dark:before:bg-zinc-800 space-y-8">

                            {/* Timeline Item 1 */}
                            <div className="relative flex items-start gap-4 right-timeline">
                                <div className="flex items-center justify-center w-6 h-6 rounded-full border-4 border-zinc-50 dark:border-zinc-900 bg-indigo-500 text-white shrink-0 z-10 mt-1 md:order-1 md:ml-[-12px] md:mr-[-12px]"></div>
                                <div className="w-[calc(100%-2rem)] md:w-[calc(100%-1rem)] bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm relative group hover:shadow-md transition-shadow">
                                    <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 mb-2">
                                        <Clock className="w-3.5 h-3.5" /> 08:30 AM (1.5 hrs)
                                    </div>
                                    <h4 className="font-bold text-lg mb-1">Kapaleeshwarar Temple</h4>
                                    <p className="text-sm text-zinc-500 leading-relaxed mb-3">Early morning darshan and exploring the 7th-century Dravidian architecture.</p>
                                    <div className="bg-zinc-50 dark:bg-zinc-900 rounded-lg p-2 flex gap-3 text-xs font-medium text-zinc-600 dark:text-zinc-400 border border-zinc-100 dark:border-zinc-800">
                                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-emerald-500" /> Walk: 0m</span>
                                    </div>
                                </div>
                            </div>

                            {/* Timeline Item 2 */}
                            <div className="relative flex items-start gap-4 right-timeline">
                                <div className="flex items-center justify-center w-6 h-6 rounded-full border-4 border-zinc-50 dark:border-zinc-900 bg-amber-500 text-white shrink-0 z-10 mt-1 md:order-1 md:ml-[-12px] md:mr-[-12px]"></div>
                                <div className="w-[calc(100%-2rem)] md:w-[calc(100%-1rem)] bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm relative group hover:shadow-md transition-shadow">
                                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-500 mb-2">
                                        <Clock className="w-3.5 h-3.5" /> 10:15 AM (45 mins)
                                    </div>
                                    <h4 className="font-bold text-lg mb-1">Mami Tiffen Stall</h4>
                                    <p className="text-sm text-zinc-500 leading-relaxed mb-3">Authentic degree filter coffee and a quick bite of idli or vada.</p>
                                    <div className="bg-zinc-50 dark:bg-zinc-900 rounded-lg p-2 flex gap-3 text-xs font-medium text-zinc-600 dark:text-zinc-400 border border-zinc-100 dark:border-zinc-800">
                                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-emerald-500" /> Walk: 5 mins</span>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* Action Footer */}
                    <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                        <button className="w-full bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-zinc-900 font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-md">
                            <Navigation className="w-4 h-4" /> Finalize Day 1
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}
