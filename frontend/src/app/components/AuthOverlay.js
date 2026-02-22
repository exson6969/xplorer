"use client";

import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { authService } from "../../services/api";
import { X, Mail, Lock, User, Globe, Loader2, CheckCircle2 } from "lucide-react";

export default function AuthOverlay({ isOpen, onClose }) {
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [registrationSuccess, setRegistrationSuccess] = useState(false);

    const [formData, setFormData] = useState({
        email: "",
        password: "",
        fullName: "",
        country: "India"
    });

    const { login } = useAuth();

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            if (isLogin) {
                // Login via Firebase client SDK — API interceptor will then use the token
                await login(formData.email, formData.password);
                onClose();
            } else {
                // Register via backend (creates Firebase Auth user + Firestore profile + sends verification email)
                await authService.register(formData.email, formData.password, formData.fullName, formData.country);
                // Show success — don't auto-login because email verification is required
                setRegistrationSuccess(true);
            }
        } catch (err) {
            console.error(err);
            let msg = err.response?.data?.detail || err.message || "Authentication failed";
            if (msg.includes("invalid-credential") || msg.includes("INVALID_LOGIN_CREDENTIALS") || msg.includes("auth/invalid-credential")) {
                msg = "Invalid email or password. If you haven't created an account yet, please switch to Sign Up.";
            }
            if (msg.includes("email-already") || msg.includes("EMAIL_EXISTS") || msg.includes("409")) {
                msg = "This email is already registered. Try signing in instead.";
            }
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    // Post-registration success screen
    if (registrationSuccess) {
        return (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-zinc-950/60 backdrop-blur-sm" onClick={onClose} />
                <div className="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 animate-in fade-in zoom-in duration-300">
                    <div className="p-10 text-center">
                        <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-3">Account Created!</h2>
                        <p className="text-zinc-500 dark:text-zinc-400 mb-8 leading-relaxed">
                            A verification link has been sent to <strong className="text-zinc-700 dark:text-zinc-200">{formData.email}</strong>.
                            Please verify your email before signing in.
                        </p>
                        <button
                            onClick={() => {
                                setRegistrationSuccess(false);
                                setIsLogin(true);
                            }}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-indigo-500/25"
                        >
                            Go to Sign In
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-zinc-950/60 backdrop-blur-sm" onClick={onClose} />

            <div className="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 animate-in fade-in zoom-in duration-300">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="p-8">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">
                            {isLogin ? "Welcome Back" : "Start Your Journey"}
                        </h2>
                        <p className="text-zinc-500 dark:text-zinc-400">
                            {isLogin ? "Sign in to continue exploring Chennai" : "Create an account for personalized itineraries"}
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-xl text-red-600 dark:text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {!isLogin && (
                            <>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                                    <input
                                        type="text"
                                        placeholder="Full Name"
                                        required
                                        className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl py-3 pl-12 pr-4 outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                                        value={formData.fullName}
                                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                    />
                                </div>
                                <div className="relative">
                                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                                    <input
                                        type="text"
                                        placeholder="Country"
                                        required
                                        className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl py-3 pl-12 pr-4 outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                                        value={formData.country}
                                        onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                                    />
                                </div>
                            </>
                        )}

                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                            <input
                                type="email"
                                placeholder="Email Address"
                                required
                                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl py-3 pl-12 pr-4 outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>

                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                            <input
                                type="password"
                                placeholder="Password"
                                required
                                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl py-3 pl-12 pr-4 outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isLogin ? "Sign In" : "Create Account")}
                        </button>
                    </form>

                    <div className="mt-8 text-center text-sm text-zinc-500">
                        {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
                        <button
                            onClick={() => { setIsLogin(!isLogin); setError(""); }}
                            className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
                        >
                            {isLogin ? "Sign Up" : "Log In"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

