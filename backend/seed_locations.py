"""
Script to seed location data (countries, states, cities).
Run this script to add location data to the database.
"""

import sys
sys.path.insert(0, '.')

from app.core.database import SessionLocal
from app.models.location import Country, State, City


def seed_locations():
    """Create countries, states, and cities"""
    db = SessionLocal()
    try:
        # Check if data exists
        existing_count = db.query(Country).count()
        if existing_count > 0:
            print(f"Location data already exists ({existing_count} countries found).")
            response = input("Do you want to add more data anyway? (y/n): ")
            if response.lower() != 'y':
                print("Skipping location data seeding.")
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
            # Check if country already exists
            existing_country = db.query(Country).filter(Country.name == country_name).first()
            if existing_country:
                print(f"Country '{country_name}' already exists, skipping...")
                continue

            # Create country
            country = Country(
                name=country_name,
                code=country_data["code"],
                status="Active"
            )
            db.add(country)
            db.flush()  # Get the country ID
            total_countries += 1
            print(f"Added country: {country_name}")

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
        print("=" * 50)
        print(f"Summary: Added {total_countries} countries, {total_states} states, and {total_cities} cities.")

    except Exception as e:
        db.rollback()
        print(f"Error: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    print("=" * 50)
    print("Location Data Seeding")
    print("=" * 50)
    seed_locations()
    print("=" * 50)
    print("Done!")
