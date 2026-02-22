"use client";

import { useState, useCallback, useEffect } from "react";
import {
    GoogleMap,
    useJsApiLoader,
    Marker,
    Polyline,
    InfoWindow,
} from "@react-google-maps/api";
import {
    Car, MapPin, Clock, Navigation, Star, Building2,
    ChevronDown, ChevronUp, ArrowRight, Route, Hotel,
    DollarSign, Shield, Fuel, Users
} from "lucide-react";

const CHENNAI_CENTER = { lat: 13.0827, lng: 80.2707 };

const mapContainerStyle = {
    width: "100%",
    height: "400px",
    borderRadius: "16px",
};

const mapOptions = {
    disableDefaultUI: false,
    zoomControl: true,
    streetViewControl: false,
    mapTypeControl: false,
    fullscreenControl: true,
    styles: [
        { featureType: "poi", stylers: [{ visibility: "simplified" }] },
        { featureType: "transit", stylers: [{ visibility: "off" }] },
        {
            featureType: "water",
            elementType: "geometry.fill",
            stylers: [{ color: "#c9e8fc" }],
        },
        {
            featureType: "landscape",
            elementType: "geometry.fill",
            stylers: [{ color: "#f0f4f0" }],
        },
    ],
};

const routeColors = [
    "#6366f1", "#ec4899", "#f59e0b", "#10b981",
    "#8b5cf6", "#ef4444", "#06b6d4",
];

function getMarkerLabel(index) {
    return String.fromCharCode(65 + index); // A, B, C...
}

// ─── TRANSPORT PANEL (Left) ───

