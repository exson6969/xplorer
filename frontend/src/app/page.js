"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles, Map, Coffee, Star, Quote } from "lucide-react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-zinc-950">
      <Navbar />

      <main className="flex-grow pt-24">
        {/* Animated Hero Section */}
        <section className="relative overflow-hidden px-4 sm:px-6 lg:px-8 pt-20 pb-32 max-w-7xl mx-auto">
          {/* Background Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/10 dark:bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none" />

          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Value Proposition */}
            <div className="relative z-10 flex flex-col items-start text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-sm font-medium mb-8">
                <Sparkles className="w-4 h-4" />
                <span>AI-Powered Travel</span>
              </div>

              <h1 className="text-5xl lg:text-7xl font-bold tracking-tight text-zinc-900 dark:text-white mb-6 leading-[1.1]">
                Chennai,<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
                  Reimagined.
                </span>
              </h1>

              <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-10 max-w-xl leading-relaxed">
                Discover the soul of the city with personalized itineraries, hidden local gems, and intelligent suggestions crafted just for you in seconds.
              </p>

              <div className="flex flex-col sm:flex-row w-full max-w-md gap-4">
                <Link
                  href="/home"
                  className="flex-1 flex justify-center items-center gap-2 bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-900 px-8 py-4 rounded-full font-medium transition-transform hover:scale-105"
                >
                  Start Exploring
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/features"
                  className="flex-1 flex justify-center items-center px-8 py-4 rounded-full font-medium text-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
                >
                  See Features
                </Link>
              </div>

              {/* Social Proof */}
              <div className="mt-12 flex items-center gap-4">
                <div className="flex -space-x-3">
                  {[
                    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&w=100&h=100&fit=crop",
                    "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-4.0.3&w=100&h=100&fit=crop",
                    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&w=100&h=100&fit=crop",
                    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&w=100&h=100&fit=crop"
                  ].map((url, i) => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-white dark:border-zinc-950 bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
                      <Image
                        src={url}
                        alt="User avatar"
                        width={40}
                        height={40}
                      />
                    </div>
                  ))}
                </div>
                <div className="flex flex-col">
                  <div className="flex text-amber-500 mb-1">
                    {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                  </div>
                  <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                    Trusted by 10,000+ travelers
                  </span>
                </div>
              </div>
            </div>

            {/* Floating Visuals */}
            <div className="relative h-[600px] hidden lg:block perspective-1000">
              <div className="absolute top-10 right-0 w-72 h-96 rounded-2xl overflow-hidden shadow-2xl shadow-indigo-500/20 transform rotate-6 hover:rotate-3 transition-transform duration-500 hover:-translate-y-2">
                <Image
                  src="https://images.unsplash.com/photo-1582510003544-4d00b7f74220?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                  alt="Kapaleeshwarar Temple"
                  fill
                  className="object-cover"
                />
                <div className="absolute bottom-4 left-4 right-4 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md p-3 rounded-xl shadow-lg border border-white/20">
                  <p className="font-semibold text-sm mb-1">Kapaleeshwarar Temple</p>
                  <p className="text-xs text-zinc-500 flex items-center gap-1"><Map className="w-3 h-3" /> Heritage Walk</p>
                </div>
              </div>

              <div className="absolute bottom-20 left-10 w-64 h-80 rounded-2xl overflow-hidden shadow-2xl shadow-purple-500/20 transform -rotate-3 hover:rotate-0 transition-transform duration-500 hover:-translate-y-2 z-20">
                <Image
                  src="https://images.unsplash.com/photo-1514222365289-40eafe525e98?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                  alt="Filter Coffee"
                  fill
                  className="object-cover"
                />
                <div className="absolute bottom-4 left-4 right-4 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md p-3 rounded-xl shadow-lg border border-white/20">
                  <p className="font-semibold text-sm mb-1">Authentic Filter Filter</p>
                  <p className="text-xs text-zinc-500 flex items-center gap-1"><Coffee className="w-3 h-3" /> Culinary Trail</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Highlights */}
        <section className="bg-zinc-50 dark:bg-zinc-900 py-24 border-y border-zinc-200 dark:border-zinc-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">Travel Smarter, Not Harder</h2>
              <p className="text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">Everything you need to experience Chennai like a true local, powered by cutting-edge AI.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: <Sparkles className="w-6 h-6 text-indigo-500" />,
                  title: "Smart Itineraries",
                  desc: "Tell us what you love, and we'll craft the perfect day-by-day plan optimized for travel time."
                },
                {
                  icon: <Coffee className="w-6 h-6 text-amber-500" />,
                  title: "Local Secrets",
                  desc: "Skip the tourist traps. We guide you to the authentic spots locals cherish."
                },
                {
                  icon: <Map className="w-6 h-6 text-emerald-500" />,
                  title: "Live Adaptation",
                  desc: "Plans change? Get instant alternatives based on real-time weather and crowd data."
                }
              ].map((feature, i) => (
                <div key={i} className="bg-white dark:bg-zinc-950 p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-zinc-50 dark:bg-zinc-900 rounded-xl flex items-center justify-center mb-6">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
