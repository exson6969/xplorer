import Link from "next/link";
import { Twitter, Instagram, Github, MapPin } from "lucide-react";

export default function Footer() {
    return (
        <footer className="bg-zinc-50 border-t border-zinc-200 dark:bg-zinc-950 dark:border-zinc-800 pt-16 pb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    <div className="md:col-span-1">
                        <Link href="/" className="flex items-center gap-2 mb-4">
                            <div className="w-6 h-6 rounded bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">
                                E
                            </div>
                            <span className="font-bold text-lg text-zinc-900 dark:text-zinc-50">EXPLORER</span>
                        </Link>
                        <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-6">
                            Your intelligent companion for discovering the hidden gems and vibrant culture of Chennai.
                        </p>
                        <div className="flex gap-4">
                            <a href="#" className="text-zinc-400 hover:text-indigo-600 transition-colors">
                                <Twitter className="w-5 h-5" />
                            </a>
                            <a href="#" className="text-zinc-400 hover:text-indigo-600 transition-colors">
                                <Instagram className="w-5 h-5" />
                            </a>
                            <a href="#" className="text-zinc-400 hover:text-indigo-600 transition-colors">
                                <Github className="w-5 h-5" />
                            </a>
                        </div>
                    </div>

                    <div>
                        <h4 className="font-semibold text-zinc-900 dark:text-zinc-50 mb-4">Product</h4>
                        <ul className="space-y-3">
                            <li><Link href="/features" className="text-sm text-zinc-500 hover:text-indigo-600 dark:text-zinc-400 transition-colors">Features</Link></li>
                            <li><Link href="/stories" className="text-sm text-zinc-500 hover:text-indigo-600 dark:text-zinc-400 transition-colors">User Stories</Link></li>
                            <li><Link href="#" className="text-sm text-zinc-500 hover:text-indigo-600 dark:text-zinc-400 transition-colors">Pricing</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold text-zinc-900 dark:text-zinc-50 mb-4">Resources</h4>
                        <ul className="space-y-3">
                            <li><a href="#" className="text-sm text-zinc-500 hover:text-indigo-600 dark:text-zinc-400 transition-colors">Help Center</a></li>
                            <li><a href="#" className="text-sm text-zinc-500 hover:text-indigo-600 dark:text-zinc-400 transition-colors">City Guides</a></li>
                            <li><a href="#" className="text-sm text-zinc-500 hover:text-indigo-600 dark:text-zinc-400 transition-colors">API Docs</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold text-zinc-900 dark:text-zinc-50 mb-4">Company</h4>
                        <ul className="space-y-3">
                            <li><Link href="/about" className="text-sm text-zinc-500 hover:text-indigo-600 dark:text-zinc-400 transition-colors">About Us</Link></li>
                            <li><a href="#" className="text-sm text-zinc-500 hover:text-indigo-600 dark:text-zinc-400 transition-colors">Contact</a></li>
                            <li><a href="#" className="text-sm text-zinc-500 hover:text-indigo-600 dark:text-zinc-400 transition-colors">Privacy Policy</a></li>
                        </ul>
                    </div>
                </div>

                <div className="pt-8 border-t border-zinc-200 dark:border-zinc-800 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
                        Made with <MapPin className="w-3 h-3 text-indigo-600" /> in Chennai
                    </p>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        © {new Date().getFullYear()} EXPLORER. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}
