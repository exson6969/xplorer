import axios from "axios";
import { auth } from "../lib/firebase";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const api = axios.create({
    baseURL: API_URL,
});

// Inject Bearer token into every request
api.interceptors.request.use(async (config) => {
    const user = auth.currentUser;
    if (user) {
        const token = await user.getIdToken();
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const authService = {
    register: (email, password, fullName, country) =>
        api.post("/auth/register", { email, password, full_name: fullName, country }),
    login: (email, password) => api.post("/auth/login", { email, password }),
    getProfile: () => api.get("/user/profile"),
    updateProfile: (data) => api.put("/user/profile", data),
};

export const chatService = {
    listRecentChats: (limit = 20, lastUpdatedAt = null) => {
        let url = `/user/chat/sessions?limit=${limit}`;
        if (lastUpdatedAt) url += `&last_updated_at=${encodeURIComponent(lastUpdatedAt)}`;
        return api.get(url);
    },
    getChatDetails: (sessionId) => api.get(`/user/chat/sessions/${sessionId}`),
    startNewChat: (userInput, submittedData = null) =>
        api.post("/user/chat/new", { user_input: userInput, submitted_data: submittedData }),
    sendMessage: (sessionId, userInput, submittedData = null) =>
        api.post(`/user/chat/${sessionId}/message`, { user_input: userInput, submitted_data: submittedData }),
    deleteChat: (sessionId) => api.delete(`/user/chat/sessions/${sessionId}`),
};

export const bookingService = {
    bookHotel: (data) => api.post("/user/bookings/hotels", data),
    bookTransport: (data) => api.post("/user/bookings/transport", data),
    listAllBookings: () => api.get("/user/bookings/all"),
};

export const tripService = {
    planRoute: (placeNames, hotelName = null) =>
        api.post("/user/trip/plan", { place_names: placeNames, hotel_name: hotelName }),
    getMapsKey: () => api.get("/user/maps/key"),
};

export default api;
