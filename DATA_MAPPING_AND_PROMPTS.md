# Data Mapping and Synthetic Test Prompts

This document outlines the data structure used by Xplorer AI and provides 50 synthetic prompts for testing the agent's capabilities.

## 1. Data Mapping

### 1.1 Places (`places.json` & Neo4j `:Place` nodes)
- **name**: Name of the attraction (e.g., "Marina Beach").
- **category**: Type of place (e.g., "beach", "temple", "museum").
- **description**: Brief overview of the spot.
- **location**: GPS coordinates (lat/lng) and area name.
- **timings**: Opening and closing hours.
- **visit**: Recommended duration and ideal time blocks.

### 1.2 Hotels (`hotels.json` & Neo4j `:Hotel` nodes)
- **hotel_id**: Unique identifier.
- **name**: Hotel name (e.g., "Premium Retreat ECR").
- **location**: Area name and address.
- **gps**: Latitude and longitude.
- **description**: Summary of features and amenities.
- **rooms**: Sub-list of available room types (e.g., "Deluxe", "Suite") with:
    - `price_per_night`: cost in INR.
    - `amenities`: list of room-specific features (e.g., "Pool View", "Mini Bar").

### 1.3 Transport (`transport.json` & Neo4j `:Agency`/`:Vehicle` nodes)
- **agency_name**: Name of the car rental provider.
- **overall_rating**: Customer satisfaction score.
- **vehicles**: List of available cars with:
    - `model`: Car model (e.g., "Innova Crysta").
    - `type`: Category (e.g., "SUV", "Sedan").
    - `price`: Daily rental rate.

---

## 2. 50 Synthetic Test Prompts

These prompts cover various intents including itinerary planning, hotel search, cab booking, and weather checks.

### Intent: Itinerary Planning
1. "I'm visiting Chennai for 2 days. Can you suggest a cultural heritage tour?"
2. "Plan a one-day trip focusing on the best beaches in Chennai."
3. "I have a 6-hour layover. What are the top 3 places I should visit near the airport?"
4. "I'm interested in religious sites. Create a 3-day temple trail itinerary."
5. "Suggest a fun weekend plan for a family with kids in Chennai."
6. "I love street food. Can you build an evening itinerary around the best food spots?"
7. "I want to explore the history of Chennai. Suggest a museum and fort tour."
8. "Plan a romantic getaway for a couple for 3 days."
9. "I have 4 days in Chennai. I want to see a mix of modern malls and ancient temples."
10. "Suggest a nature-focused itinerary including parks and bird sanctuaries."
11. "I'm a solo traveler. Plan a safe and interesting 2-day walking tour."
12. "Create an itinerary for a 5-day spiritual journey across Chennai's outskirts."
13. "I only have tomorrow. What's the 'must-see' list for a first-time visitor?"
14. "Suggest a 3-day itinerary that avoids heavy traffic as much as possible."
15. "I'm interested in the local arts scene. Plan a visit to music academies and art galleries."

### Intent: Hotel Search
16. "Find me a luxury hotel near Marina Beach with a pool view."
17. "Looking for a budget-friendly stay under 3000 INR per night in T. Nagar."
18. "Which hotels offer gym access and free breakfast near ECR?"
19. "I need a hotel suitable for 3 adults. Suggest some options with triple rooms."
20. "Find hotels near the Kapaleeshwarar Temple with room service."
21. "Are there any hotels with a mini-bar and bathtub in the Adyar area?"
22. "Suggest a hotel that is quiet and away from the city center noise."
23. "I need a room for tonight. What's available near the Chennai Central railway station?"
24. "Find me a hotel with high ratings for cleanliness and staff behavior."
25. "Suggest a 5-star hotel with lounge access for a business trip."

### Intent: Cab & Transport Booking
26. "I need an SUV for a group of 6 people for tomorrow. Show me options."
27. "Find me the cheapest sedan available for a full-day city tour."
28. "Looking for a premium car rental like a Mercedes or BMW. Any agencies offering this?"
29. "I need a cab with a highly-rated driver for a trip to Mahabalipuram."
30. "What are the daily rates for a hatchback rental in Chennai?"
31. "I need a cab for next Friday. Can you check the availability of Innova Crysta?"
32. "Find me a transport agency with a rating above 4.5."
33. "Suggest a car rental service that offers drivers who speak English."
34. "I need a drop-off to the airport at 4 AM. Can I book a cab now?"
35. "Are there any agencies offering electric vehicles for rental?"

### Intent: Multi-Service (Combined)
36. "I want to visit Marina Beach and then stay at a nearby hotel. Suggest both."
37. "Plan a trip to Guindy National Park and find me a cab for 4 people to get there."
38. "I'm arriving on Monday. Suggest a hotel in Mylapore and an itinerary for that afternoon."
39. "Find a hotel with a spa and plan a relaxing day at the Besant Nagar beach."
40. "I need a 2-day plan including a hotel in Nungambakkam and a sedan for local travel."

### Intent: Contextual & Weather Aware
41. "What's the weather like in Chennai next week? Is it a good time for a beach trip?"
42. "I'm planning to visit tomorrow. If it rains, what are the best indoor places to see?"
43. "Check the weather for Feb 25th and tell me if I should visit the zoo then."
44. "It's too hot today. Suggest some air-conditioned museums or malls to visit."
45. "I'm worried about the heat. Plan an early morning and late evening itinerary."

### Intent: Edge Cases & Specific Queries
46. "I want to see the sunrise at the beach. Which beach is best and what time should I be there?"
47. "Suggest places that are open after 9 PM in Chennai."
48. "I have a physical disability. Which tourist spots are most accessible?"
49. "I'm looking for a specific hotel called 'Premium Retreat'. Do you have details on it?"
50. "Can you find a place where I can see traditional Bharatanatyam dance?"
