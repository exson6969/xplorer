import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Image from "next/image";

export default function AboutPage() {
    return (
        <div className="min-h-screen flex flex-col bg-white dark:bg-zinc-950">
            <Navbar />

            <main className="flex-grow pt-32 pb-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-16 items-center mb-24">
                        <div>
                            <h1 className="text-4xl md:text-5xl font-bold mb-6">Our Mission</h1>
                            <p className="text-xl text-zinc-600 dark:text-zinc-400 leading-relaxed mb-6">
                                We believe travel should be deeply personal. EXPLORER was born from a desire to showcase the true, authentic Chennai—beyond the standard tourist guides.
                            </p>
                            <p className="text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed">
                                By combining local expertise with cutting-edge AI, we're making it possible for anyone to experience the city exactly how they want to, whether they have 12 hours or 12 days.
                            </p>
                        </div>
                        <div className="relative h-[500px] w-full rounded-3xl overflow-hidden shadow-2xl">
                            <Image
                                src="https://images.unsplash.com/photo-1596440409224-b1b01df222d4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
                                alt="Chennai Central Railway Station"
                                fill
                                className="object-cover"
                            />
                        </div>
                    </div>

                    <div className="text-center max-w-3xl mx-auto">
                        <h2 className="text-3xl font-bold mb-8">Built in Chennai, for the World</h2>
                        <p className="text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed">
                            Our team consists of passionate locals, data scientists, and travel enthusiasts who have spent years mapping the intricate web of this incredible city.
                        </p>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
