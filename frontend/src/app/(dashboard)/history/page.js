'use client';

import React, { useState } from 'react';
import { Search, Filter, CalendarDays, MapPin, ChevronRight, Share2, Download, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

export default function HistoryPage() {
    const [searchQuery, setSearchQuery] = useState('');

    // Mock data for past trips grouped by month
    const tripHistory = [
        {
            month: "October 2023",
            trips: [
                {
                    id: 1,
                    title: "Heritage & Culture Weekend",
                    date: "Oct 12 - Oct 14",
                    locations: ["Mylapore", "San Thome", "George Town"],
                    type: "Curated Itinerary",
                    status: "Completed",
                    image: "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                },
                {
                    id: 2,
                    title: "Marina Beach Sunset Dinner",
                    date: "Oct 05",
                    locations: ["Marina Beach", "Besant Nagar"],
                    type: "Evening Plan",
                    status: "Completed",
                    image: "https://images.unsplash.com/photo-1588416936097-41850ab3d54f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                }
            ]
        },
        {
            month: "September 2023",
            trips: [
                {
                    id: 3,
                    title: "Sowcarpet Food Safari",
                    date: "Sep 22",
                    locations: ["Mint Street", "Sowcarpet Area"],
                    type: "Food Walk",
                    status: "Saved",
                    image: "https://images.unsplash.com/photo-1589301760014-d929f39ce9b0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                }
            ]
        }
    ];

    return (
        <div className="flex flex-col h-full max-w-5xl mx-auto p-6 lg:p-10 animate-fade-in relative z-10">

            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight mb-2">Trip History</h1>
                    <p className="text-muted-foreground">View and manage your past itineraries and saved plans.</p>
                </div>

                {/* Search and Filter */}
                <div className="flex w-full md:w-auto gap-3">
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                        <Input
                            placeholder="Search past trips..."
                            className="pl-9 border-border bg-white"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Button variant="outline" size="icon" className="shrink-0 bg-white">
                        <Filter size={16} />
                    </Button>
                </div>
            </div>

            {/* Trip List */}
            <div className="flex flex-col gap-10 pb-20">
                {tripHistory.map((group, groupIndex) => (
                    <div key={groupIndex} className={`stagger-${groupIndex + 1}`}>
                        <h3 className="text-lg font-semibold mb-4 text-slate-800 flex items-center gap-2">
                            <CalendarDays className="text-primary" size={18} />
                            {group.month}
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {group.trips.map((trip) => (
                                <Card key={trip.id} className="overflow-hidden bg-white shadow-sm border-border hover:shadow-md transition-shadow group flex flex-col p-0">
                                    <div className="h-48 relative overflow-hidden shrink-0">
                                        <img
                                            src={trip.image}
                                            alt={trip.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                                        <div className="absolute bottom-4 left-4 flex gap-2 z-10">
                                            <Badge variant="secondary" className={trip.status === "Completed" ? "bg-primary text-white hover:bg-primary/90" : "bg-white/90 text-slate-800 hover:bg-white"}>
                                                {trip.status}
                                            </Badge>
                                            <Badge variant="outline" className="bg-black/30 text-white border-white/20 backdrop-blur-md">
                                                {trip.type}
                                            </Badge>
                                        </div>
                                    </div>

                                    <CardContent className="p-5 flex-1 flex flex-col">
                                        <div className="flex justify-between items-start mb-3">
                                            <h4 className="font-bold text-xl text-slate-900 group-hover:text-primary transition-colors line-clamp-1">{trip.title}</h4>

                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 -mt-1 text-slate-400 hover:text-slate-800 shrink-0">
                                                        <MoreHorizontal size={18} />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem className="cursor-pointer flex items-center gap-2 text-sm"><Share2 size={14} /> Share Trip</DropdownMenuItem>
                                                    <DropdownMenuItem className="cursor-pointer flex items-center gap-2 text-sm"><Download size={14} /> Download PDF</DropdownMenuItem>
                                                    <DropdownMenuItem className="cursor-pointer flex items-center gap-2 text-sm text-destructive"><Filter size={14} /> Delete Record</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>

                                        </div>

                                        <div className="flex items-center text-sm text-muted-foreground mb-3">
                                            <CalendarDays size={16} className="mr-2 text-primary/70" />
                                            {trip.date}
                                        </div>

                                        <div className="flex items-start text-sm text-muted-foreground mb-6 flex-1">
                                            <MapPin size={16} className="mr-2 mt-0.5 shrink-0 text-accent-orange/80" />
                                            <span className="line-clamp-2">{trip.locations.join(' • ')}</span>
                                        </div>

                                        <div className="flex justify-between items-center border-t border-slate-100 pt-4 mt-auto">
                                            <Button variant="outline" size="sm" className="hover:bg-primary hover:text-white transition-colors">
                                                View Details
                                            </Button>
                                            <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/10 transition-colors font-medium">
                                                Remix <ChevronRight size={16} className="ml-1" />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

        </div>
    );
}
