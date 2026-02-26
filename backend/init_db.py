"""
Script to initialize the database tables and create an admin user.
Run this script after creating the database.
"""

import sys
sys.path.insert(0, '.')

from datetime import datetime, timedelta
from decimal import Decimal
import random

from app.core.database import engine, Base, SessionLocal
from app.core.security import get_password_hash
from app.core.permissions import UserRole

# Import all models to register them with Base
from app.models.user import User
from app.models.pre_lead import PreLead, PreLeadSource
from app.models.lead import Lead, LeadSource, LeadPriority
from app.models.customer import Customer
from app.models.contact import Contact
from app.models.activity import Activity, ActivityType, ActivityOutcome
from app.models.sales_target import SalesTarget, TargetType
from app.models.webhook import WebhookConfig, WebhookLog
from app.models.location import Country, State, City


def init_db():
    """Create all tables"""
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("Tables created successfully!")


def create_admin_user():
    """Create admin user if not exists"""
    db = SessionLocal()
    try:
        # Check if admin exists
        admin = db.query(User).filter(User.email == "admin@example.com").first()
        if admin:
            print("Admin user already exists.")
            return

        # Create admin
        admin = User(
            email="admin@example.com",
            hashed_password=get_password_hash("admin123"),
            full_name="Admin User",
            role=UserRole.ADMIN,
            is_active=True
        )
        db.add(admin)
        db.commit()
        print("Admin user created!")
        print("  Email: admin@example.com")
        print("  Password: admin123")
    finally:
        db.close()


