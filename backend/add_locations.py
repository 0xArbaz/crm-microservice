"""
Simple script to add location data directly to database.
Run: python add_locations.py
"""

import sys
sys.path.insert(0, '.')

from app.core.database import SessionLocal
from app.models.location import Country, State, City

def add_locations():
    db = SessionLocal()

    try:
        # Check if data exists
        count = db.query(Country).count()
        if count > 0:
            print(f"Countries table already has {count} records.")
            print("Do you want to delete and re-add? (y/n): ", end="")
            response = input().strip().lower()
            if response == 'y':
                db.query(City).delete()
                db.query(State).delete()
                db.query(Country).delete()
                db.commit()
                print("Deleted existing data.")
            else:
                print("Skipping...")
                return

        print("Adding countries, states, and cities...")

        # India
        india = Country(name="India", code="IN", status="Active")
        db.add(india)
        db.flush()

        mh = State(name="Maharashtra", country_id=india.id, status="Active")
        ka = State(name="Karnataka", country_id=india.id, status="Active")
        dl = State(name="Delhi", country_id=india.id, status="Active")
        tn = State(name="Tamil Nadu", country_id=india.id, status="Active")
        gj = State(name="Gujarat", country_id=india.id, status="Active")
        db.add_all([mh, ka, dl, tn, gj])
        db.flush()

        db.add_all([
            City(name="Mumbai", state_id=mh.id, status="Active"),
            City(name="Pune", state_id=mh.id, status="Active"),
            City(name="Nagpur", state_id=mh.id, status="Active"),
            City(name="Nashik", state_id=mh.id, status="Active"),
            City(name="Bangalore", state_id=ka.id, status="Active"),
            City(name="Mysore", state_id=ka.id, status="Active"),
            City(name="Hubli", state_id=ka.id, status="Active"),
            City(name="Mangalore", state_id=ka.id, status="Active"),
            City(name="New Delhi", state_id=dl.id, status="Active"),
            City(name="Dwarka", state_id=dl.id, status="Active"),
            City(name="Rohini", state_id=dl.id, status="Active"),
            City(name="Chennai", state_id=tn.id, status="Active"),
            City(name="Coimbatore", state_id=tn.id, status="Active"),
            City(name="Madurai", state_id=tn.id, status="Active"),
            City(name="Ahmedabad", state_id=gj.id, status="Active"),
            City(name="Surat", state_id=gj.id, status="Active"),
            City(name="Vadodara", state_id=gj.id, status="Active"),
        ])
        print("  Added: India")

        # United States
        usa = Country(name="United States", code="US", status="Active")
        db.add(usa)
        db.flush()

        ca = State(name="California", country_id=usa.id, status="Active")
        ny = State(name="New York", country_id=usa.id, status="Active")
        tx = State(name="Texas", country_id=usa.id, status="Active")
        fl = State(name="Florida", country_id=usa.id, status="Active")
        db.add_all([ca, ny, tx, fl])
        db.flush()

        db.add_all([
            City(name="Los Angeles", state_id=ca.id, status="Active"),
            City(name="San Francisco", state_id=ca.id, status="Active"),
            City(name="San Diego", state_id=ca.id, status="Active"),
            City(name="New York City", state_id=ny.id, status="Active"),
            City(name="Buffalo", state_id=ny.id, status="Active"),
            City(name="Houston", state_id=tx.id, status="Active"),
            City(name="Dallas", state_id=tx.id, status="Active"),
            City(name="Austin", state_id=tx.id, status="Active"),
            City(name="Miami", state_id=fl.id, status="Active"),
            City(name="Orlando", state_id=fl.id, status="Active"),
            City(name="Tampa", state_id=fl.id, status="Active"),
        ])
        print("  Added: United States")

        # United Kingdom
        uk = Country(name="United Kingdom", code="GB", status="Active")
        db.add(uk)
        db.flush()

        eng = State(name="England", country_id=uk.id, status="Active")
        sco = State(name="Scotland", country_id=uk.id, status="Active")
        db.add_all([eng, sco])
        db.flush()

        db.add_all([
            City(name="London", state_id=eng.id, status="Active"),
            City(name="Manchester", state_id=eng.id, status="Active"),
            City(name="Birmingham", state_id=eng.id, status="Active"),
            City(name="Edinburgh", state_id=sco.id, status="Active"),
            City(name="Glasgow", state_id=sco.id, status="Active"),
        ])
        print("  Added: United Kingdom")

        # UAE
        uae = Country(name="United Arab Emirates", code="AE", status="Active")
        db.add(uae)
        db.flush()

        dubai = State(name="Dubai", country_id=uae.id, status="Active")
        abudhabi = State(name="Abu Dhabi", country_id=uae.id, status="Active")
        sharjah = State(name="Sharjah", country_id=uae.id, status="Active")
        db.add_all([dubai, abudhabi, sharjah])
        db.flush()

        db.add_all([
            City(name="Dubai City", state_id=dubai.id, status="Active"),
            City(name="Jebel Ali", state_id=dubai.id, status="Active"),
            City(name="Deira", state_id=dubai.id, status="Active"),
            City(name="Abu Dhabi City", state_id=abudhabi.id, status="Active"),
            City(name="Al Ain", state_id=abudhabi.id, status="Active"),
            City(name="Sharjah City", state_id=sharjah.id, status="Active"),
        ])
        print("  Added: United Arab Emirates")

        # Saudi Arabia
        ksa = Country(name="Saudi Arabia", code="SA", status="Active")
        db.add(ksa)
        db.flush()

        riyadh = State(name="Riyadh", country_id=ksa.id, status="Active")
        makkah = State(name="Makkah", country_id=ksa.id, status="Active")
        db.add_all([riyadh, makkah])
        db.flush()

        db.add_all([
            City(name="Riyadh City", state_id=riyadh.id, status="Active"),
            City(name="Al-Kharj", state_id=riyadh.id, status="Active"),
            City(name="Jeddah", state_id=makkah.id, status="Active"),
            City(name="Makkah City", state_id=makkah.id, status="Active"),
        ])
        print("  Added: Saudi Arabia")

        # Oman
        oman = Country(name="Oman", code="OM", status="Active")
        db.add(oman)
        db.flush()

        muscat = State(name="Muscat", country_id=oman.id, status="Active")
        dhofar = State(name="Dhofar", country_id=oman.id, status="Active")
        db.add_all([muscat, dhofar])
        db.flush()

        db.add_all([
            City(name="Muscat City", state_id=muscat.id, status="Active"),
            City(name="Seeb", state_id=muscat.id, status="Active"),
            City(name="Muttrah", state_id=muscat.id, status="Active"),
            City(name="Salalah", state_id=dhofar.id, status="Active"),
        ])
        print("  Added: Oman")

        # Qatar
        qatar = Country(name="Qatar", code="QA", status="Active")
        db.add(qatar)
        db.flush()

        doha = State(name="Doha", country_id=qatar.id, status="Active")
        db.add(doha)
        db.flush()

        db.add_all([
            City(name="Doha City", state_id=doha.id, status="Active"),
            City(name="West Bay", state_id=doha.id, status="Active"),
            City(name="The Pearl", state_id=doha.id, status="Active"),
        ])
        print("  Added: Qatar")

        # Kuwait
        kuwait = Country(name="Kuwait", code="KW", status="Active")
        db.add(kuwait)
        db.flush()

        asimah = State(name="Al Asimah", country_id=kuwait.id, status="Active")
        db.add(asimah)
        db.flush()

        db.add_all([
            City(name="Kuwait City", state_id=asimah.id, status="Active"),
            City(name="Sharq", state_id=asimah.id, status="Active"),
        ])
        print("  Added: Kuwait")

        # Bahrain
        bahrain = Country(name="Bahrain", code="BH", status="Active")
        db.add(bahrain)
        db.flush()

        capital = State(name="Capital", country_id=bahrain.id, status="Active")
        db.add(capital)
        db.flush()

        db.add_all([
            City(name="Manama", state_id=capital.id, status="Active"),
            City(name="Juffair", state_id=capital.id, status="Active"),
        ])
        print("  Added: Bahrain")

        # Singapore
        singapore = Country(name="Singapore", code="SG", status="Active")
        db.add(singapore)
        db.flush()

        central = State(name="Central Region", country_id=singapore.id, status="Active")
        east = State(name="East Region", country_id=singapore.id, status="Active")
        db.add_all([central, east])
        db.flush()

        db.add_all([
            City(name="Downtown Core", state_id=central.id, status="Active"),
            City(name="Marina Bay", state_id=central.id, status="Active"),
            City(name="Orchard", state_id=central.id, status="Active"),
            City(name="Bedok", state_id=east.id, status="Active"),
            City(name="Tampines", state_id=east.id, status="Active"),
        ])
        print("  Added: Singapore")

        db.commit()

        # Count final data
        c_count = db.query(Country).count()
        s_count = db.query(State).count()
        city_count = db.query(City).count()

        print(f"\nDone! Total: {c_count} countries, {s_count} states, {city_count} cities.")

    except Exception as e:
        db.rollback()
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    print("=" * 50)
    print("Adding Location Data")
    print("=" * 50)
    add_locations()
