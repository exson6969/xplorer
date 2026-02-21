'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    Home,
    Map,
    History,
    User,
    Settings,
    ChevronLeft,
    ChevronRight,
    LogOut,
    Compass
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export default function Sidebar() {
    const [collapsed, setCollapsed] = useState(false);
    const pathname = usePathname();

    const navItems = [
        { icon: <Home size={20} />, label: 'Home', href: '/home' },
        { icon: <Map size={20} />, label: 'Trips', href: '/trips' },
        { icon: <History size={20} />, label: 'History', href: '/history' },
    ];

    const bottomItems = [
        { icon: <User size={20} />, label: 'Profile', href: '/profile' },
        { icon: <Settings size={20} />, label: 'Settings', href: '/settings' },
    ];

    return (
        <div
            className={cn(
                "h-screen bg-background border-r border-border flex flex-col transition-all duration-300 relative z-20",
                collapsed ? "w-[80px]" : "w-[260px]"
            )}
        >
            <div className="p-4 flex items-center justify-between min-h-[80px]">
                {!collapsed && (
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white shrink-0 group-hover:shadow-[0_0_15px_rgba(50,17,212,0.5)] transition-all">
                            <Compass size={20} className="group-hover:animate-[spin_4s_linear_infinite]" />
                        </div>
                        <span className="font-bold text-xl tracking-tight gradient-text">EXPLORER</span>
                    </Link>
                )}
                {collapsed && (
                    <div className="w-full flex justify-center">
                        <Link href="/" className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center text-white shrink-0 hover:shadow-[0_0_15px_rgba(50,17,212,0.5)] transition-all">
                            <Compass size={24} className="hover:animate-[spin_4s_linear_infinite]" />
                        </Link>
                    </div>
                )}
            </div>

            <Button
                variant="ghost"
                size="icon"
                className="absolute -right-3 top-6 h-6 w-6 rounded-full border border-border bg-background shadow-md z-30"
                onClick={() => setCollapsed(!collapsed)}
            >
                {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            </Button>

            <div className="flex-1 px-3 py-6 flex flex-col gap-2 overflow-y-auto">
                <TooltipProvider delayDuration={0}>
                    {navItems.map((item) => {
                        const isActive = pathname.startsWith(item.href);

                        return (
                            <Tooltip key={item.label}>
                                <TooltipTrigger asChild>
                                    <Link href={item.href}>
                                        <Button
                                            variant={isActive ? "secondary" : "ghost"}
                                            className={cn(
                                                "w-full justify-start h-12 transition-all",
                                                collapsed ? "px-0 justify-center" : "px-4",
                                                isActive ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-muted/50"
                                            )}
                                        >
                                            <div className={cn("shrink-0", isActive && "text-primary")}>
                                                {item.icon}
                                            </div>
                                            {!collapsed && <span className="ml-3">{item.label}</span>}
                                        </Button>
                                    </Link>
                                </TooltipTrigger>
                                {collapsed && <TooltipContent side="right">{item.label}</TooltipContent>}
                            </Tooltip>
                        );
                    })}
                </TooltipProvider>
            </div>

            <div className="p-3 border-t border-border flex flex-col gap-2">
                <TooltipProvider delayDuration={0}>
                    {bottomItems.map((item) => {
                        const isActive = pathname.startsWith(item.href);
                        return (
                            <Tooltip key={item.label}>
                                <TooltipTrigger asChild>
                                    <Link href={item.href}>
                                        <Button
                                            variant="ghost"
                                            className={cn(
                                                "w-full justify-start h-10",
                                                collapsed ? "px-0 justify-center" : "px-4",
                                                isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted/50"
                                            )}
                                        >
                                            <div className="shrink-0">{item.icon}</div>
                                            {!collapsed && <span className="ml-3">{item.label}</span>}
                                        </Button>
                                    </Link>
                                </TooltipTrigger>
                                {collapsed && <TooltipContent side="right">{item.label}</TooltipContent>}
                            </Tooltip>
                        );
                    })}

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                className={cn(
                                    "w-full justify-start h-10 text-muted-foreground hover:text-destructive hover:bg-destructive/10 mt-2",
                                    collapsed ? "px-0 justify-center" : "px-4"
                                )}
                            >
                                <div className="shrink-0"><LogOut size={20} /></div>
                                {!collapsed && <span className="ml-3">Log Out</span>}
                            </Button>
                        </TooltipTrigger>
                        {collapsed && <TooltipContent side="right">Log Out</TooltipContent>}
                    </Tooltip>
                </TooltipProvider>
            </div>
        </div>
    );
}
