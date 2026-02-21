import Link from "next/link";
import { Home, Compass, Map, User, Settings, LogOut } from "lucide-react";

export default function Sidebar() {
    return (
        <aside className="w-64 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 h-screen fixed left-0 top-0 flex flex-col z-40">
            <div className="h-16 flex items-center px-6 border-b border-zinc-200 dark:border-zinc-800">
                <Link href="/" className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-indigo-800 text-white flex items-center justify-center font-bold text-xl">
                        E
                    </div>
                    <span className="font-bold text-xl tracking-tight text-zinc-900 dark:text-zinc-50">
                        EXPLORER
                    </span>
                </Link>
            </div>

            <nav className="flex-1 p-4 space-y-1">
                <Link href="/home" className="flex items-center gap-3 px-3 py-2 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-medium">
                    <Home className="w-5 h-5" />
                    Dashboard
                </Link>
                <Link href="/trips" className="flex items-center gap-3 px-3 py-2 rounded-lg text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors">
                    <Map className="w-5 h-5" />
                    My Trips
                </Link>
                <Link href="/history" className="flex items-center gap-3 px-3 py-2 rounded-lg text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors">
                    <Compass className="w-5 h-5" />
                    History
                </Link>
            </nav>

            <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 space-y-1">
                <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors">
                    <User className="w-5 h-5" />
                    Profile
                </button>
                <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors">
                    <Settings className="w-5 h-5" />
                    Settings
                </button>
                <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors mt-4">
                    <LogOut className="w-5 h-5" />
                    Sign Out
                </button>
            </div>
        </aside>
    );
}
