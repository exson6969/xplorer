"use client";

import { useState } from "react";
import {
    MapPin, Clock, Sun, Sunset, Moon, Coffee, UtensilsCrossed,
    ChevronDown, ChevronUp, ExternalLink, Navigation, Star,
    CalendarDays, Sparkles, Building2, Camera, ShoppingBag, Landmark,
    Bus, Car, CheckCircle2
} from "lucide-react";
import useChatStore from "../../store/useChatStore";

// ─── HELPERS ───

function getTimeIcon(text) {
    const lower = text.toLowerCase();
    if (lower.includes("morning") || lower.includes("sunrise")) return <Sun className="w-4 h-4" />;
    if (lower.includes("lunch") || lower.includes("brunch")) return <UtensilsCrossed className="w-4 h-4" />;
    if (lower.includes("afternoon")) return <Coffee className="w-4 h-4" />;
    if (lower.includes("evening") || lower.includes("sunset")) return <Sunset className="w-4 h-4" />;
    if (lower.includes("night") || lower.includes("dinner")) return <Moon className="w-4 h-4" />;
    return <Clock className="w-4 h-4" />;
}

function getTimeColor(text) {
    const lower = text.toLowerCase();
    if (lower.includes("morning") || lower.includes("sunrise")) return "from-amber-500 to-orange-500";
    if (lower.includes("lunch") || lower.includes("brunch")) return "from-green-500 to-emerald-500";
    if (lower.includes("afternoon")) return "from-sky-500 to-blue-500";
    if (lower.includes("evening") || lower.includes("sunset")) return "from-purple-500 to-violet-500";
    if (lower.includes("night") || lower.includes("dinner")) return "from-indigo-500 to-blue-700";
    return "from-zinc-500 to-zinc-600";
}

function getTimeBg(text) {
    const lower = text.toLowerCase();
    if (lower.includes("morning") || lower.includes("sunrise")) return "bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20";
    if (lower.includes("lunch") || lower.includes("brunch")) return "bg-green-50 dark:bg-green-500/10 border-green-200 dark:border-green-500/20";
    if (lower.includes("afternoon")) return "bg-sky-50 dark:bg-sky-500/10 border-sky-200 dark:border-sky-500/20";
    if (lower.includes("evening") || lower.includes("sunset")) return "bg-purple-50 dark:bg-purple-500/10 border-purple-200 dark:border-purple-500/20";
    if (lower.includes("night") || lower.includes("dinner")) return "bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/20";
    return "bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700";
}

function getDayGradient(index) {
    const gradients = [
        "from-rose-500 via-pink-500 to-fuchsia-500",
        "from-blue-500 via-cyan-500 to-teal-500",
        "from-amber-500 via-orange-500 to-red-500",
        "from-emerald-500 via-green-500 to-lime-500",
        "from-violet-500 via-purple-500 to-indigo-500",
        "from-sky-500 via-blue-500 to-indigo-500",
        "from-pink-500 via-rose-500 to-red-500",
    ];
    return gradients[index % gradients.length];
}

function getDayEmoji(index) {
    const emojis = ["🌅", "🏖️", "🎉", "🏛️", "🌴", "🎭", "🌊"];
    return emojis[index % emojis.length];
}

function openInMaps(placeName) {
    const q = encodeURIComponent(placeName + ", Chennai, India");
    window.open(`https://www.google.com/maps/search/?api=1&query=${q}`, "_blank");
}

/** Extract a likely place name from an activity string */
function extractPlaceName(text) {
    // Try to find text after "Visit", "Explore", "at", "to" etc.
    const patterns = [
        /(?:visit|explore|head to|go to|stop at|at|reach|check out|see)\s+(?:the\s+)?(.+?)(?:\.|,|!|\band\b|$)/i,
    ];
    for (const p of patterns) {
        const m = text.match(p);
        if (m && m[1] && m[1].trim().length > 3) return m[1].trim();
    }
    // Fallback: if it's a short string, maybe it is just the name
    if (text.length < 40 && text.length > 3) return text.trim();
    return null;
}

