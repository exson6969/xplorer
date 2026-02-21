from pydantic import BaseModel

class HotelBookingRequest(BaseModel):
    hotel_id: str
    hotel_name: str
    location: str
    room_type: str                  # e.g. Deluxe, Executive, Luxury
    check_in_date: str              # YYYY-MM-DD
    check_out_date: str             # YYYY-MM-DD


class HotelBookingResponse(BaseModel):
    booking_id: str
    hotel_id: str
    hotel_name: str
    location: str
    room_type: str
    check_in_date: str
    check_out_date: str
    booked_at: str


class TransportBookingRequest(BaseModel):
    agency_name: str
    vehicle_category: str           # e.g. Cab, Bike
    vehicle_type: str               # e.g. Sedan, SUV, Scooter
    model: str                      # e.g. Toyota Innova
    trip_date: str                  # YYYY-MM-DD


class TransportBookingResponse(BaseModel):
    booking_id: str
    agency_name: str
    vehicle_category: str
    vehicle_type: str
    model: str
    trip_date: str
    booked_at: str