function TransportPanel({ routeData }) {
    const [expanded, setExpanded] = useState(true);
    const legs = routeData?.legs || [];
    const transport = routeData?.transport_options || [];
    const totalTime = routeData?.total_road_time_mins;

    return (
        <div className="h-full overflow-y-auto p-5 space-y-5">
            {/* Route Summary */}
            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-5 text-white shadow-lg">
                <div className="flex items-center gap-2 mb-3">
                    <Route className="w-5 h-5" />
                    <span className="font-bold text-sm uppercase tracking-wider">Optimized Route</span>
                </div>
                {totalTime && (
                    <div className="flex items-center gap-2 text-white/90 text-sm">
                        <Clock className="w-4 h-4" />
                        <span>Total: <strong>{totalTime} min</strong> ({Math.round(totalTime / 60 * 10) / 10} hrs)</span>
                    </div>
                )}
                <p className="text-white/70 text-xs mt-2">
                    {legs.length} stops • Loop route
                </p>
            </div>

            {/* Route Legs Timeline */}
            <div>
                <button
                    onClick={() => setExpanded(!expanded)}
                    className="flex items-center justify-between w-full text-xs font-bold uppercase tracking-widest text-zinc-500 mb-3"
                >
                    Route Timeline
                    {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {expanded && (
                    <div className="space-y-0">
                        {legs.map((leg, i) => (
                            <div key={i} className="flex items-start gap-3">
                                {/* Timeline line */}
                                <div className="flex flex-col items-center">
                                    <div
                                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-md"
                                        style={{ backgroundColor: routeColors[i % routeColors.length] }}
                                    >
                                        {getMarkerLabel(i)}
                                    </div>
                                    {i < legs.length - 1 && (
                                        <div className="w-0.5 h-10 bg-zinc-200 dark:bg-zinc-700" />
                                    )}
                                </div>

                                <div className="flex-1 pb-4">
                                    <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">{leg.from}</p>
                                    <div className="flex items-center gap-1.5 mt-1 text-xs text-zinc-500">
                                        <ArrowRight className="w-3 h-3" />
                                        <span>{leg.to}</span>
                                        {leg.road_time_mins && (
                                            <span className="ml-auto bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full text-[10px] font-bold">
                                                {leg.road_time_mins} min
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Transport Options */}
            {transport.length > 0 && (
                <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-3 flex items-center gap-2">
                        <Car className="w-4 h-4" />
                        Available Transport
                    </p>
                    <div className="space-y-2">
                        {transport.map((t, i) => (
                            <div
                                key={i}
                                className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 hover:border-indigo-300 dark:hover:border-indigo-600/50 transition-all hover:shadow-sm cursor-pointer"
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">
                                            {t.model || t.type}
                                        </p>
                                        <p className="text-xs text-zinc-500 flex items-center gap-1 mt-0.5">
                                            <Shield className="w-3 h-3" />
                                            {t.agency}
                                            {t.rating && (
                                                <span className="flex items-center gap-0.5 ml-2">
                                                    <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                                                    {t.rating}
                                                </span>
                                            )}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                                            ₹{t.price}
                                        </p>
                                        <p className="text-[10px] text-zinc-400">{t.type}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── PLACES & HOTELS PANEL (Right) ───

function PlacesPanel({ routeData, selectedPlace, onSelectPlace }) {
    const places = routeData?.places_detail || [];
    const hotels = routeData?.hotels_detail || [];
    const orderedRoute = routeData?.ordered_route || [];

    // Sort places by route order
    const sortedPlaces = [...places].sort((a, b) => {
        const ia = orderedRoute.indexOf(a.name);
        const ib = orderedRoute.indexOf(b.name);
        return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib);
    });

    return (
        <div className="h-full overflow-y-auto p-5 space-y-5">
            {/* Hotels */}
            {hotels.length > 0 && (
                <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-3 flex items-center gap-2">
                        <Hotel className="w-4 h-4" />
                        Your Hotel
                    </p>
                    {hotels.map((h, i) => (
                        <div
                            key={i}
                            className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-500/5 dark:to-orange-500/5 border border-amber-200 dark:border-amber-500/20 rounded-2xl p-4 cursor-pointer hover:shadow-md transition-shadow"
                            onClick={() => onSelectPlace && h.lat && onSelectPlace({ lat: h.lat, lng: h.lng, name: h.name })}
                        >
                            <p className="font-bold text-zinc-800 dark:text-zinc-100">{h.name}</p>
                            {h.location && (
                                <p className="text-xs text-zinc-500 flex items-center gap-1 mt-1">
                                    <MapPin className="w-3 h-3" /> {h.location}
                                </p>
                            )}
                            {h.description && (
                                <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-2 leading-relaxed">{h.description}</p>
                            )}
                            {h.rooms && h.rooms.length > 0 && (
                                <div className="mt-3 flex flex-wrap gap-2">
                                    {h.rooms.slice(0, 3).map((room, j) => (
                                        <span
                                            key={j}
                                            className="text-[10px] bg-white dark:bg-zinc-900 border border-amber-200 dark:border-amber-500/20 rounded-lg px-2 py-1 text-zinc-600 dark:text-zinc-300"
                                        >
                                            {room.room_type} • ₹{room.price}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Places */}
            <div>
                <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-3 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Places to Visit ({sortedPlaces.length})
                </p>
                <div className="space-y-2">
                    {sortedPlaces.map((place, i) => {
                        const routeIdx = orderedRoute.indexOf(place.name);
                        const isSelected = selectedPlace?.name === place.name;

                        return (
                            <div
                                key={i}
                                onClick={() => onSelectPlace && place.lat && onSelectPlace({ lat: place.lat, lng: place.lng, name: place.name })}
                                className={`bg-white dark:bg-zinc-900 border rounded-xl p-4 cursor-pointer transition-all hover:shadow-md ${isSelected
                                        ? "border-indigo-500 shadow-md shadow-indigo-500/10 ring-1 ring-indigo-500/20"
                                        : "border-zinc-200 dark:border-zinc-800 hover:border-indigo-300 dark:hover:border-indigo-600/50"
                                    }`}
                            >
                                <div className="flex items-start gap-3">
                                    <div
                                        className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0"
                                        style={{ backgroundColor: routeColors[routeIdx % routeColors.length] || "#6366f1" }}
                                    >
                                        {routeIdx >= 0 ? getMarkerLabel(routeIdx) : "?"}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-sm text-zinc-800 dark:text-zinc-100">{place.name}</p>
                                        {place.category && (
                                            <span className="inline-block text-[10px] bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full mt-1 font-medium">
                                                {place.category}
                                            </span>
                                        )}
                                        {place.description && (
                                            <p className="text-xs text-zinc-500 mt-1.5 line-clamp-2">{place.description}</p>
                                        )}
                                        <div className="flex items-center gap-3 mt-2">
                                            {place.rating && (
                                                <span className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
                                                    <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                                                    {place.rating}
                                                </span>
                                            )}
                                            {place.location && (
                                                <span className="text-xs text-zinc-400 flex items-center gap-1">
                                                    <MapPin className="w-3 h-3" />
                                                    {place.location}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}


// ─── MAIN TRIP PLANNER VIEW ───

export default function TripPlannerView({ routeData, onBackToChat }) {
    const [selectedPlace, setSelectedPlace] = useState(null);
    const [mapCenter, setMapCenter] = useState(CHENNAI_CENTER);
    const [infoOpen, setInfoOpen] = useState(null);

    const { isLoaded } = useJsApiLoader({
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    });

    // Compute markers from places + hotel
    const places = routeData?.places_detail || [];
    const hotels = routeData?.hotels_detail || [];
    const orderedRoute = routeData?.ordered_route || [];

    const allMarkers = [
        ...hotels.filter(h => h.lat && h.lng).map(h => ({
            lat: h.lat, lng: h.lng, name: h.name, type: "hotel"
        })),
        ...places.filter(p => p.lat && p.lng).map(p => ({
            lat: p.lat, lng: p.lng, name: p.name, type: "place"
        })),
    ];

    // Build polyline path from ordered route
    const routePath = orderedRoute
        .map(name => {
            const m = allMarkers.find(mk => mk.name === name);
            return m ? { lat: m.lat, lng: m.lng } : null;
        })
        .filter(Boolean);

    const handleSelectPlace = useCallback((place) => {
        setSelectedPlace(place);
        if (place.lat && place.lng) {
            setMapCenter({ lat: place.lat, lng: place.lng });
        }
    }, []);

    const onMapLoad = useCallback((map) => {
        if (allMarkers.length > 0) {
            const bounds = new window.google.maps.LatLngBounds();
            allMarkers.forEach(m => bounds.extend({ lat: m.lat, lng: m.lng }));
            map.fitBounds(bounds, { padding: 60 });
        }
    }, [allMarkers]);

    if (!routeData) return null;

    return (
        <div className="flex h-full overflow-hidden">
            {/* LEFT: Transport (~35%) */}
            <div className="w-[35%] border-r border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/80">
                <div className="h-14 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center px-5">
                    <Car className="w-5 h-5 text-indigo-600 mr-2" />
                    <span className="font-bold text-sm text-zinc-800 dark:text-zinc-100">Transportation & Route</span>
                </div>
                <TransportPanel routeData={routeData} />
            </div>

            {/* RIGHT: Places & Map (~65%) */}
            <div className="flex-1 flex flex-col bg-white dark:bg-zinc-950 overflow-hidden">
                {/* Map Header */}
                <div className="h-14 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center justify-between px-5">
                    <div className="flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-emerald-600" />
                        <span className="font-bold text-sm text-zinc-800 dark:text-zinc-100">Places & Hotels</span>
                    </div>
                    {onBackToChat && (
                        <button
                            onClick={onBackToChat}
                            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
                        >
                            ← Back to Chat
                        </button>
                    )}
                </div>

                {/* Google Map */}
                <div className="p-4">
                    {isLoaded ? (
                        <GoogleMap
                            mapContainerStyle={mapContainerStyle}
                            center={mapCenter}
                            zoom={12}
                            options={mapOptions}
                            onLoad={onMapLoad}
                        >
                            {allMarkers.map((marker, i) => (
                                <Marker
                                    key={i}
                                    position={{ lat: marker.lat, lng: marker.lng }}
                                    label={{
                                        text: marker.type === "hotel" ? "H" : getMarkerLabel(orderedRoute.indexOf(marker.name)),
                                        color: "white",
                                        fontWeight: "bold",
                                        fontSize: "12px",
                                    }}
                                    icon={{
                                        path: window.google.maps.SymbolPath.CIRCLE,
                                        scale: 16,
                                        fillColor: marker.type === "hotel" ? "#f59e0b" : routeColors[orderedRoute.indexOf(marker.name) % routeColors.length],
                                        fillOpacity: 1,
                                        strokeColor: "#fff",
                                        strokeWeight: 3,
                                    }}
                                    onClick={() => setInfoOpen(i)}
                                />
                            ))}

                            {infoOpen !== null && allMarkers[infoOpen] && (
                                <InfoWindow
                                    position={{ lat: allMarkers[infoOpen].lat, lng: allMarkers[infoOpen].lng }}
                                    onCloseClick={() => setInfoOpen(null)}
                                >
                                    <div className="p-1">
                                        <p className="font-bold text-sm">{allMarkers[infoOpen].name}</p>
                                        <p className="text-xs text-zinc-500 capitalize">{allMarkers[infoOpen].type}</p>
                                    </div>
                                </InfoWindow>
                            )}

                            {routePath.length > 1 && (
                                <Polyline
                                    path={routePath}
                                    options={{
                                        strokeColor: "#6366f1",
                                        strokeOpacity: 0.8,
                                        strokeWeight: 4,
                                        geodesic: true,
                                    }}
                                />
                            )}
                        </GoogleMap>
                    ) : (
                        <div className="w-full h-[400px] rounded-2xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center text-zinc-400">
                            <div className="text-center">
                                <MapPin className="w-8 h-8 mx-auto mb-2 animate-pulse" />
                                <p className="text-sm">Loading map...</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Places & Hotels Cards */}
                <div className="flex-1 overflow-y-auto">
                    <PlacesPanel
                        routeData={routeData}
                        selectedPlace={selectedPlace}
                        onSelectPlace={handleSelectPlace}
                    />
                </div>
            </div>
        </div>
    );
}