def create_sample_data():
    """Create comprehensive sample data for dashboard"""
    db = SessionLocal()
    try:
        # Check if data exists
        if db.query(PreLead).count() > 0:
            print("Sample data already exists.")
            return

        # Get admin user
        admin = db.query(User).filter(User.email == "admin@example.com").first()
        if not admin:
            print("Admin user not found. Run create_admin_user first.")
            return

        now = datetime.utcnow()

        # ============== Create Pre-Leads ==============
        pre_lead_data = [
            {"first_name": "Rahul", "last_name": "Sharma", "email": "rahul.sharma@techsolutions.com", "phone": "+91 98765 43210", "company_name": "Tech Solutions Pvt Ltd", "source": PreLeadSource.WEBSITE, "city": "Mumbai", "state": "Maharashtra", "product_interest": "ERP Software"},
            {"first_name": "Priya", "last_name": "Patel", "email": "priya.patel@globaltraders.com", "phone": "+91 87654 32109", "company_name": "Global Traders", "source": PreLeadSource.REFERRAL, "city": "Delhi", "state": "Delhi", "product_interest": "CRM System"},
            {"first_name": "Amit", "last_name": "Kumar", "email": "amit.kumar@sunrise.com", "phone": "+91 76543 21098", "company_name": "Sunrise Industries", "source": PreLeadSource.SOCIAL_MEDIA, "city": "Bangalore", "state": "Karnataka", "product_interest": "Inventory Management"},
            {"first_name": "Sneha", "last_name": "Reddy", "email": "sneha.reddy@innovate.com", "phone": "+91 65432 10987", "company_name": "Innovate Corp", "source": PreLeadSource.EMAIL, "city": "Hyderabad", "state": "Telangana", "product_interest": "Accounting Software"},
            {"first_name": "Vikram", "last_name": "Singh", "email": "vikram.singh@fasttrack.com", "phone": "+91 54321 09876", "company_name": "FastTrack Logistics", "source": PreLeadSource.COLD_CALL, "city": "Chennai", "state": "Tamil Nadu", "product_interest": "Supply Chain"},
            {"first_name": "Anjali", "last_name": "Gupta", "email": "anjali.gupta@nexgen.com", "phone": "+91 43210 98765", "company_name": "NexGen Solutions", "source": PreLeadSource.WEBSITE, "city": "Pune", "state": "Maharashtra", "product_interest": "HR Management"},
            {"first_name": "Rajesh", "last_name": "Menon", "email": "rajesh.menon@bluewave.com", "phone": "+91 32109 87654", "company_name": "BlueWave Tech", "source": PreLeadSource.WHATSAPP, "city": "Kochi", "state": "Kerala", "product_interest": "Project Management"},
            {"first_name": "Meera", "last_name": "Nair", "email": "meera.nair@starplus.com", "phone": "+91 21098 76543", "company_name": "StarPlus Media", "source": PreLeadSource.REFERRAL, "city": "Jaipur", "state": "Rajasthan", "product_interest": "Marketing Automation"},
            {"first_name": "Arun", "last_name": "Joshi", "email": "arun.joshi@primetech.com", "phone": "+91 10987 65432", "company_name": "PrimeTech Industries", "source": PreLeadSource.WALK_IN, "city": "Ahmedabad", "state": "Gujarat", "product_interest": "Manufacturing ERP"},
            {"first_name": "Kavitha", "last_name": "Rao", "email": "kavitha.rao@greenfield.com", "phone": "+91 09876 54321", "company_name": "GreenField Agro", "source": PreLeadSource.WEBSITE, "city": "Lucknow", "state": "Uttar Pradesh", "product_interest": "Agriculture Software"},
            {"first_name": "Sanjay", "last_name": "Verma", "email": "sanjay.verma@urbanedge.com", "phone": "+91 98761 23456", "company_name": "UrbanEdge Realty", "source": PreLeadSource.SOCIAL_MEDIA, "city": "Kolkata", "state": "West Bengal", "product_interest": "Real Estate CRM"},
            {"first_name": "Deepika", "last_name": "Chopra", "email": "deepika.chopra@skyline.com", "phone": "+91 87651 23456", "company_name": "Skyline Constructions", "source": PreLeadSource.EMAIL, "city": "Indore", "state": "Madhya Pradesh", "product_interest": "Construction Management"},
        ]

        pre_leads = []
        for i, data in enumerate(pre_lead_data):
            # Some pre-leads are converted
            is_converted = i < 8  # First 8 are converted
            created_at = now - timedelta(days=random.randint(5, 60))

            pl = PreLead(
                first_name=data["first_name"],
                last_name=data["last_name"],
                email=data["email"],
                phone=data["phone"],
                company_name=data["company_name"],
                source=data["source"],
                status=0,  # Active
                city=data["city"],
                state=data["state"],
                country="India",
                product_interest=data["product_interest"],
                assigned_to=admin.id,
                is_converted=is_converted,
                converted_at=created_at + timedelta(days=3) if is_converted else None,
                created_at=created_at
            )
            db.add(pl)
            pre_leads.append(pl)

        db.flush()
        print(f"Created {len(pre_leads)} pre-leads.")

        # ============== Create Leads ==============
        lead_statuses = ["new", "contacted", "qualified", "proposal_sent", "negotiation", "won", "lost"]
        lead_sources = [LeadSource.PRE_LEAD, LeadSource.DIRECT, LeadSource.WEBSITE, LeadSource.REFERRAL, LeadSource.SOCIAL_MEDIA, LeadSource.COLD_CALL, LeadSource.WHATSAPP, LeadSource.EMAIL]
        priorities = [LeadPriority.LOW, LeadPriority.MEDIUM, LeadPriority.HIGH, LeadPriority.CRITICAL]

        leads = []
        # Create leads from converted pre-leads
        for i, pl in enumerate(pre_leads[:8]):
            status_idx = min(i, len(lead_statuses) - 1)
            lead_status = lead_statuses[status_idx]
            is_won = lead_status == "won"
            created_at = pl.converted_at or (now - timedelta(days=random.randint(3, 50)))

            lead = Lead(
                first_name=pl.first_name,
                last_name=pl.last_name,
                email=pl.email,
                phone=pl.phone,
                company_name=pl.company_name,
                source=LeadSource.PRE_LEAD,
                status=0,
                lead_status=lead_status,
                priority=random.choice(priorities),
                expected_value=Decimal(random.randint(50000, 500000)),
                city=pl.city,
                state=pl.state,
                country="India",
                product_interest=pl.product_interest,
                assigned_to=admin.id,
                pre_lead_id=pl.id,
                is_converted=is_won,
                converted_at=created_at + timedelta(days=10) if is_won else None,
                created_at=created_at
            )
            db.add(lead)
            leads.append(lead)

            # Update pre-lead with converted lead id
            pl.converted_lead_id = lead.id

        # Create additional direct leads
        direct_lead_data = [
            {"first_name": "Mohammed", "last_name": "Ali", "email": "mohammed.ali@gulfstar.ae", "phone": "+971 50 123 4567", "company_name": "GulfStar Trading LLC", "city": "Dubai", "country": "UAE"},
            {"first_name": "Sarah", "last_name": "Johnson", "email": "sarah.johnson@techwave.us", "phone": "+1 555 123 4567", "company_name": "TechWave Inc", "city": "San Francisco", "country": "USA"},
            {"first_name": "Chen", "last_name": "Wei", "email": "chen.wei@asialink.sg", "phone": "+65 9123 4567", "company_name": "AsiaLink Pte Ltd", "city": "Singapore", "country": "Singapore"},
            {"first_name": "James", "last_name": "Williams", "email": "james.williams@britishsteel.uk", "phone": "+44 20 7123 4567", "company_name": "British Steel Corp", "city": "London", "country": "UK"},
            {"first_name": "Fatima", "last_name": "Hassan", "email": "fatima.hassan@oasisgroup.sa", "phone": "+966 50 123 4567", "company_name": "Oasis Group", "city": "Riyadh", "country": "Saudi Arabia"},
            {"first_name": "Ravi", "last_name": "Krishnan", "email": "ravi.krishnan@infosys.in", "phone": "+91 80 4123 4567", "company_name": "InfoSys Technologies", "city": "Bangalore", "country": "India"},
        ]

        for i, data in enumerate(direct_lead_data):
            status_idx = i % len(lead_statuses)
            lead_status = lead_statuses[status_idx]
            source = random.choice([LeadSource.DIRECT, LeadSource.WEBSITE, LeadSource.REFERRAL, LeadSource.SOCIAL_MEDIA])
            created_at = now - timedelta(days=random.randint(1, 40))

            lead = Lead(
                first_name=data["first_name"],
                last_name=data["last_name"],
                email=data["email"],
                phone=data["phone"],
                company_name=data["company_name"],
                source=source,
                status=0,
                lead_status=lead_status,
                priority=random.choice(priorities),
                expected_value=Decimal(random.randint(100000, 1000000)),
                city=data["city"],
                country=data["country"],
                product_interest="Enterprise ERP",
                assigned_to=admin.id,
                is_converted=lead_status == "won",
                created_at=created_at
            )
            db.add(lead)
            leads.append(lead)

        db.flush()
        print(f"Created {len(leads)} leads.")

        # ============== Create Customers ==============
        # Create customers from won leads
        customers = []
        for lead in leads:
            if lead.lead_status == "won":
                customer = Customer(
                    first_name=lead.first_name,
                    last_name=lead.last_name,
                    email=lead.email,
                    phone=lead.phone,
                    company_name=lead.company_name,
                    billing_address=f"{lead.city}, {lead.country}",
                    billing_city=lead.city,
                    billing_country=lead.country or "India",
                    lead_id=lead.id,
                    account_manager=admin.id,
                    created_at=lead.converted_at or now
                )
                db.add(customer)
                customers.append(customer)

                # Update lead with converted customer id
                lead.converted_customer_id = customer.id

        db.flush()
        print(f"Created {len(customers)} customers.")

        # ============== Create Activities ==============
        activity_types = [ActivityType.CALL, ActivityType.EMAIL, ActivityType.MEETING, ActivityType.WHATSAPP, ActivityType.NOTE, ActivityType.FOLLOW_UP]
        outcomes = [ActivityOutcome.SUCCESSFUL, ActivityOutcome.CALLBACK_REQUESTED, ActivityOutcome.FOLLOW_UP_NEEDED, ActivityOutcome.MEETING_SCHEDULED]

        activities = []
        # Create activities for leads
        for lead in leads:
            num_activities = random.randint(1, 4)
            for j in range(num_activities):
                activity_type = random.choice(activity_types)
                created_at = (lead.created_at or now) + timedelta(days=j, hours=random.randint(1, 12))

                activity = Activity(
                    activity_type=activity_type,
                    subject=f"{activity_type.value.title()} with {lead.first_name} {lead.last_name}",
                    description=f"Discussed {lead.product_interest or 'product requirements'} with {lead.company_name}",
                    outcome=random.choice(outcomes),
                    lead_id=lead.id,
                    performed_by=admin.id,
                    is_completed=True,
                    created_at=created_at
                )
                db.add(activity)
                activities.append(activity)

        # Create activities for customers
        for customer in customers:
            num_activities = random.randint(1, 3)
            for j in range(num_activities):
                activity_type = random.choice(activity_types)
                created_at = (customer.created_at or now) + timedelta(days=j, hours=random.randint(1, 12))

                activity = Activity(
                    activity_type=activity_type,
                    subject=f"{activity_type.value.title()} with {customer.first_name} {customer.last_name}",
                    description=f"Customer support and relationship management for {customer.company_name}",
                    outcome=random.choice(outcomes),
                    customer_id=customer.id,
                    performed_by=admin.id,
                    is_completed=True,
                    created_at=created_at
                )
                db.add(activity)
                activities.append(activity)

        db.flush()
        print(f"Created {len(activities)} activities.")

        # ============== Create Sales Targets ==============
        # Calculate month end date properly
        if now.month == 12:
            month_end = now.replace(year=now.year + 1, month=1, day=1) - timedelta(days=1)
        else:
            month_end = now.replace(month=now.month + 1, day=1) - timedelta(days=1)

        sales_targets = [
            SalesTarget(
                name="Q1 2024 Revenue Target",
                target_type=TargetType.REVENUE,
                target_value=Decimal("5000000"),
                achieved_value=Decimal("3250000"),
                currency="INR",
                start_date=now.replace(month=1, day=1),
                end_date=now.replace(month=3, day=31),
                user_id=admin.id,
                created_at=now - timedelta(days=90)
            ),
            SalesTarget(
                name="Monthly New Customers",
                target_type=TargetType.CUSTOMER_COUNT,
                target_value=Decimal("20"),
                achieved_value=Decimal(str(len(customers))),
                currency="INR",
                start_date=now.replace(day=1),
                end_date=month_end,
                user_id=admin.id,
                created_at=now - timedelta(days=30)
            ),
            SalesTarget(
                name="Lead Conversion Target",
                target_type=TargetType.CONVERSION,
                target_value=Decimal("50"),
                achieved_value=Decimal("35"),
                currency="INR",
                start_date=now.replace(day=1),
                end_date=month_end,
                user_id=admin.id,
                created_at=now - timedelta(days=30)
            ),
        ]

        for target in sales_targets:
            db.add(target)

        db.flush()
        print(f"Created {len(sales_targets)} sales targets.")

        db.commit()
        print("All sample data created successfully!")

    except Exception as e:
        db.rollback()
        print(f"Error creating sample data: {e}")
        raise
    finally:
        db.close()


