from datetime import datetime, timedelta
from app.core.database import SessionLocal, Base, engine
from app.core.security import get_password_hash
from app.models.entities import (
    User, UserVerification, Vehicle, Ride, RideStop, Booking, Payment, Message,
    Review, Notification, Report
)


def seed_database():
    print("🌱 Starting CoRide database seeding...")
    # Re-create tables
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        # 1. Admin user
        admin = User(
            id="usr-admin-01",
            name="CoRide Admin",
            email="admin@coride.com",
            phone="+919876543210",
            password_hash=get_password_hash("admin123"),
            photo_url="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
            bio="Lead Platform Administrator & Trust Officer at CoRide.",
            is_driver=True,
            is_admin=True,
            rating_avg=5.0,
            trips_count=120,
            email_verified=True,
            phone_verified=True,
            status="ACTIVE"
        )
        db.add(admin)

        # 2. Drivers
        driver_priya = User(
            id="usr-driver-priya",
            name="Priya Sharma",
            email="priya.sharma@example.com",
            phone="+919811223344",
            password_hash=get_password_hash("password123"),
            photo_url="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80",
            bio="Tech consultant commuting between Bangalore & Mysore on weekends. Clean car, pleasant music, smooth driving.",
            emergency_contact="+919811223399",
            is_driver=True,
            is_admin=False,
            rating_avg=4.9,
            trips_count=48,
            email_verified=True,
            phone_verified=True,
            status="ACTIVE"
        )
        db.add(driver_priya)

        driver_arjun = User(
            id="usr-driver-arjun",
            name="Arjun Mehta",
            email="arjun.mehta@example.com",
            phone="+919822334455",
            password_hash=get_password_hash("password123"),
            photo_url="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
            bio="Product Designer traveling Mumbai - Pune Expressway 3 times a week. Punctual and friendly.",
            emergency_contact="+919822334400",
            is_driver=True,
            is_admin=False,
            rating_avg=4.8,
            trips_count=34,
            email_verified=True,
            phone_verified=True,
            status="ACTIVE"
        )
        db.add(driver_arjun)

        driver_sarah = User(
            id="usr-driver-sarah",
            name="Sarah Jenkins",
            email="sarah.jenkins@example.com",
            phone="+14155552671",
            password_hash=get_password_hash("password123"),
            photo_url="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80",
            bio="Software engineer driving down to Silicon Valley for office days. Love quiet commutes or podcasts.",
            emergency_contact="+14155559999",
            is_driver=True,
            is_admin=False,
            rating_avg=5.0,
            trips_count=21,
            email_verified=True,
            phone_verified=True,
            status="ACTIVE"
        )
        db.add(driver_sarah)

        # 3. Riders
        rider_rahul = User(
            id="usr-rider-rahul",
            name="Rahul Verma",
            email="rahul.verma@example.com",
            phone="+919833445566",
            password_hash=get_password_hash("password123"),
            photo_url="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
            bio="Marketing lead. Frequent weekend traveler and carpool enthusiast.",
            emergency_contact="+919833445500",
            is_driver=False,
            is_admin=False,
            rating_avg=4.9,
            trips_count=16,
            email_verified=True,
            phone_verified=True,
            status="ACTIVE"
        )
        db.add(rider_rahul)

        rider_ananya = User(
            id="usr-rider-ananya",
            name="Ananya Deshmukh",
            email="ananya.deshmukh@example.com",
            phone="+919844556677",
            password_hash=get_password_hash("password123"),
            photo_url="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80",
            bio="University student traveling between Pune and Mumbai for classes and events.",
            emergency_contact="+919844556611",
            is_driver=False,
            is_admin=False,
            rating_avg=5.0,
            trips_count=9,
            email_verified=True,
            phone_verified=True,
            status="ACTIVE"
        )
        db.add(rider_ananya)

        db.commit()

        # 4. Vehicles
        veh_nexon = Vehicle(
            id="veh-nexon-01",
            owner_id=driver_priya.id,
            make="Tata",
            model="Nexon EV Max",
            year=2023,
            color="Teal Blue",
            registration_no="KA01AB1234",
            seats_total=3,
            image_url="https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=800&q=80",
            ac=True,
            luggage_capacity="MEDIUM",
            smoking_allowed=False,
            pets_allowed=True,
            verified="VERIFIED"
        )
        db.add(veh_nexon)

        veh_creta = Vehicle(
            id="veh-creta-02",
            owner_id=driver_arjun.id,
            make="Hyundai",
            model="Creta SX",
            year=2024,
            color="Knight Black",
            registration_no="MH12CD5678",
            seats_total=4,
            image_url="https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80",
            ac=True,
            luggage_capacity="LARGE",
            smoking_allowed=False,
            pets_allowed=False,
            verified="VERIFIED"
        )
        db.add(veh_creta)

        veh_tesla = Vehicle(
            id="veh-tesla-03",
            owner_id=driver_sarah.id,
            vehicle_type="CAR",
            make="Tesla",
            model="Model 3",
            year=2023,
            color="Pearl White",
            registration_no="CA8X992",
            seats_total=3,
            image_url="https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=800&q=80",
            ac=True,
            helmet_provided=False,
            luggage_capacity="MEDIUM",
            smoking_allowed=False,
            pets_allowed=False,
            verified="VERIFIED"
        )
        db.add(veh_tesla)

        veh_bike_re = Vehicle(
            id="veh-re-04",
            owner_id=driver_priya.id,
            vehicle_type="BIKE",
            make="Royal Enfield",
            model="Classic 350 Reborn",
            year=2024,
            color="Stealth Black",
            registration_no="KA05RE3500",
            seats_total=1,
            image_url="https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=800&q=80",
            ac=False,
            helmet_provided=True,
            luggage_capacity="SMALL",
            smoking_allowed=False,
            pets_allowed=False,
            verified="VERIFIED"
        )
        db.add(veh_bike_re)

        veh_bike_activa = Vehicle(
            id="veh-activa-05",
            owner_id=driver_arjun.id,
            vehicle_type="BIKE",
            make="Honda",
            model="Activa 6G Premium",
            year=2024,
            color="Matte Axis Grey",
            registration_no="MH12AC6000",
            seats_total=1,
            image_url="https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=800&q=80",
            ac=False,
            helmet_provided=True,
            luggage_capacity="SMALL",
            smoking_allowed=False,
            pets_allowed=False,
            verified="VERIFIED"
        )
        db.add(veh_bike_activa)

        db.commit()

        # 5. Verifications
        verif1 = UserVerification(
            id="verif-priya-01",
            user_id=driver_priya.id,
            type="DRIVER_LICENSE",
            document_url="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80",
            document_number="KA012019001428",
            status="VERIFIED",
            reviewed_by=admin.id,
            reviewed_at=datetime.utcnow() - timedelta(days=60)
        )
        db.add(verif1)

        verif2 = UserVerification(
            id="verif-arjun-02",
            user_id=driver_arjun.id,
            type="DRIVER_LICENSE",
            document_url="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80",
            document_number="MH122020008819",
            status="VERIFIED",
            reviewed_by=admin.id,
            reviewed_at=datetime.utcnow() - timedelta(days=40)
        )
        db.add(verif2)

        verif_pending = UserVerification(
            id="verif-pending-03",
            user_id=rider_rahul.id,
            type="DRIVER_LICENSE",
            document_url="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80",
            document_number="DL042022009941",
            status="PENDING"
        )
        db.add(verif_pending)

        db.commit()

        # 6. Rides
        now = datetime.utcnow()
        ride_blr_mys = Ride(
            id="ride-blr-mys-01",
            driver_id=driver_priya.id,
            vehicle_id=veh_nexon.id,
            origin_text="Bangalore (Koramangala)",
            destination_text="Mysore (Suburban Bus Stand)",
            origin_lat=12.9352,
            origin_lng=77.6245,
            destination_lat=12.3072,
            destination_lng=76.6558,
            departure_at=now + timedelta(days=1, hours=2),
            estimated_arrival=now + timedelta(days=1, hours=5, minutes=15),
            seats_total=3,
            seats_available=2,  # 1 seat will be booked by Rahul
            price_per_seat=320.0,
            status="PUBLISHED",
            booking_mode="INSTANT",
            luggage_size="MEDIUM",
            ac=True,
            smoking_allowed=False,
            pets_allowed=True,
            notes="Electric SUV with fast AC, smooth non-stop expressway drive. Can stop briefly at Ramanagara for coffee if requested."
        )
        db.add(ride_blr_mys)
        db.flush()

        # Stops for Bangalore-Mysore
        stop1 = RideStop(
            ride_id=ride_blr_mys.id,
            stop_order=1,
            place_name="Ramanagara (Coffee Stop)",
            lat=12.7209,
            lng=77.2799,
            planned_at=now + timedelta(days=1, hours=3, minutes=15),
            price_from_origin=150.0,
            pickup_allowed=True,
            drop_allowed=True
        )
        stop2 = RideStop(
            ride_id=ride_blr_mys.id,
            stop_order=2,
            place_name="Mandya Expressway Exit",
            lat=12.5218,
            lng=76.8951,
            planned_at=now + timedelta(days=1, hours=4, minutes=10),
            price_from_origin=220.0,
            pickup_allowed=True,
            drop_allowed=True
        )
        db.add(stop1)
        db.add(stop2)

        # Ride 2: Mumbai -> Pune
        ride_mum_pun = Ride(
            id="ride-mum-pun-02",
            driver_id=driver_arjun.id,
            vehicle_id=veh_creta.id,
            origin_text="Mumbai (Bandra West)",
            destination_text="Pune (Hinjawadi Phase 1)",
            origin_lat=19.0596,
            origin_lng=72.8295,
            destination_lat=18.5913,
            destination_lng=73.7389,
            departure_at=now + timedelta(days=1, hours=6),
            estimated_arrival=now + timedelta(days=1, hours=9, minutes=30),
            seats_total=4,
            seats_available=4,
            price_per_seat=350.0,
            status="PUBLISHED",
            booking_mode="INSTANT",
            luggage_size="LARGE",
            ac=True,
            smoking_allowed=False,
            pets_allowed=False,
            notes="Driving via Mumbai-Pune Expressway. Drop directly at IT parks in Hinjawadi or Wakad flyover."
        )
        db.add(ride_mum_pun)
        db.flush()

        stop_mum_1 = RideStop(
            ride_id=ride_mum_pun.id,
            stop_order=1,
            place_name="Navi Mumbai (Vashi Plaza)",
            lat=19.0771,
            lng=72.9986,
            planned_at=now + timedelta(days=1, hours=6, minutes=45),
            price_from_origin=100.0,
            pickup_allowed=True,
            drop_allowed=True
        )
        stop_mum_2 = RideStop(
            ride_id=ride_mum_pun.id,
            stop_order=2,
            place_name="Lonavala Food Mall",
            lat=18.7557,
            lng=73.4091,
            planned_at=now + timedelta(days=1, hours=8, minutes=0),
            price_from_origin=220.0,
            pickup_allowed=True,
            drop_allowed=True
        )
        db.add(stop_mum_1)
        db.add(stop_mum_2)

        # Ride 3: Delhi -> Jaipur
        ride_del_jai = Ride(
            id="ride-del-jai-03",
            driver_id=driver_priya.id,
            vehicle_id=veh_nexon.id,
            origin_text="Delhi (Connaught Place)",
            destination_text="Jaipur (Sindhi Camp)",
            origin_lat=28.6315,
            origin_lng=77.2167,
            destination_lat=26.9208,
            destination_lng=75.8000,
            departure_at=now + timedelta(days=2, hours=1),
            estimated_arrival=now + timedelta(days=2, hours=6),
            seats_total=3,
            seats_available=3,
            price_per_seat=480.0,
            status="PUBLISHED",
            booking_mode="INSTANT",
            luggage_size="MEDIUM",
            ac=True,
            smoking_allowed=False,
            pets_allowed=False,
            women_only=False,
            notes="Morning departure. Highway driving with clean rest stops."
        )
        db.add(ride_del_jai)

        # Ride 4: San Francisco -> San Jose
        ride_sf_sjc = Ride(
            id="ride-sf-sjc-04",
            driver_id=driver_sarah.id,
            vehicle_id=veh_tesla.id,
            ride_type="CARPOOL",
            origin_text="San Francisco (Financial District)",
            destination_text="San Jose (Downtown)",
            origin_lat=37.7946,
            origin_lng=-122.3999,
            destination_lat=37.3382,
            destination_lng=-121.8863,
            departure_at=now + timedelta(days=1, hours=3),
            estimated_arrival=now + timedelta(days=1, hours=4, minutes=15),
            seats_total=3,
            seats_available=3,
            price_per_seat=18.0,
            status="PUBLISHED",
            booking_mode="INSTANT",
            luggage_size="MEDIUM",
            ac=True,
            helmet_provided=False,
            notes="Carpool lane express down US-101. Music or quiet work as you prefer."
        )
        db.add(ride_sf_sjc)

        # Ride 5: Bike Pool - Bangalore (Koramangala) -> Electronic City
        ride_bike_blr = Ride(
            id="ride-bike-blr-05",
            driver_id=driver_priya.id,
            vehicle_id=veh_bike_re.id,
            ride_type="BIKEPOOL",
            origin_text="Bangalore (Koramangala)",
            destination_text="Bangalore (Electronic City)",
            origin_lat=12.9352,
            origin_lng=77.6245,
            destination_lat=12.8452,
            destination_lng=77.6602,
            departure_at=now + timedelta(days=1, hours=1),
            estimated_arrival=now + timedelta(days=1, hours=1, minutes=35),
            seats_total=1,
            seats_available=1,
            price_per_seat=110.0,
            status="PUBLISHED",
            booking_mode="INSTANT",
            luggage_size="SMALL",
            ac=False,
            helmet_provided=True,
            smoking_allowed=False,
            pets_allowed=False,
            women_only=False,
            notes="Quick bike commute via Silk Board flyover. Clean spare ISI-certified helmet provided."
        )
        db.add(ride_bike_blr)

        # Ride 6: Bike Pool - Pune (Shivajinagar) -> Hinjawadi Phase 1
        ride_bike_pune = Ride(
            id="ride-bike-pune-06",
            driver_id=driver_arjun.id,
            vehicle_id=veh_bike_activa.id,
            ride_type="BIKEPOOL",
            origin_text="Pune (Shivajinagar)",
            destination_text="Pune (Hinjawadi Phase 1)",
            origin_lat=18.5308,
            origin_lng=73.8475,
            destination_lat=18.5913,
            destination_lng=73.7389,
            departure_at=now + timedelta(days=1, hours=2),
            estimated_arrival=now + timedelta(days=1, hours=2, minutes=40),
            seats_total=1,
            seats_available=1,
            price_per_seat=85.0,
            status="PUBLISHED",
            booking_mode="INSTANT",
            luggage_size="SMALL",
            ac=False,
            helmet_provided=True,
            smoking_allowed=False,
            pets_allowed=False,
            women_only=False,
            notes="Daily IT park bike commute. Skip highway traffic easily. Spare helmet ready."
        )
        db.add(ride_bike_pune)

        # Ride 7: Completed historical ride
        ride_completed = Ride(
            id="ride-completed-07",
            driver_id=driver_priya.id,
            vehicle_id=veh_nexon.id,
            ride_type="CARPOOL",
            origin_text="Bangalore (Indiranagar)",
            destination_text="Mysore (Palace Gate)",
            origin_lat=12.9784,
            origin_lng=77.6408,
            destination_lat=12.3052,
            destination_lng=76.6552,
            departure_at=now - timedelta(days=3),
            estimated_arrival=now - timedelta(days=3, hours=-3, minutes=-15),
            seats_total=3,
            seats_available=0,
            price_per_seat=300.0,
            status="COMPLETED",
            booking_mode="INSTANT",
            ac=True,
            helmet_provided=False,
            driver_arrived_at=now - timedelta(days=3, minutes=15),
            started_at=now - timedelta(days=3),
            completed_at=now - timedelta(days=3, hours=-3, minutes=-10)
        )
        db.add(ride_completed)
        db.commit()

        # 7. Bookings
        booking_upcoming = Booking(
            id="bk-upcoming-01",
            booking_code="CR-BLR001",
            ride_id=ride_blr_mys.id,
            rider_id=rider_rahul.id,
            seats=1,
            pickup_stop_name="Bangalore (Koramangala)",
            drop_stop_name="Mysore (Suburban Bus Stand)",
            subtotal=320.0,
            service_fee=25.6,
            total=345.6,
            status="CONFIRMED",
            booked_at=now - timedelta(hours=4)
        )
        db.add(booking_upcoming)
        db.flush()

        # Payment for booking
        pay1 = Payment(
            id="pay-01",
            booking_id=booking_upcoming.id,
            provider="razorpay",
            provider_order_id="order_CR_BLR001",
            provider_payment_id="pay_sim_blr001",
            amount=345.6,
            currency="INR",
            status="CAPTURED",
            webhook_verified=True
        )
        db.add(pay1)

        # Chat messages for booking
        msg1 = Message(
            booking_id=booking_upcoming.id,
            sender_id=driver_priya.id,
            sender_name=driver_priya.name,
            body="Hi Rahul! Thanks for booking. I will pick you up at Koramangala Sony World signal.",
            created_at=now - timedelta(hours=3, minutes=30)
        )
        msg2 = Message(
            booking_id=booking_upcoming.id,
            sender_id=rider_rahul.id,
            sender_name=rider_rahul.name,
            body="Perfect Priya! I will be waiting there with a small backpack. See you tomorrow at 8:30 AM.",
            created_at=now - timedelta(hours=3, minutes=15)
        )
        db.add(msg1)
        db.add(msg2)

        # Historical completed booking
        booking_past = Booking(
            id="bk-past-02",
            booking_code="CR-PST991",
            ride_id=ride_completed.id,
            rider_id=rider_rahul.id,
            seats=1,
            pickup_stop_name="Bangalore (Indiranagar)",
            drop_stop_name="Mysore (Palace Gate)",
            subtotal=300.0,
            service_fee=24.0,
            total=324.0,
            status="COMPLETED",
            booked_at=now - timedelta(days=4)
        )
        db.add(booking_past)
        db.flush()

        pay2 = Payment(
            id="pay-02",
            booking_id=booking_past.id,
            provider="razorpay",
            provider_order_id="order_CR_PST991",
            provider_payment_id="pay_sim_pst991",
            amount=324.0,
            currency="INR",
            status="CAPTURED",
            webhook_verified=True
        )
        db.add(pay2)

        # Review for past booking
        rev1 = Review(
            id="rev-01",
            booking_id=booking_past.id,
            reviewer_id=rider_rahul.id,
            reviewee_id=driver_priya.id,
            rating=5,
            text="Outstanding ride with Priya! On time, EV was super quiet and comfortable, and conversation was great.",
            punctuality_rating=5,
            driving_rating=5,
            cleanliness_rating=5,
            communication_rating=5,
            created_at=now - timedelta(days=3, hours=-4)
        )
        db.add(rev1)

        # 8. Notifications
        notif1 = Notification(
            id="notif-01",
            user_id=rider_rahul.id,
            type="BOOKING_CONFIRMED",
            title="Ride Booked Successfully!",
            body="Your seat on Bangalore -> Mysore is confirmed. Booking Code: CR-BLR001",
            created_at=now - timedelta(hours=4)
        )
        notif2 = Notification(
            id="notif-02",
            user_id=driver_priya.id,
            type="BOOKING_NEW",
            title="New Seat Reservation!",
            body="Rahul Verma booked 1 seat on your ride to Mysore.",
            created_at=now - timedelta(hours=4)
        )
        db.add(notif1)
        db.add(notif2)

        # 9. Sample safety report
        rep1 = Report(
            id="rep-01",
            reporter_id=rider_ananya.id,
            target_user_id=driver_arjun.id,
            category="OTHER",
            details="Inquiry regarding luggage capacity for university musical instruments.",
            status="RESOLVED",
            admin_notes="Confirmed driver vehicle has large boot space suitable for cello/guitar case."
        )
        db.add(rep1)

        db.commit()
        print("✅ CoRide database successfully seeded with demo accounts & live rides!")

    except Exception as e:
        db.rollback()
        print(f"❌ Error seeding database: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
