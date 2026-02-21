import asyncio
import os
import json
from unittest.mock import MagicMock, patch
from dotenv import load_dotenv

# Mock services before importing XplorerAI to avoid Firebase/Firestore dependencies if possible
# or just patch it during the test.

import services.travel_ai_service
from config.firebase import init_firebase

# Ensure .env is loaded
load_dotenv()

async def test_ai():
    # Use a real initialization but mock the specific profile call
    try:
        init_firebase()
    except Exception as e:
        print(f"Skipping Firebase init (might be okay if mocked): {e}")
    
    uid = "test_user_id"
    
    # We patch 'get_user_profile' inside the travel_ai_service module
    mock_profile = {
        "full_name": "Test Traveler",
        "country": "India",
        "interests": ["beaches", "temples"],
        "travel_style": "relaxing"
    }
    
    with patch("services.travel_ai_service.get_user_profile", return_value=mock_profile):
        from services.travel_ai_service import XplorerAI
        ai = XplorerAI(uid)
        
        history = {"messages": []}
        user_input = "I want to plan a 2-day trip to Chennai. I like beaches and temples."
        
        print(f"User: {user_input}")
        response = await ai.process_chat(user_input, history)
        
        if "error" in response:
            print(f"AI Error: {response['error']}")
        else:
            print(f"AI Response Text: {response.get('text')}")
            if response.get('itinerary'):
                print(f"Itinerary Found!")
                # print(json.dumps(response['itinerary'], indent=2))

if __name__ == "__main__":
    asyncio.run(test_ai())