/** Parse the itinerary object into a normalized array of days */
function parseItinerary(data) {
    if (!data) return [];

    // Already an array of days
    if (Array.isArray(data)) {
        return data.map((day, i) => ({
            dayNumber: day.day || day.day_number || i + 1,
            theme: day.theme || day.title || `Day ${i + 1}`,
            activities: Array.isArray(day.activities)
                ? day.activities.map(a => typeof a === "string" ? a : (a.description || a.activity || JSON.stringify(a)))
                : [],
            hotels: day.hotels || day.hotel || null,
            transport: day.transport || day.cab || null,
        }));
    }

    // Object with day_1, day_2, ... keys
    if (typeof data === "object") {
        const days = [];
        const sortedKeys = Object.keys(data).sort((a, b) => {
            const numA = parseInt(a.replace(/\D/g, "")) || 0;
            const numB = parseInt(b.replace(/\D/g, "")) || 0;
            return numA - numB;
        });
        sortedKeys.forEach((key, i) => {
            const day = data[key];
            if (typeof day === "object" && day !== null) {
                days.push({
                    dayNumber: parseInt(key.replace(/\D/g, "")) || i + 1,
                    theme: day.theme || day.title || `Day ${i + 1}`,
                    activities: Array.isArray(day.activities)
                        ? day.activities.map(a => typeof a === "string" ? a : (a.description || a.activity || JSON.stringify(a)))
                        : typeof day.activities === "string" ? [day.activities] : [],
                    hotels: day.hotels || day.hotel || null,
                    transport: day.transport || day.cab || null,
                });
            }
        });
        return days;
    }

    return [];
}


// ─── COMPONENTS ───

