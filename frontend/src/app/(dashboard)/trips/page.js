'use client';

import React, { useState } from 'react';
import { Send, MapPin, Clock, Calendar as CalendarIcon, MoreVertical, Coffee, Camera, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

export default function TripsPage() {
    const [chatInput, setChatInput] = useState('');

    // Mock data for the itinerary timeline
    const itineraryData = [
        {
            time: "09:00 AM",
            title: "Mylapore Kapaleeshwarar Temple",
            duration: "1.5 hrs",
            type: "heritage",
            icon: <MapPin size={16} />,
            color: "text-orange-500",
            bgColor: "bg-orange-500/10"
        },
        {
            time: "10:30 AM",
            title: "Filter Coffee at Rayar's Mess",
            duration: "45 mins",
            type: "food",
            icon: <Coffee size={16} />,
            color: "text-amber-600",
            bgColor: "bg-amber-600/10"
        },
        {
            time: "11:30 AM",
            title: "San Thome Basilica",
            duration: "1 hr",
            type: "heritage",
            icon: <Camera size={16} />,
            color: "text-blue-500",
            bgColor: "bg-blue-500/10"
        },
        {
            time: "01:00 PM",
            title: "Lunch: Authentic South Indian Meals",
            duration: "1.5 hrs",
            type: "food",
            icon: <Coffee size={16} />,
            color: "text-green-600",
            bgColor: "bg-green-600/10"
        },
        {
            time: "04:30 PM",
            title: "Marina Beach Sunset Walk",
            duration: "2 hrs",
            type: "leisure",
            icon: <Sun size={16} />,
            color: "text-primary",
            bgColor: "bg-primary/10"
        }
    ];

    return (
        <div className="flex h-full relative overflow-hidden">

            {/* Left Panel - Chat Interface (60%) */}
            <div className="flex-[3] flex flex-col min-h-0 border-r border-border bg-background/50 backdrop-blur-sm relative z-10 w-full lg:w-3/5">
                <div className="p-4 border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-20 flex justify-between items-center">
                    <div>
                        <h2 className="font-semibold text-lg flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                            Planning: Heritage & Culture Tour
                        </h2>
                        <p className="text-sm text-muted-foreground">AI Explorer Agent connected</p>
                    </div>
                    <Button variant="outline" size="sm" className="hidden sm:flex">Save Itinerary</Button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 lg:p-6 scroll-smooth">
                    <div className="flex flex-col gap-6 max-w-2xl mx-auto pb-4">

                        {/* AI Message */}
                        <div className="flex gap-4 max-w-[85%]">
                            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                                <span className="text-primary font-bold text-sm">AI</span>
                            </div>
                            <div className="chat-bubble-ai px-5 py-3 shadow-sm border border-border/50">
                                <p>Welcome back! I see you're interested in Chennai's heritage. For a 1-day trip, starting at Mylapore is perfect. <br /><br />Would you like to include a food walk or focus strictly on historical architecture?</p>
                            </div>
                        </div>

                        {/* User Message */}
                        <div className="flex gap-4 max-w-[85%] self-end flex-row-reverse">
                            <div className="w-8 h-8 rounded-full bg-accent-orange/20 flex items-center justify-center shrink-0">
                                <span className="text-accent-orange font-bold text-xs">You</span>
                            </div>
                            <div className="chat-bubble-user px-5 py-3 shadow-md">
                                <p>Let's definitely do a food walk! Specifically looking for good filter coffee spots.</p>
                            </div>
                        </div>

                        {/* AI Message with generated itinerary action */}
                        <div className="flex gap-4 max-w-[85%]">
                            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                                <span className="text-primary font-bold text-sm">AI</span>
                            </div>
                            <div className="chat-bubble-ai px-5 py-3 shadow-sm border border-border/50">
                                <p>Excellent choice! Rayar's Mess is legendary for its filter coffee and it's right near the Kapaleeshwarar Temple.<br /><br />I've updated your timeline on the right. Does this pace look comfortable, or should we add more buffer time between locations?</p>

                                {/* Interactive action chip */}
                                <div className="mt-4 flex gap-2">
                                    <Button variant="outline" size="sm" className="bg-white hover:bg-primary/5 hover:text-primary rounded-full">Pace is good</Button>
                                    <Button variant="outline" size="sm" className="bg-white hover:bg-primary/5 hover:text-primary rounded-full">Add more buffer</Button>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Chat Input Area */}
                <div className="p-4 bg-background/80 backdrop-blur-md border-t border-border z-20">
                    <div className="max-w-2xl mx-auto relative group glow-border rounded-xl shadow-sm">
                        <Input
                            className="w-full h-14 pl-5 pr-14 rounded-xl border-2 border-border bg-white focus-visible:ring-primary focus-visible:border-primary transition-all"
                            placeholder="Ask for changes, recommendations, or logistics..."
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                        />
                        <Button
                            size="icon"
                            className="absolute right-2 top-2 h-10 w-10 rounded-lg bg-primary hover:bg-primary/90 text-white shadow-sm transition-transform hover:scale-105"
                        >
                            <Send size={18} />
                        </Button>
                    </div>
                    <div className="max-w-2xl mx-auto mt-2 text-center">
                        <p className="text-xs text-muted-foreground">AI can make mistakes. Please verify important details.</p>
                    </div>
                </div>
            </div>

            {/* Right Panel - Itinerary Timeline (40%) */}
            <div className="hidden lg:flex flex-[2] flex-col min-h-0 bg-slate-50/50 relative z-10 w-2/5">
                <div className="p-4 border-b border-border bg-white sticky top-0 z-20">
                    <Tabs defaultValue="day1" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 bg-slate-100">
                            <TabsTrigger value="day1" className="data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm">Day 1 (Oct 12)</TabsTrigger>
                            <TabsTrigger value="day2" className="data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm">Day 2 (Oct 13)</TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>

                <div className="flex-1 overflow-y-auto p-6 scroll-smooth">
                    <div className="relative border-l-2 border-slate-200 ml-4 pb-8">

                        {itineraryData.map((item, index) => (
                            <div key={index} className="mb-8 relative pl-8 stager-1" style={{ animationDelay: `${index * 0.1}s` }}>
                                {/* Timeline Dot */}
                                <div className={`absolute -left-[11px] top-1 w-5 h-5 rounded-full border-4 border-white ${item.bgColor} ${item.color} flex items-center justify-center shadow-sm`}>
                                    <div className="w-2 h-2 rounded-full bg-current"></div>
                                </div>

                                <div className="flex flex-col gap-1">
                                    <div className="flex gap-2 items-center text-sm font-medium text-slate-500">
                                        <Clock size={14} />
                                        <span>{item.time}</span>
                                        <span className="text-slate-300">•</span>
                                        <span>{item.duration}</span>
                                    </div>

                                    <Card className="mt-2 border-slate-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
                                        <CardContent className="p-4 flex gap-4 items-start">
                                            <div className={`w-10 h-10 rounded-lg ${item.bgColor} ${item.color} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                                                {item.icon}
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-semibold text-slate-900 group-hover:text-primary transition-colors">{item.title}</h4>
                                                <div className="flex justify-between items-center mt-2">
                                                    <Button variant="link" size="sm" className="h-auto p-0 text-primary opacity-0 group-hover:opacity-100 transition-opacity">View Details</Button>
                                                    <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-400 hover:text-slate-900"><MoreVertical size={14} /></Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        ))}

                        {/* End indicator */}
                        <div className="absolute -left-[7px] bottom-0 w-3 h-3 rounded-full border-2 border-slate-300 bg-white"></div>
                    </div>

                    <Separator className="my-6" />

                    <div className="flex justify-between items-center text-sm text-slate-500 font-medium">
                        <span>Total Duration: 7.5 hrs</span>
                        <span>Est. Cost: ₹1,200</span>
                    </div>

                </div>

                <div className="p-4 border-t border-border bg-white sticky bottom-0 z-20">
                    <Button className="w-full bg-[#3211d4] hover:bg-[#3211d4]/90 text-white shadow-md">
                        Finalize Itinerary
                    </Button>
                </div>
            </div>

        </div>
    );
}
