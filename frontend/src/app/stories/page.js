import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Image from "next/image";
import { Star } from "lucide-react";

export default function StoriesPage() {
    const stories = [
        {
            name: "Sarah Jenkins",
            type: "First-time visitor",
            quote: "EXPLORER completely changed my trip. I found this tiny, incredible silk weaving shop in Kanchipuram that I would never have discovered in any guidebook.",
            image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&w=200&h=200&fit=crop"
        },
        {
            name: "Rajesh Kumar",
            type: "Food Enthusiast",
            quote: "The culinary trail it suggested for George Town was spot on. Highly accurate recommendations that actually factor in opening times and distance.",
            image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&w=200&h=200&fit=crop"
        },
        {
            name: "Elena Rodriguez",
            type: "Architecture Photographer",
            quote: "It routed me exactly where I needed to be for the golden hour lighting at San Thome Basilica. It felt like having a local guide in my pocket.",
            image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&w=200&h=200&fit=crop"
        }
    ];

    return (
        <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950">
            <Navbar />

            <main className="flex-grow pt-32 pb-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h1 className="text-4xl md:text-5xl font-bold mb-6">Traveler Stories</h1>
                        <p className="text-xl text-zinc-600 dark:text-zinc-400">See how EXPLORER is changing the way people experience Chennai.</p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {stories.map((story, i) => (
                            <div key={i} className="bg-white dark:bg-zinc-900 p-8 rounded-3xl shadow-sm border border-zinc-200 dark:border-zinc-800 flex flex-col h-full">
                                <div className="flex text-amber-500 mb-6">
                                    {[...Array(5)].map((_, j) => <Star key={j} className="w-5 h-5 fill-current" />)}
                                </div>
                                <p className="text-lg text-zinc-700 dark:text-zinc-300 italic mb-8 flex-grow">"{story.quote}"</p>
                                <div className="flex items-center gap-4 mt-auto">
                                    <Image
                                        src={story.image}
                                        alt={story.name}
                                        width={50}
                                        height={50}
                                        className="rounded-full"
                                    />
                                    <div>
                                        <h4 className="font-semibold text-zinc-900 dark:text-zinc-50">{story.name}</h4>
                                        <span className="text-sm text-zinc-500 dark:text-zinc-400">{story.type}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
