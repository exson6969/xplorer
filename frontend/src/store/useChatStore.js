import { create } from "zustand";
import { chatService, tripService, bookingService } from "../services/api";

/**
 * Helper: converts a backend message (MessageResponse) into an array of
 * two UI messages — one user bubble and one AI bubble.
 */
function toUIMessages(msg) {
    const entries = [];
    // User bubble
    entries.push({
        id: msg.message_id + "_user",
        role: "user",
        text: msg.user_input,
        submitted_data: msg.submitted_data,
        timestamp: msg.timestamp,
    });
    // AI bubble
    entries.push({
        id: msg.message_id + "_ai",
        role: "ai",
        ai_response: msg.ai_generated_output,
        timestamp: msg.timestamp,
    });
    return entries;
}

const useChatStore = create((set, get) => ({
    sessions: [],
    currentSessionId: null,
    currentMessages: [],
    currentItinerary: null,
    confirmedTrip: null,
    routeData: null,
    isLoading: false,
    hasMoreSessions: true,
    bookings: { hotels: [], transport: [] },
    error: null,

    fetchSessions: async (limit = 20) => {
        set({ isLoading: true });
        try {
            const resp = await chatService.listRecentChats(limit);
            set({ 
                sessions: resp.data, 
                hasMoreSessions: resp.data.length === limit,
                isLoading: false 
            });
        } catch (err) {
            set({ error: err.message, isLoading: false });
        }
    },

    fetchMoreSessions: async (limit = 20) => {
        const { sessions, hasMoreSessions, isLoading } = get();
        if (!hasMoreSessions || isLoading || sessions.length === 0) return;

        set({ isLoading: true });
        try {
            const lastSession = sessions[sessions.length - 1];
            const resp = await chatService.listRecentChats(limit, lastSession.updated_at);
            
            set({ 
                sessions: [...sessions, ...resp.data],
                hasMoreSessions: resp.data.length === limit,
                isLoading: false 
            });
        } catch (err) {
            set({ error: err.message, isLoading: false });
        }
    },

    setCurrentSession: async (sessionId) => {
        if (!sessionId) {
            set({ currentSessionId: null, currentMessages: [], currentItinerary: null });
            return;
        }
        set({ isLoading: true, currentSessionId: sessionId });
        try {
            const resp = await chatService.getChatDetails(sessionId);
            // Flatten each stored message into user + AI pairs
            const messages = resp.data.messages.flatMap(m => toUIMessages(m));

            // Last AI output might contain itinerary
            const lastMsg = resp.data.messages[resp.data.messages.length - 1];
            const itinerary = lastMsg?.ai_generated_output?.itinerary || null;

            set({
                currentMessages: messages,
                currentItinerary: itinerary,
                isLoading: false,
            });
        } catch (err) {
            set({ error: err.message, isLoading: false });
        }
    },

    sendMessage: async (userInput, submittedData = null) => {
        const { currentSessionId } = get();

        // Optimistic: add user bubble immediately
        const tempId = Date.now().toString();
        set(state => ({
            currentMessages: [
                ...state.currentMessages,
                { id: tempId, role: "user", text: userInput, submitted_data: submittedData, timestamp: new Date().toISOString() }
            ],
            isLoading: true,
        }));

        try {
            let msg; // The MessageResponse from the backend
            if (!currentSessionId) {
                // POST /user/chat/new → ConversationStartResponse { convo_id, first_message: MessageResponse, ... }
                const resp = await chatService.startNewChat(userInput, submittedData);
                msg = resp.data.first_message;
                set({ currentSessionId: resp.data.convo_id });
                // Refresh sidebar
                get().fetchSessions();
            } else {
                // POST /user/chat/{id}/message → MessageResponse directly
                const resp = await chatService.sendMessage(currentSessionId, userInput, submittedData);
                msg = resp.data;
            }

            // Replace the optimistic user bubble with the saved one + append AI bubble
            set(state => ({
                currentMessages: [
                    ...state.currentMessages.filter(m => m.id !== tempId),
                    {
                        id: msg.message_id + "_user",
                        role: "user",
                        text: msg.user_input,
                        submitted_data: msg.submitted_data,
                        timestamp: msg.timestamp,
                    },
                    {
                        id: msg.message_id + "_ai",
                        role: "ai",
                        ai_response: msg.ai_generated_output,
                        timestamp: msg.timestamp,
                    }
                ],
                currentItinerary: msg.ai_generated_output?.itinerary || state.currentItinerary,
                isLoading: false,
            }));

            return msg.ai_generated_output;
        } catch (err) {
            // Keep user bubble, add an error AI bubble
            const errorMsg = err.response?.data?.detail || err.message || "Something went wrong. Please try again.";
            set(state => ({
                currentMessages: [
                    ...state.currentMessages,
                    {
                        id: Date.now().toString() + "_error",
                        role: "ai",
                        ai_response: { text: `⚠️ ${errorMsg}`, itinerary: null },
                        timestamp: new Date().toISOString(),
                    }
                ],
                error: errorMsg,
                isLoading: false,
            }));
            console.error("Chat Error:", err);
            throw err;
        }
    },

    deleteSession: async (sessionId) => {
        try {
            await chatService.deleteChat(sessionId);
            set(state => ({
                sessions: state.sessions.filter(s => s.convo_id !== sessionId),
                ...(state.currentSessionId === sessionId ? { currentSessionId: null, currentMessages: [], currentItinerary: null, confirmedTrip: null, routeData: null } : {}),
            }));
        } catch (err) {
            set({ error: err.response?.data?.detail || err.message });
        }
    },

    confirmItinerary: async (placeNames, hotelName = null) => {
        set({ isLoading: true });
        try {
            const resp = await tripService.planRoute(placeNames, hotelName);
            set({
                confirmedTrip: get().currentItinerary,
                routeData: resp.data,
                isLoading: false,
            });
        } catch (err) {
            console.error("Route planning failed:", err);
            // Still show the trip planner with whatever data we have
            set({
                confirmedTrip: get().currentItinerary,
                routeData: {
                    ordered_route: placeNames,
                    legs: [],
                    total_road_time_mins: null,
                    places_detail: placeNames.map(n => ({ name: n })),
                    hotels_detail: hotelName ? [{ name: hotelName }] : [],
                    transport_options: [],
                },
                isLoading: false,
            });
        }
    },

    clearConfirmedTrip: () => {
        set({ confirmedTrip: null, routeData: null });
    },

    fetchBookings: async () => {
        set({ isLoading: true });
        try {
            const resp = await bookingService.listAllBookings();
            set({ bookings: resp.data, isLoading: false });
        } catch (err) {
            set({ error: err.message, isLoading: false });
        }
    },

    bookHotel: async (hotelData) => {
        set({ isLoading: true });
        try {
            const resp = await bookingService.bookHotel(hotelData);
            set(state => ({
                bookings: {
                    ...state.bookings,
                    hotels: [resp.data, ...state.bookings.hotels]
                },
                isLoading: false
            }));
            return resp.data;
        } catch (err) {
            set({ error: err.message, isLoading: false });
            throw err;
        }
    },

    bookTransport: async (transportData) => {
        set({ isLoading: true });
        try {
            const resp = await bookingService.bookTransport(transportData);
            set(state => ({
                bookings: {
                    ...state.bookings,
                    transport: [resp.data, ...state.bookings.transport]
                },
                isLoading: false
            }));
            return resp.data;
        } catch (err) {
            set({ error: err.message, isLoading: false });
            throw err;
        }
    },
}));

export default useChatStore;
