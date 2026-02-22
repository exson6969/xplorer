"use client";

import { useState } from "react";
import {
    Sparkles, Calendar, Clock, MapPin, CheckCircle2, ChevronRight,
    User, Navigation, ExternalLink, Sun, Sunset, Moon, Coffee,
    UtensilsCrossed, Star, Building2, Car
} from "lucide-react";

// ─── HELPERS ───

function getTimeIcon(text) {
    const lower = text.toLowerCase();
    if (lower.includes("morning")) return <Sun className="w-3.5 h-3.5" />;
    if (lower.includes("lunch") || lower.includes("brunch")) return <UtensilsCrossed className="w-3.5 h-3.5" />;
    if (lower.includes("afternoon")) return <Coffee className="w-3.5 h-3.5" />;
    if (lower.includes("evening") || lower.includes("sunset")) return <Sunset className="w-3.5 h-3.5" />;
    if (lower.includes("night") || lower.includes("dinner")) return <Moon className="w-3.5 h-3.5" />;
    return <Clock className="w-3.5 h-3.5" />;
}

function getTimeGradient(text) {
    const lower = text.toLowerCase();
    if (lower.includes("morning")) return "from-amber-500 to-orange-400";
    if (lower.includes("lunch") || lower.includes("brunch")) return "from-green-500 to-emerald-400";
    if (lower.includes("afternoon")) return "from-sky-500 to-blue-400";
    if (lower.includes("evening") || lower.includes("sunset")) return "from-purple-500 to-violet-400";
    if (lower.includes("night") || lower.includes("dinner")) return "from-indigo-600 to-blue-500";
    return "from-zinc-500 to-zinc-400";
}

function openInMaps(placeName) {
    const q = encodeURIComponent(placeName + ", Chennai, India");
    window.open(`https://www.google.com/maps/search/?api=1&query=${q}`, "_blank");
}

function extractPlaceName(text) {
    const patterns = [
        /(?:visit|explore|head to|go to|stop at|at|reach|check out|see)\s+(?:the\s+)?(.+?)(?:\.|,|!|\band\b|for\b|$)/i,
    ];
    for (const p of patterns) {
        const m = text.match(p);
        if (m && m[1] && m[1].trim().length > 3 && m[1].trim().length < 60) return m[1].trim();
    }
    return null;
}

/** Render rich text — handles **bold**, *italic*, bullet points, and newlines */
function RichText({ text }) {
    if (!text) return null;

    const lines = text.split("\n");

    return (
        <div className="space-y-2">
            {lines.map((line, i) => {
                const trimmed = line.trim();
                if (!trimmed) return <div key={i} className="h-2" />;

                // Bullet points
                if (trimmed.startsWith("- ") || trimmed.startsWith("• ") || trimmed.startsWith("* ")) {
                    return (
                        <div key={i} className="flex items-start gap-2 ml-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0" />
                            <span dangerouslySetInnerHTML={{ __html: formatInline(trimmed.substring(2)) }} />
                        </div>
                    );
                }

                // Numbered items 
                const numMatch = trimmed.match(/^(\d+)\.\s+(.+)/);
                if (numMatch) {
                    return (
                        <div key={i} className="flex items-start gap-2.5 ml-1">
                            <span className="w-5 h-5 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                                {numMatch[1]}
                            </span>
                            <span dangerouslySetInnerHTML={{ __html: formatInline(numMatch[2]) }} />
                        </div>
                    );
                }

                return <p key={i} dangerouslySetInnerHTML={{ __html: formatInline(trimmed) }} />;
            })}
        </div>
    );
}

/** Format inline markdown: **bold** and *italic* */
function formatInline(text) {
    return text
        .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-zinc-900 dark:text-zinc-100">$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>');
}