def create_location_data():
    """Create countries, states, and cities"""
    db = SessionLocal()
    try:
        # Check if data exists
        if db.query(Country).count() > 0:
            print("Location data already exists.")
            return

        # Define location data: 10 countries with states and cities
        location_data = {
            "India": {
                "code": "IN",
                "states": {
                    "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Nashik", "Aurangabad"],
                    "Karnataka": ["Bangalore", "Mysore", "Hubli", "Mangalore", "Belgaum"],
                    "Delhi": ["New Delhi", "Dwarka", "Rohini", "Saket", "Karol Bagh"],
                    "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem"],
                    "Gujarat": ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar"],
                }
            },
            "United States": {
                "code": "US",
                "states": {
                    "California": ["Los Angeles", "San Francisco", "San Diego", "San Jose", "Sacramento"],
                    "New York": ["New York City", "Buffalo", "Rochester", "Albany", "Syracuse"],
                    "Texas": ["Houston", "Dallas", "Austin", "San Antonio", "Fort Worth"],
                    "Florida": ["Miami", "Orlando", "Tampa", "Jacksonville", "Fort Lauderdale"],
                    "Illinois": ["Chicago", "Springfield", "Naperville", "Peoria", "Rockford"],
                }
            },
            "United Kingdom": {
                "code": "GB",
                "states": {
                    "England": ["London", "Manchester", "Birmingham", "Liverpool", "Leeds"],
                    "Scotland": ["Edinburgh", "Glasgow", "Aberdeen", "Dundee", "Inverness"],
                    "Wales": ["Cardiff", "Swansea", "Newport", "Wrexham", "Barry"],
                    "Northern Ireland": ["Belfast", "Derry", "Lisburn", "Newry", "Bangor"],
                }
            },
            "United Arab Emirates": {
                "code": "AE",
                "states": {
                    "Dubai": ["Dubai City", "Jebel Ali", "Deira", "Bur Dubai", "Jumeirah"],
                    "Abu Dhabi": ["Abu Dhabi City", "Al Ain", "Madinat Zayed", "Ruwais", "Liwa"],
                    "Sharjah": ["Sharjah City", "Khor Fakkan", "Dibba Al-Hisn", "Kalba", "Dhaid"],
                    "Ajman": ["Ajman City", "Masfout", "Manama"],
                }
            },
            "Saudi Arabia": {
                "code": "SA",
                "states": {
                    "Riyadh": ["Riyadh City", "Al-Kharj", "Dawadmi", "Al-Majma'ah", "Wadi ad-Dawasir"],
                    "Makkah": ["Makkah City", "Jeddah", "Taif", "Rabigh", "Al Qunfudhah"],
                    "Eastern Province": ["Dammam", "Dhahran", "Al Khobar", "Jubail", "Qatif"],
                    "Madinah": ["Madinah City", "Yanbu", "Al-Ula", "Badr", "Khaybar"],
                }
            },
            "Oman": {
                "code": "OM",
                "states": {
                    "Muscat": ["Muscat City", "Seeb", "Muttrah", "Bawshar", "Amerat"],
                    "Dhofar": ["Salalah", "Taqah", "Mirbat", "Rakhyut", "Thumrait"],
                    "North Al Batinah": ["Sohar", "Shinas", "Liwa", "Saham", "Al Khaburah"],
                    "South Al Batinah": ["Rustaq", "Al Awabi", "Nakhal", "Wadi Al Maawil", "Barka"],
                }
            },
            "Qatar": {
                "code": "QA",
                "states": {
                    "Doha": ["Doha City", "West Bay", "The Pearl", "Lusail", "Al Sadd"],
                    "Al Wakrah": ["Al Wakrah City", "Al Wukair", "Mesaieed"],
                    "Al Khor": ["Al Khor City", "Al Thakira", "Ras Laffan"],
                    "Al Rayyan": ["Al Rayyan City", "Al Gharrafa", "Umm Salal", "Education City"],
                }
            },
            "Kuwait": {
                "code": "KW",
                "states": {
                    "Al Asimah": ["Kuwait City", "Sharq", "Qibla", "Mirqab", "Dasman"],
                    "Hawalli": ["Hawalli City", "Salmiya", "Jabriya", "Mishref", "Salwa"],
                    "Farwaniya": ["Farwaniya City", "Jleeb Al-Shuyoukh", "Khaitan", "Abraq Khaitan"],
                    "Ahmadi": ["Ahmadi City", "Fahaheel", "Mahboula", "Mangaf", "Abu Halifa"],
                }
            },
            "Bahrain": {
                "code": "BH",
                "states": {
                    "Capital": ["Manama", "Juffair", "Seef", "Diplomatic Area", "Adliya"],
                    "Muharraq": ["Muharraq City", "Busaiteen", "Hidd", "Arad", "Galali"],
                    "Northern": ["Budaiya", "Barbar", "Janabiya", "Saar", "Jasra"],
                    "Southern": ["Riffa", "Isa Town", "Zallaq", "Awali", "Durrat Al Bahrain"],
                }
            },
            "Singapore": {
                "code": "SG",
                "states": {
                    "Central Region": ["Downtown Core", "Marina Bay", "Orchard", "Newton", "Novena"],
                    "East Region": ["Bedok", "Tampines", "Pasir Ris", "Changi", "Paya Lebar"],
                    "North Region": ["Woodlands", "Sembawang", "Yishun", "Mandai", "Admiralty"],
                    "West Region": ["Jurong East", "Jurong West", "Clementi", "Bukit Batok", "Choa Chu Kang"],
                }
            },
        }

        total_countries = 0
        total_states = 0
        total_cities = 0

        for country_name, country_data in location_data.items():
            # Create country
            country = Country(
                name=country_name,
                code=country_data["code"],
                status="Active"
            )
            db.add(country)
            db.flush()  # Get the country ID
            total_countries += 1

            for state_name, cities in country_data["states"].items():
                # Create state
                state = State(
                    name=state_name,
                    country_id=country.id,
                    status="Active"
                )
                db.add(state)
                db.flush()  # Get the state ID
                total_states += 1

                for city_name in cities:
                    # Create city
                    city = City(
                        name=city_name,
                        state_id=state.id,
                        status="Active"
                    )
                    db.add(city)
                    total_cities += 1

        db.commit()
        print(f"Created {total_countries} countries, {total_states} states, and {total_cities} cities.")

    finally:
        db.close()


if __name__ == "__main__":
    print("=" * 50)
    print("CRM Database Initialization")
    print("=" * 50)

    init_db()
    create_admin_user()
    create_sample_data()
    create_location_data()

    print("=" * 50)
    print("Database initialization complete!")
    print("=" * 50)
