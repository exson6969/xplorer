import { Montserrat } from "next/font/google";
import { AuthProvider } from "../context/AuthContext";
import "./globals.css";

const montserrat = Montserrat({
    variable: "--font-montserrat",
    subsets: ["latin"],
    weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata = {
    title: "XPLORER - AI Chennai Travel",
    description: "An AI travel assistant helping users plan personalized itineraries for Chennai, India.",
};

export default function RootLayout({ children }) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />
            </head>
            <body className={`${montserrat.variable} font-sans`}>
                <AuthProvider>
                    {children}
                </AuthProvider>
            </body>
        </html>
    );
}

