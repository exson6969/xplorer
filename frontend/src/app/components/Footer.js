import Link from "next/link";

export default function Footer() {
    return (
        <footer className="w-full px-6 md:px-12 lg:px-20 py-10 border-t border-slate-200 bg-bg-light">
            <div className="max-w-6xl mx-auto">
                {/* Top Row */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 mb-8">
                    {/* Brand */}
                    <div className="flex flex-col gap-3">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="size-8 text-primary bg-primary/10 rounded-lg flex items-center justify-center">
                                <span className="material-symbols-outlined text-[20px]">
                                    explore
                                </span>
                            </div>
                            <span className="text-slate-900 text-lg font-bold tracking-tight">
                                EXPLORER
                            </span>
                        </Link>
                        <p className="text-sm text-slate-500 max-w-xs">
                            Your AI-powered journey through Chennai. Experience the soul of
                            the city.
                        </p>
                    </div>

                    {/* Links */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-16 gap-y-3 text-sm">
                        <div className="flex flex-col gap-2">
                            <span className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-1">
                                Product
                            </span>
                            <Link
                                href="/features"
                                className="text-slate-500 hover:text-primary transition-colors"
                            >
                                Features
                            </Link>
                            <a
                                href="#"
                                className="text-slate-500 hover:text-primary transition-colors"
                            >
                                Pricing
                            </a>
                            <a
                                href="#"
                                className="text-slate-500 hover:text-primary transition-colors"
                            >
                                API
                            </a>
                        </div>
                        <div className="flex flex-col gap-2">
                            <span className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-1">
                                Company
                            </span>
                            <Link
                                href="/about"
                                className="text-slate-500 hover:text-primary transition-colors"
                            >
                                About
                            </Link>
                            <Link
                                href="/stories"
                                className="text-slate-500 hover:text-primary transition-colors"
                            >
                                Stories
                            </Link>
                            <a
                                href="#"
                                className="text-slate-500 hover:text-primary transition-colors"
                            >
                                Careers
                            </a>
                        </div>
                        <div className="flex flex-col gap-2">
                            <span className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-1">
                                Legal
                            </span>
                            <a
                                href="#"
                                className="text-slate-500 hover:text-primary transition-colors"
                            >
                                Privacy
                            </a>
                            <a
                                href="#"
                                className="text-slate-500 hover:text-primary transition-colors"
                            >
                                Terms
                            </a>
                            <a
                                href="#"
                                className="text-slate-500 hover:text-primary transition-colors"
                            >
                                Contact
                            </a>
                        </div>
                    </div>
                </div>

                {/* Bottom Row */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-100">
                    <p className="text-sm text-slate-400">
                        © 2024 EXPLORER AI. All rights reserved.
                    </p>
                    <div className="flex gap-4">
                        <a
                            href="#"
                            className="text-slate-400 hover:text-primary transition-colors"
                        >
                            <span className="material-symbols-outlined text-[20px]">
                                public
                            </span>
                        </a>
                        <a
                            href="#"
                            className="text-slate-400 hover:text-primary transition-colors"
                        >
                            <span className="material-symbols-outlined text-[20px]">
                                share
                            </span>
                        </a>
                        <a
                            href="#"
                            className="text-slate-400 hover:text-primary transition-colors"
                        >
                            <span className="material-symbols-outlined text-[20px]">
                                mail
                            </span>
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