function ActivityCard({ activity, index }) {
    const placeName = extractPlaceName(activity);
    // Split "Morning: Visit..." format
    const colonIndex = activity.indexOf(":");
    let timeLabel = null;
    let description = activity;
    if (colonIndex > 0 && colonIndex < 20) {
        timeLabel = activity.substring(0, colonIndex).trim();
        description = activity.substring(colonIndex + 1).trim();
    }

    return (
        <div className={`relative flex gap-4 group`}>
            {/* Timeline line */}
            <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${getTimeColor(activity)} flex items-center justify-center text-white shadow-md shrink-0`}>
                    {getTimeIcon(activity)}
                </div>
                <div className="w-0.5 flex-1 bg-gradient-to-b from-zinc-300 dark:from-zinc-600 to-transparent mt-2" />
            </div>

            {/* Content */}
            <div className={`flex-1 pb-6 -mt-1`}>
                {timeLabel && (
                    <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-1 block">
                        {timeLabel}
                    </span>
                )}
                <div className={`p-4 rounded-2xl border ${getTimeBg(activity)} transition-all hover:shadow-md`}>
                    <p className="text-sm text-zinc-700 dark:text-zinc-200 leading-relaxed">
                        {description}
                    </p>
                    {placeName && (
                        <button
                            onClick={() => openInMaps(placeName)}
                            className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors group/map"
                        >
                            <Navigation className="w-3.5 h-3.5 group-hover/map:animate-bounce" />
                            Open in Maps
                            <ExternalLink className="w-3 h-3 opacity-50" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

function DayCard({ day, index }) {
    const [isExpanded, setIsExpanded] = useState(true);
    const { bookHotel, bookTransport, bookings } = useChatStore();

    const handleBookHotel = async (h) => {
        try {
            await bookHotel({
                name: typeof h === 'string' ? h : h.name,
                location: h.location || "Chennai",
                room_type: h.room_type || "Standard",
                price: h.price || "Contact for price"
            });
            alert("Hotel booked!");
        } catch (err) { alert(err.message); }
    };

    const handleBookTransport = async (t) => {
        try {
            await bookTransport({
                agency: t.agency || "Travel Agency",
                model: typeof t === 'string' ? t : t.model,
                type: t.type || "Cab",
                price: t.price || "Contact for price"
            });
            alert("Transport booked!");
        } catch (err) { alert(err.message); }
    };

    const isHotelBooked = (h) => bookings.hotels.some(b => b.name === (typeof h === 'string' ? h : h.name));
    const isTransportBooked = (t) => bookings.transport.some(b => b.model === (typeof t === 'string' ? t : t.model));

    return (
        <div className="mb-6 last:mb-0">
            {/* Day Header */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center gap-4 mb-4 group cursor-pointer"
            >
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${getDayGradient(index)} flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-indigo-500/20 shrink-0 group-hover:scale-110 transition-transform`}>
                    {day.dayNumber}
                </div>
                <div className="flex-1 text-left">
                    <h4 className="font-bold text-zinc-900 dark:text-zinc-50 text-base flex items-center gap-2">
                        Day {day.dayNumber}
                        <span className="text-lg">{getDayEmoji(index)}</span>
                    </h4>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">{day.theme}</p>
                </div>
                <div className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-zinc-400" /> : <ChevronDown className="w-4 h-4 text-zinc-400" />}
                </div>
            </button>

            {/* Activities Timeline */}
            {isExpanded && (
                <div className="ml-2 animate-in slide-in-from-top-1 duration-200">
                    {day.activities.map((activity, i) => (
                        <ActivityCard key={i} activity={activity} index={i} />
                    ))}

                    <div className="grid grid-cols-1 gap-3 mt-2">
                        {/* Hotel info */}
                        {day.hotels && (
                            <div className="flex gap-4">
                                <div className="flex flex-col items-center">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white shadow-md shrink-0">
                                        <Building2 className="w-4 h-4" />
                                    </div>
                                </div>
                                <div className="flex-1 -mt-1">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Stay</span>
                                        {isHotelBooked(day.hotels) ? (
                                            <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1 uppercase">
                                                <CheckCircle2 className="w-3 h-3" /> Booked
                                            </span>
                                        ) : (
                                            <button
                                                onClick={() => handleBookHotel(day.hotels)}
                                                className="text-[10px] font-bold text-indigo-600 hover:underline uppercase"
                                            >
                                                Book
                                            </button>
                                        )}
                                    </div>
                                    <div className="p-3 rounded-2xl border bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20 shadow-sm transition-all hover:shadow-md">
                                        <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">
                                            {typeof day.hotels === "string" ? day.hotels : day.hotels.name}
                                        </p>
                                        {day.hotels.room_type && <p className="text-[10px] text-zinc-500 mt-0.5">{day.hotels.room_type}</p>}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Transport info */}
                        {day.transport && (
                            <div className="flex gap-4 mt-1">
                                <div className="flex flex-col items-center">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white shadow-md shrink-0">
                                        <Car className="w-4 h-4" />
                                    </div>
                                </div>
                                <div className="flex-1 -mt-1">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Transport</span>
                                        {isTransportBooked(day.transport) ? (
                                            <span className="text-[10px] font-bold text-indigo-600 flex items-center gap-1 uppercase">
                                                <CheckCircle2 className="w-3 h-3" /> Booked
                                            </span>
                                        ) : (
                                            <button
                                                onClick={() => handleBookTransport(day.transport)}
                                                className="text-[10px] font-bold text-indigo-600 hover:underline uppercase"
                                            >
                                                Book
                                            </button>
                                        )}
                                    </div>
                                    <div className="p-3 rounded-2xl border bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20 shadow-sm transition-all hover:shadow-md">
                                        <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">
                                            {typeof day.transport === "string" ? day.transport : (day.transport.model || day.transport.type)}
                                        </p>
                                        {day.transport.agency && <p className="text-[10px] text-zinc-500 mt-0.5">{day.transport.agency}</p>}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── MAIN COMPONENT ───

export default function ItineraryPanel({ itinerary, onConfirm }) {
    if (!itinerary) return null;

    const days = parseItinerary(itinerary);

    if (days.length === 0) {
        // Fallback: render as formatted text if we can't parse
        return (
            <aside className="w-96  bg-gradient-to-b from-white via-zinc-50/50 to-white dark:from-zinc-950 dark:via-zinc-900/50 dark:to-zinc-950 overflow-y-auto hidden xl:block">
                <div className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25">
                            <CalendarDays className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-50">Your Itinerary</h3>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">AI Generated</p>
                        </div>
                    </div>
                    <pre className="text-xs bg-zinc-100 dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-x-auto whitespace-pre-wrap text-zinc-700 dark:text-zinc-300">
                        {JSON.stringify(itinerary, null, 2)}
                    </pre>
                </div>
            </aside>
        );
    }

    return (
        <aside className="w-96 border-l border-zinc-200 dark:border-zinc-800 bg-gradient-to-b from-white via-zinc-50/30 to-white dark:from-zinc-950 dark:via-zinc-900/30 dark:to-zinc-950 overflow-y-auto hidden xl:block">
            <div className="p-6">
                {/* Header */}
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25">
                        <CalendarDays className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-50">Your Itinerary</h3>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
                            <Sparkles className="w-3 h-3 inline mr-1" />
                            {days.length} Day{days.length > 1 ? "s" : ""} • AI Generated
                        </p>
                    </div>
                </div>

                {/* Summary chips */}
                <div className="flex flex-wrap gap-2 my-5">
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/20">
                        <CalendarDays className="w-3 h-3" /> {days.length} Days
                    </span>
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-500/20">
                        <Camera className="w-3 h-3" /> {days.reduce((sum, d) => sum + d.activities.length, 0)} Activities
                    </span>
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20">
                        <MapPin className="w-3 h-3" /> Chennai
                    </span>
                </div>

                {/* Separator */}
                <div className="h-px bg-gradient-to-r from-transparent via-zinc-300 dark:via-zinc-700 to-transparent mb-6" />

                {/* Day Cards */}
                {days.map((day, i) => (
                    <DayCard key={i} day={day} index={i} />
                ))}

                {/* Confirm Button */}
                {onConfirm && (
                    <button
                        onClick={() => {
                            // Group place names by day
                            const daysData = days.map(day => {
                                const namesInDay = [];
                                day.activities.forEach(activity => {
                                    const place = extractPlaceName(activity);
                                    if (place && !namesInDay.includes(place)) {
                                        namesInDay.push(place);
                                    }
                                });
                                // Fallback for empty day
                                if (namesInDay.length === 0 && day.activities.length > 0) {
                                    namesInDay.push(day.activities[0].split(" ").slice(0, 5).join(" "));
                                }
                                return namesInDay;
                            }).filter(d => d.length > 0);

                            // Try to find hotel name
                            let hotelName = null;
                            for (const day of days) {
                                if (day.hotels) {
                                    hotelName = typeof day.hotels === 'string' ? day.hotels : (day.hotels.name || JSON.stringify(day.hotels));
                                    break;
                                }
                            }
                            
                            onConfirm(daysData, hotelName, true);
                        }}
                        className="w-full mt-6 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-emerald-500/25"
                    >
                        <MapPin className="w-5 h-5" />
                        Confirm & Plan Route
                    </button>
                )}

                {/* Footer CTA */}
                <div className="mt-4 p-4 rounded-2xl bg-gradient-to-br from-indigo-500/5 to-purple-500/5 border border-indigo-200/50 dark:border-indigo-500/10">
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 text-center leading-relaxed">
                        💡 Click <strong>"Open in Maps"</strong> on any activity to get directions. Ask the AI to modify any part of your itinerary!
                    </p>
                </div>
            </div>
        </aside>
    );
}
