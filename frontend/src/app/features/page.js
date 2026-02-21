import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Sparkles, Map, Coffee, Compass, Camera, Calendar } from "lucide-react";

export default function FeaturesPage() {
    const features = [
        {
            icon: <Sparkles className="w-8 h-8 text-indigo-500" />,
            title: "AI-Powered Itineraries",
            desc: "Get personalized day-by-day plans based on your interests, travel pace, and group size. Our AI optimizes for locations to minimize travel time."
        },
        {
            icon: <Coffee className="w-8 h-8 text-amber-500" />,
            title: "Local Culinary Secrets",
            desc: "Discover where the locals actually eat. From perfectly brewed filter coffee to hidden street food gems in Sowcarpet."
        },
        {
            icon: <Camera className="w-8 h-8 text-pink-500" />,
            title: "Hidden Photo Spots",
            desc: "Find the most photogenic locations in Chennai, complete with the best times to visit for perfect lighting and smaller crowds."
        },
        {
            icon: <Map className="w-8 h-8 text-emerald-500" />,
            title: "Smart Navigation",
            desc: "Seamlessly navigate between spots with integrated maps and local transportation tips tailored for Chennai's unique layout."
        },
        {
            icon: <Compass className="w-8 h-8 text-blue-500" />,
            title: "Heritage Deep Dives",
            desc: "Understand the deep history behind every temple and monument with AI-generated audio guides and historical context."
        },
        {
            icon: <Calendar className="w-8 h-8 text-purple-500" />,
            title: "Real-time Adjustments",
            desc: "Unexpected rain or traffic? Your itinerary adapts on the fly, suggesting indoor alternatives or rerouting dynamically."
        }
    ];

    return (
        <div className="min-h-screen flex flex-col bg-white dark:bg-zinc-950">
            <Navbar />

            <main className="flex-grow pt-32 pb-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto mb-20">
                        <h1 className="text-4xl md:text-5xl font-bold mb-6">Everything you need to <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">explore like a local</span></h1>
                        <p className="text-xl text-zinc-600 dark:text-zinc-400">Discover how our AI companion transforms your Chennai trip from typical to extraordinary.</p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {features.map((feature, i) => (
                            <div key={i} className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-8 rounded-2xl hover:shadow-lg transition-all hover:-translate-y-1">
                                <div className="w-16 h-16 bg-white dark:bg-zinc-950 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                                    {feature.icon}
                                </div>
                                <h3 className="text-2xl font-semibold mb-4">{feature.title}</h3>
                                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
