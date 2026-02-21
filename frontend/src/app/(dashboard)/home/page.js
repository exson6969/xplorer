'use client';

import React, { useState } from 'react';
import { Send, MapPin, Coffee, Camera, Sun, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function HomePage() {
    const [chatInput, setChatInput] = useState('');

    const filters = [
        { icon: <MapPin size={14} />, label: 'Heritage Walks' },
        { icon: <Coffee size={14} />, label: 'Filter Coffee Spots' },
        { icon: <Camera size={14} />, label: 'Photo Walks' },
        { icon: <Sun size={14} />, label: 'Beach Sunsets' },
    ];

    const suggestedExperiences = [
        {
            id: 1,
            title: "Mylapore Heritage Trail",
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBNVtrugdiM9EmHRK4rLq7PC3wK-D46ylppkbWmQBhlwo9Yw6YRvg0NwFut_GGxPLvEmulFYlnEVlGl-W3L90qeExF6Kaar2wPOHY7pxJaHz2EM2ySFajB833K8z7uYtGqnzcS-cilWvMqQJuqQ6hABXpZE_huaP47vNzBLuxSnLpiFXyblaZzyCu7umXiaFCrLm4fUX1IjsCyDa7cLE0q2UstlwmezbBkJSTe5PCc8MPeK4EpnZ7O3qEEss8W5N9eput0OSDn25Ti5",
            duration: "3 hours",
            rating: "4.9",
            tags: ["Culture", "Walking"]
        },
        {
            id: 2,
            title: "Sowcarpet Food Safari",
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDXDL50z8NM1DAHO574Gm3Ot4TL7iei9N5jTCnqpVkvW3CAfQ0BvpTAhlliMPvhmmO9lKHeQUdvUmf_wWqBDq6rNjXjPUXkKow5u5sv9aFFaIpOawZy9niWQogclUBPkdhR_5IHbFgGmINhztynMByjasKYqQHOJlbauQP9h4B6MbcWfPTWCiW9XSnm7VpwPbzCoMA6FJhH6VCYoGzRo3T_ZyNwwNS1b42KnVoDna5u9Jhec7Qo9bH_c_IJQb1cPpVDaLyi9s5iXaqb",
            duration: "2.5 hours",
            rating: "4.8",
            tags: ["Food", "Evening"]
        },
        {
            id: 3,
            title: "East Coast Road Drive",
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCfcTM9-ZMLykMkGnuT_dWOUwfUmIGUF6gH-FncsP9ahDaYxdxaR-7jUSjzs6a5sKq3EJEVBxujOzuNyRZRhNhyOENv_-YFmcpKsYO88ixLrw61H4LvhL1QuLThvD5_FZOkz1Y3KkcCK4EhBcMfBvZnb2IpFF0t5Pea2n4XYxfm_erx5TpjLKljpPcWAyJXwawR8xALKTdQYMkB1-icyRUPMxPRhZ1UkzPQRXRNsxWEji9hUq3y6vZ6AozqWNRGN-L1cht-AGohOAQo",
            duration: "Half Day",
            rating: "4.9",
            tags: ["Scenic", "Road Trip"]
        }
    ];

    return (
        <div className="flex flex-col h-full max-w-5xl mx-auto p-6 lg:p-10 animate-fade-in relative z-10">

            {/* Header Area */}
            <div className="flex justify-between items-center mb-12">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight mb-2">Morning, Explorer <span className="text-2xl">👋</span></h1>
                    <p className="text-muted-foreground">Ready to discover Chennai's hidden gems today?</p>
                </div>
                <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground bg-accent-orange/10 px-4 py-2 rounded-full border border-accent-orange/20">
                    <Info size={16} className="text-accent-orange" />
                    <span>Weather: 32°C, Scattered Clouds</span>
                </div>
            </div>

            {/* Main Chat Input Area */}
            <div className="flex-1 flex flex-col justify-center max-w-3xl mx-auto w-full mb-16">
                <h2 className="text-4xl md:text-5xl font-bold text-center mb-10 tracking-tight">
                    Where does your <span className="gradient-text">journey begin?</span>
                </h2>

                <div className="relative group glow-border rounded-2xl mb-6 shadow-floating">
                    <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
                        <Compass size={24} className="text-primary hidden sm:block" />
                    </div>
                    <Input
                        className="w-full h-16 pl-6 sm:pl-16 pr-16 text-lg rounded-2xl border-2 border-border bg-white/80 backdrop-blur-sm shadow-sm focus-visible:ring-primary focus-visible:border-primary transition-all"
                        placeholder="E.g., Plan a 2-day temple and food tour..."
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                    />
                    <Button
                        size="icon"
                        className="absolute right-3 top-3 h-10 w-10 rounded-xl bg-primary hover:bg-primary/90 text-white shadow-md transition-transform hover:scale-105"
                    >
                        <Send size={18} />
                    </Button>
                </div>

                {/* Filter Chips */}
                <div className="flex flex-wrap justify-center gap-3">
                    {filters.map((filter) => (
                        <Button
                            key={filter.label}
                            variant="outline"
                            className="rounded-full bg-white/50 backdrop-blur-sm border-border hover:border-primary hover:text-primary transition-colors text-sm py-1.5 h-auto"
                        >
                            {filter.icon}
                            <span className="ml-2">{filter.label}</span>
                        </Button>
                    ))}
                </div>
            </div>

            {/* Suggested Experiences */}
            <div>
                <div className="flex justify-between items-end mb-6">
                    <div>
                        <h3 className="text-xl font-bold">Curated Experiences</h3>
                        <p className="text-sm text-muted-foreground">Handpicked local adventures</p>
                    </div>
                    <Button variant="ghost" className="text-primary font-medium hover:bg-primary/10">View All</Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {suggestedExperiences.map((exp, i) => (
                        <Card key={exp.id} className={`overflow-hidden rounded-2xl border-0 shadow-soft glass-card group transition-all duration-300 hover:-translate-y-2 stagger-${i + 1}`}>
                            <div className="h-48 relative overflow-hidden">
                                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors z-10"></div>
                                <img
                                    src={exp.image}
                                    alt={exp.title}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                <div className="absolute top-4 right-4 z-20">
                                    <Badge variant="secondary" className="bg-white/90 text-foreground font-semibold backdrop-blur-md">
                                        ★ {exp.rating}
                                    </Badge>
                                </div>
                            </div>
                            <CardContent className="p-5">
                                <div className="flex gap-2 mb-3">
                                    {exp.tags.map(tag => (
                                        <Badge key={tag} variant="outline" className="text-xs bg-primary/5 border-primary/20 text-primary">
                                            {tag}
                                        </Badge>
                                    ))}
                                </div>
                                <h4 className="font-bold text-lg mb-1 group-hover:text-primary transition-colors">{exp.title}</h4>
                                <p className="text-sm text-muted-foreground">{exp.duration}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}

// Ensure Compass is available for the input icon
function Compass(props) {
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
            <circle cx="12" cy="12" r="10" />
            <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
        </svg>
    );
}