/** Render an inline mini-itinerary when the AI includes it in the response */
function InlineItinerary({ itinerary }) {
    if (!itinerary) return null;

    // Parse days - handle both array and object formats
    let days = [];
    if (Array.isArray(itinerary)) {
        days = itinerary;
    } else if (typeof itinerary === "object") {
        days = Object.entries(itinerary)
            .sort(([a], [b]) => {
                const na = parseInt(a.replace(/\D/g, "")) || 0;
                const nb = parseInt(b.replace(/\D/g, "")) || 0;
                return na - nb;
            })
            .map(([key, val]) => ({
                dayNumber: parseInt(key.replace(/\D/g, "")) || 0,
                ...(typeof val === "object" ? val : { theme: String(val) })
            }));
    }

    if (days.length === 0) return null;

    const dayGradients = [
        "from-rose-500 to-pink-500",
        "from-blue-500 to-cyan-500",
        "from-amber-500 to-orange-500",
        "from-emerald-500 to-green-500",
        "from-violet-500 to-purple-500",
    ];

    return (
        <div className="mt-4 space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">
                <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                Your {days.length}-Day Itinerary
            </div>

            {days.map((day, i) => {
                const activities = day.activities || [];
                const theme = day.theme || day.title || `Day ${day.dayNumber || i + 1}`;

                return (
                    <div key={i} className="rounded-2xl border border-zinc-200 dark:border-zinc-700/50 overflow-hidden bg-white dark:bg-zinc-900/50 shadow-sm hover:shadow-md transition-shadow">
                        {/* Day header */}
                        <div className={`bg-gradient-to-r ${dayGradients[i % dayGradients.length]} px-4 py-3 flex items-center gap-3`}>
                            <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center text-white font-bold text-sm">
                                {day.dayNumber || i + 1}
                            </div>
                            <div>
                                <p className="text-white font-bold text-sm">Day {day.dayNumber || i + 1}</p>
                                <p className="text-white/80 text-[10px] font-medium">{theme}</p>
                            </div>
                        </div>

                        {/* Activities */}
                        <div className="p-4 space-y-3">
                            {activities.map((activity, j) => {
                                const actText = typeof activity === "string" ? activity : (activity.description || activity.activity || "");
                                const colonIdx = actText.indexOf(":");
                                let timeSlot = null;
                                let desc = actText;
                                if (colonIdx > 0 && colonIdx < 20) {
                                    timeSlot = actText.substring(0, colonIdx).trim();
                                    desc = actText.substring(colonIdx + 1).trim();
                                }
                                const place = extractPlaceName(desc);

                                return (
                                    <div key={j} className="flex items-start gap-3">
                                        <div className={`w-6 h-6 rounded-lg bg-gradient-to-br ${getTimeGradient(actText)} flex items-center justify-center text-white shrink-0 mt-0.5`}>
                                            {getTimeIcon(actText)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            {timeSlot && (
                                                <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 block mb-0.5">{timeSlot}</span>
                                            )}
                                            <p className="text-sm text-zinc-700 dark:text-zinc-200 leading-relaxed">{desc}</p>
                                            {place && (
                                                <button
                                                    onClick={() => openInMaps(place)}
                                                    className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors"
                                                >
                                                    <Navigation className="w-3 h-3" />
                                                    View on Maps
                                                    <ExternalLink className="w-2.5 h-2.5 opacity-50" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}


// ─── MAIN COMPONENT ───

export default function MessageBubble({ message, onSubmitData }) {
    const isAI = message.role === "ai";
    const content = isAI ? message.ai_response : message.text;

    // AI output can be plain string or structured object
    const text = typeof content === "object" && content !== null ? content.text : (content || "");
    const ui_elements = (typeof content === "object" && content !== null) ? (content.ui_elements || []) : [];
    const itinerary = (typeof content === "object" && content !== null) ? content.itinerary : null;

    const [formData, setFormData] = useState({});

    const handleFieldChange = (key, value) => {
        setFormData(prev => ({ ...prev, [key]: value }));
    };

    const handleFormSubmit = () => {
        if (onSubmitData) onSubmitData(formData);
        setFormData({});
    };

    if (!isAI) {
        // ─── USER BUBBLE ───
        return (
            <div className="flex justify-end">
                <div className="max-w-[70%] bg-gradient-to-br from-indigo-600 to-indigo-700 text-white px-5 py-3.5 rounded-2xl rounded-br-md shadow-lg shadow-indigo-500/20">
                    <p className="text-sm leading-relaxed">{text}</p>
                </div>
            </div>
        );
    }

    // ─── AI BUBBLE ───
    return (
        <div className="flex gap-3 max-w-[85%]">
            {/* Avatar */}
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shrink-0 shadow-md shadow-indigo-500/20 mt-1">
                <Sparkles className="w-4 h-4" />
            </div>

            <div className="flex-1 min-w-0">
                {/* AI Label */}
                <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                        Xplorer Agent
                    </span>
                </div>

                {/* Message Content */}
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl rounded-tl-md px-5 py-4 shadow-sm">
                    {text && (
                        <div className="text-sm text-zinc-700 dark:text-zinc-200 leading-relaxed">
                            <RichText text={text} />
                        </div>
                    )}

                    {/* UI Elements (date pickers, selects, etc.) */}
                    {ui_elements.length > 0 && (
                        <div className="mt-4 space-y-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                            {ui_elements.map((el, i) => {
                                if (el.type === "date_picker") {
                                    return (
                                        <div key={i} className="flex items-center gap-3">
                                            <Calendar className="w-5 h-5 text-indigo-600 shrink-0" />
                                            <div className="flex-1">
                                                <label className="text-xs font-semibold text-zinc-500 block mb-1">{el.label}</label>
                                                <input
                                                    type="date"
                                                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-700 rounded-xl py-2.5 px-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all"
                                                    onChange={(e) => handleFieldChange(el.field, e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    );
                                }

                                if (el.type === "select" && el.options) {
                                    return (
                                        <div key={i}>
                                            <label className="text-xs font-semibold text-zinc-500 block mb-2">{el.label}</label>
                                            <div className="flex flex-wrap gap-2">
                                                {el.options.map((opt, j) => (
                                                    <button
                                                        key={j}
                                                        onClick={() => handleFieldChange(el.field, opt)}
                                                        className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all border ${formData[el.field] === opt
                                                                ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/25 scale-105"
                                                                : "bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:border-indigo-300 dark:hover:border-indigo-500/50 hover:bg-indigo-50 dark:hover:bg-indigo-500/5"
                                                            }`}
                                                    >
                                                        {opt}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                }

                                return null;
                            })}

                            <button
                                onClick={handleFormSubmit}
                                className="w-full mt-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-indigo-500/25"
                            >
                                <CheckCircle2 className="w-4 h-4" />
                                Submit
                            </button>
                        </div>
                    )}

                    {/* Inline Itinerary */}
                    <InlineItinerary itinerary={itinerary} />
                </div>
            </div>
        </div>
    );
}
