import Sidebar from '../components/Sidebar';

export default function AppLayout({ children }) {
    return (
        <div className="flex h-screen bg-background overflow-hidden relative">
            {/* Decorative background glows */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] pointer-events-none z-0"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-accent-orange/10 rounded-full blur-[100px] pointer-events-none z-0"></div>

            <Sidebar />
            <main className="flex-1 overflow-y-auto relative z-10">
                {children}
            </main>
        </div>
    );
}
