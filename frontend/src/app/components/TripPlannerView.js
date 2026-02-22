"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import {
    GoogleMap,
    useJsApiLoader,
    Marker,
    Polyline,
    InfoWindow,
    DirectionsService,
    DirectionsRenderer
} from "@react-google-maps/api";
import {
    Car, MapPin, Clock, Navigation, Star, Building2,
    ChevronDown, ChevronUp, ArrowRight, Route, Hotel,
    DollarSign, Shield, Fuel, Users, CheckCircle2
} from "lucide-react";
import useChatStore from "../../store/useChatStore";

const CHENNAI_CENTER = { lat: 13.0827, lng: 80.2707 };

const mapContainerStyle = {
    width: "100%",
    height: "100%",
    minHeight: "450px",
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

function TransportPanel({ routeData, dayData }) {
    const [expanded, setExpanded] = useState(true);
    const legs = dayData?.legs || [];
    const transport = routeData?.transport_options || [];
    const dayTime = useMemo(() => legs.reduce((sum, l) => sum + (l.road_time_mins || 0), 0), [legs]);

    const { bookTransport, bookings } = useChatStore();

    const handleBook = async (vehicle) => {
        try {
            await bookTransport({
                agency: vehicle.agency,
                model: vehicle.model,
                type: vehicle.type,
                price: vehicle.price,
                rating: vehicle.rating
            });
            alert("Transport booked successfully!");
        } catch (err) {
            alert("Booking failed: " + err.message);
        }
    };

    const isBooked = (v) => bookings.transport.some(b => b.model === v.model && b.agency === v.agency);

    return (
        <div className="h-full overflow-y-auto p-5 space-y-5 pb-20">
            {/* Route Summary */}
            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-5 text-white shadow-lg">
                <div className="flex items-center gap-2 mb-3">
                    <Route className="w-5 h-5" />
                    <span className="font-bold text-sm uppercase tracking-wider">Day {dayData?.day_number} Summary</span>
                </div>
                {dayTime > 0 && (
                    <div className="flex items-center gap-2 text-white/90 text-sm">
                        <Clock className="w-4 h-4" />
                        <span>Travel Time: <strong>{dayTime} min</strong></span>
                    </div>
                )}
                <p className="text-white/70 text-xs mt-2">
                    {legs.length} travel segments
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
                                <div className="flex flex-col items-center">
                                    <div
                                        className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0 shadow-sm"
                                        style={{ backgroundColor: routeColors[i % routeColors.length] }}
                                    >
                                        {i + 1}
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
                        Recommended Cabs
                    </p>
                    <div className="space-y-2">
                        {transport.map((t, i) => {
                            const booked = isBooked(t);
                            return (
                                <div
                                    key={i}
                                    className={`bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 transition-all shadow-sm ${booked ? 'ring-1 ring-emerald-500 border-emerald-500' : 'hover:border-indigo-300 dark:hover:border-indigo-600/50'}`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">
                                                {t.model || t.type}
                                            </p>
                                            <p className="text-xs text-zinc-500 flex items-center gap-1 mt-0.5">
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
                                            {booked ? (
                                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 uppercase">
                                                    <CheckCircle2 className="w-3 h-3" /> Booked
                                                </span>
                                            ) : (
                                                <button
                                                    onClick={() => handleBook(t)}
                                                    className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold transition-colors"
                                                >
                                                    Book
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── PLACES & HOTELS PANEL (Right) ───

function PlacesPanel({ routeData, orderedRoute, selectedPlace, onSelectPlace }) {
    const places = routeData?.places_detail || [];
    const hotels = routeData?.hotels_detail || [];

    const { bookHotel, bookings } = useChatStore();

    const handleBookHotel = async (hotel, room) => {
        try {
            await bookHotel({
                name: hotel.name,
                location: hotel.location || hotel.area,
                room_type: room.room_type,
                price: room.price
            });
            alert("Hotel booked successfully!");
        } catch (err) {
            alert("Booking failed: " + err.message);
        }
    };

    const isHotelBooked = (h, r) => bookings.hotels.some(b => b.name === h.name && b.room_type === r.room_type);

    // Filter and sort places by current day's ordered route
    const currentPlaces = useMemo(() => {
        return orderedRoute
            .map(name => places.find(p => p.name === name))
            .filter(Boolean);
    }, [orderedRoute, places]);

    return (
        <div className="h-full overflow-y-auto p-5 space-y-5 pb-20">
            {/* Hotels */}
            {hotels.length > 0 && (
                <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-3 flex items-center gap-2">
                        <Hotel className="w-4 h-4" />
                        Selected Stay
                    </p>
                    {hotels.map((h, i) => (
                        <div
                            key={i}
                            className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-500/5 dark:to-orange-500/5 border border-amber-200 dark:border-amber-500/20 rounded-2xl p-4 cursor-pointer hover:shadow-md transition-shadow mb-4"
                            onClick={() => onSelectPlace && h.lat && onSelectPlace({ lat: h.lat, lng: h.lng, name: h.name })}
                        >
                            <p className="font-bold text-zinc-800 dark:text-zinc-100">{h.name}</p>
                            <p className="text-xs text-zinc-500 flex items-center gap-1 mt-1">
                                <MapPin className="w-3 h-3" /> {h.location || h.area || "Chennai"}
                            </p>
                            {h.rooms && h.rooms.length > 0 && (
                                <div className="mt-4 space-y-2">
                                    {h.rooms.slice(0, 2).map((room, j) => {
                                        const booked = isHotelBooked(h, room);
                                        return (
                                            <div key={j} className="flex items-center justify-between bg-white dark:bg-zinc-900 border border-amber-100 dark:border-amber-500/10 rounded-xl p-2 px-3 shadow-sm">
                                                <div>
                                                    <p className="text-[10px] font-bold text-zinc-700 dark:text-zinc-200">{room.room_type}</p>
                                                    <p className="text-[10px] text-emerald-600 font-bold">₹{room.price}</p>
                                                </div>
                                                {booked ? (
                                                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                                ) : (
                                                    <button onClick={(e) => { e.stopPropagation(); handleBookHotel(h, room); }} className="px-3 py-1 rounded-lg bg-amber-500 text-white text-[10px] font-bold transition-colors">Book</button>
                                                )}
                                            </div>
                                        );
                                    })}
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
                    Visit Order ({currentPlaces.length})
                </p>
                <div className="space-y-3">
                    {currentPlaces.map((place, i) => {
                        const isSelected = selectedPlace?.name === place.name;
                        return (
                            <div
                                key={i}
                                onClick={() => onSelectPlace && place.lat && onSelectPlace({ lat: place.lat, lng: place.lng, name: place.name })}
                                className={`bg-white dark:bg-zinc-900 border rounded-xl p-4 cursor-pointer transition-all hover:shadow-md ${isSelected ? "border-indigo-500 ring-1 ring-indigo-500/20" : "border-zinc-200 dark:border-zinc-800"}`}
                            >
                                <div className="flex items-start gap-3">
                                    <div className="w-6 h-6 rounded-lg flex items-center justify-center text-white text-[10px] font-bold shrink-0" style={{ backgroundColor: routeColors[i % routeColors.length] }}>
                                        {getMarkerLabel(i)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-sm text-zinc-800 dark:text-zinc-100">{place.name}</p>
                                        <p className="text-xs text-zinc-500 mt-1 line-clamp-2">{place.description}</p>
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
    const [selectedDay, setSelectedDay] = useState(1);
    const [selectedPlace, setSelectedPlace] = useState(null);
    const [mapCenter, setMapCenter] = useState(CHENNAI_CENTER);
    const [infoOpen, setInfoOpen] = useState(null);
    const [directions, setDirections] = useState(null);
    const [mapError, setMapError] = useState(null);

    const { isLoaded, loadError } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    });

    useEffect(() => {
        if (loadError) {
            console.error("Google Maps Load Error:", loadError);
            setMapError(loadError.message || "Failed to load Google Maps");
        }
    }, [loadError]);

    const getPlaceDetail = useCallback((name) => {
        const p = routeData?.places_detail?.find(pd => pd.name === name);
        if (p) return { ...p, lat: p.lat, lng: p.lng || p.lon };
        const h = routeData?.hotels_detail?.find(hd => hd.name === name);
        if (h) return { ...h, isHotel: true, lat: h.lat, lng: h.lng || h.lon };
        return null;
    }, [routeData]);

    const dayData = useMemo(() => routeData?.days?.find(d => d.day_number === selectedDay) || routeData?.days?.[0], [routeData, selectedDay]);
    const orderedRoute = useMemo(() => dayData?.route || [], [dayData]);
    
    const dayMarkers = useMemo(() => orderedRoute.map((name, i) => {
        const detail = getPlaceDetail(name);
        if (!detail) return null;
        return { ...detail, order: i };
    }).filter(m => m && m.lat && m.lng), [orderedRoute, getPlaceDetail]);

    // Update map center and bounds when day markers change
    useEffect(() => {
        if (dayMarkers.length > 0 && isLoaded) {
            const bounds = new window.google.maps.LatLngBounds();
            dayMarkers.forEach(m => {
                if (m.lat && m.lng) bounds.extend({ lat: m.lat, lng: m.lng });
            });
            // Only set center and zoom if bounds are valid
            if (!bounds.isEmpty()) {
                setMapCenter(bounds.getCenter());
                // The map.fitBounds happens in onLoad, but we can set center here too
            }
        } else if (isLoaded) {
            setMapCenter(CHENNAI_CENTER); // Fallback to Chennai center if no markers
        }
    }, [isLoaded, dayMarkers]);

    // Update directions when day markers change
    useEffect(() => {
        if (!isLoaded || dayMarkers.length < 2) {
            setDirections(null);
            return;
        }

        const validMarkers = dayMarkers.filter(m => m.lat && m.lng);
        if (validMarkers.length < 2) return;

        const origin = { lat: validMarkers[0].lat, lng: validMarkers[0].lng };
        const destination = { lat: validMarkers[validMarkers.length - 1].lat, lng: validMarkers[validMarkers.length - 1].lng };
        const waypoints = validMarkers.slice(1, -1).map(m => ({
            location: { lat: m.lat, lng: m.lng },
            stopover: true
        }));

        const service = new window.google.maps.DirectionsService();
        service.route({
            origin,
            destination,
            waypoints,
            travelMode: window.google.maps.TravelMode.DRIVING,
        }, (result, status) => {
            if (status === 'OK') setDirections(result);
            else console.error("Directions request failed:", status);
        });
    }, [isLoaded, dayMarkers]);

    const handleSelectPlace = useCallback((place) => {
        setSelectedPlace(place);
        if (place.lat && place.lng) setMapCenter({ lat: place.lat, lng: place.lng });
    }, []);

    if (!routeData) return null;

    return (
        <div className="flex h-full overflow-hidden bg-zinc-50 dark:bg-zinc-950">
            {/* LEFT: Route Info (~35%) */}
            <div className="w-[35%] border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col">
                <div className="h-14 border-b border-zinc-200 dark:border-zinc-800 flex items-center px-5 shrink-0 justify-between">
                    <div className="flex items-center">
                        <Navigation className="w-5 h-5 text-indigo-600 mr-2" />
                        <span className="font-bold text-sm text-zinc-800 dark:text-zinc-100">Trip Itinerary</span>
                    </div>
                    {onBackToChat && (
                        <button onClick={onBackToChat} className="text-xs font-semibold text-zinc-500 hover:text-indigo-600 transition-colors">
                            ← Chat
                        </button>
                    )}
                </div>
                
                {routeData.days?.length > 1 && (
                    <div className="flex gap-2 p-4 border-b border-zinc-100 dark:border-zinc-800 overflow-x-auto shrink-0 no-scrollbar">
                        {routeData.days.map(d => (
                            <button
                                key={d.day_number}
                                onClick={() => setSelectedDay(d.day_number)}
                                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                                    selectedDay === d.day_number 
                                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20" 
                                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:bg-zinc-200"
                                }`}
                            >
                                Day {d.day_number}
                            </button>
                        ))}
                    </div>
                )}

                <div className="flex-1 overflow-hidden">
                    <TransportPanel routeData={routeData} dayData={dayData} />
                </div>
            </div>

            {/* RIGHT: Map & Details (~65%) */}
            <div className="flex-1 flex flex-col overflow-hidden relative">
                {/* Map Container */}
                <div className="flex-1 relative border-b border-zinc-200 dark:border-zinc-800">
                    {mapError ? (
                        <div className="w-full h-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center p-8">
                            <div className="max-w-md text-center">
                                <div className="w-16 h-16 bg-red-50 dark:bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <MapPin className="w-8 h-8 text-red-500" />
                                </div>
                                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-2">Map Unavailable</h3>
                                <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">
                                    Google Maps is currently unavailable (BillingNotEnabled). You can still view your itinerary timeline and book services.
                                </p>
                                <div className="text-xs font-mono bg-zinc-200 dark:bg-zinc-800 p-2 rounded text-zinc-600 dark:text-zinc-400 overflow-auto">
                                    {mapError}
                                </div>
                            </div>
                        </div>
                    ) : isLoaded ? (
                        <GoogleMap
                            mapContainerStyle={mapContainerStyle}
                            center={mapCenter}
                            zoom={12}
                            options={mapOptions}
                        >
                            {dayMarkers.map((marker, i) => (
                                <Marker
                                    key={`${selectedDay}-${i}`}
                                    position={{ lat: marker.lat, lng: marker.lng }}
                                    label={{
                                        text: marker.isHotel ? "H" : getMarkerLabel(i),
                                        color: "white",
                                        fontWeight: "bold",
                                        fontSize: "12px",
                                    }}
                                    icon={{
                                        path: window.google.maps.SymbolPath.CIRCLE,
                                        scale: 14,
                                        fillColor: marker.isHotel ? "#f59e0b" : routeColors[i % routeColors.length],
                                        fillOpacity: 1,
                                        strokeColor: "#fff",
                                        strokeWeight: 2,
                                    }}
                                    onClick={() => setInfoOpen(i)}
                                />
                            ))}

                            {infoOpen !== null && dayMarkers[infoOpen] && (
                                <InfoWindow
                                    position={{ lat: dayMarkers[infoOpen].lat, lng: dayMarkers[infoOpen].lng }}
                                    onCloseClick={() => setInfoOpen(null)}
                                >
                                    <div className="p-1 min-w-[120px]">
                                        <p className="font-bold text-sm text-zinc-900">{dayMarkers[infoOpen].name}</p>
                                        <p className="text-[10px] text-zinc-500 capitalize">{dayMarkers[infoOpen].category || (dayMarkers[infoOpen].isHotel ? 'Hotel' : 'Place')}</p>
                                    </div>
                                </InfoWindow>
                            )}

                            {directions && (
                                <DirectionsRenderer
                                    directions={directions}
                                    options={{
                                        suppressMarkers: true,
                                        polylineOptions: {
                                            strokeColor: "#6366f1",
                                            strokeOpacity: 0.8,
                                            strokeWeight: 5,
                                        }
                                    }}
                                />
                            )}
                        </GoogleMap>
                    ) : (
                        <div className="w-full h-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center text-zinc-400">
                            <div className="text-center">
                                <Loader2 className="w-8 h-8 mx-auto mb-2 animate-spin text-indigo-600" />
                                <p className="text-sm font-medium">Loading Google Maps...</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Details Section */}
                <div className="h-[40%] min-h-[300px] bg-white dark:bg-zinc-900 overflow-hidden flex flex-col">
                    <div className="h-12 border-b border-zinc-200 dark:border-zinc-800 flex items-center px-5 shrink-0 bg-zinc-50/50 dark:bg-zinc-900/50">
                        <MapPin className="w-4 h-4 text-emerald-600 mr-2" />
                        <span className="font-bold text-sm text-zinc-800 dark:text-zinc-100">Location Details - Day {selectedDay}</span>
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <PlacesPanel
                            routeData={routeData}
                            orderedRoute={orderedRoute}
                            selectedPlace={selectedPlace}
                            onSelectPlace={handleSelectPlace}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

function Loader2(props) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
    )
}
