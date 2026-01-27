"""
Script to initialize the database tables and create an admin user.
Run this script after creating the database.
"""

import sys
sys.path.insert(0, '.')

from app.core.database import engine, Base, SessionLocal
from app.core.security import get_password_hash
from app.core.permissions import UserRole

# Import all models to register them with Base
from app.models.user import User
from app.models.pre_lead import PreLead
from app.models.lead import Lead
from app.models.customer import Customer
from app.models.contact import Contact
from app.models.activity import Activity
from app.models.sales_target import SalesTarget
from app.models.webhook import WebhookConfig, WebhookLog


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
    """Create some sample data"""
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

        # Create sample pre-leads
        from app.models.pre_lead import PreLeadSource, PreLeadStatus

        pre_leads = [
            PreLead(
                first_name="Rahul",
                last_name="Sharma",
                email="rahul.sharma@example.com",
                phone="+91 98765 43210",
                company_name="Tech Solutions Pvt Ltd",
                source=PreLeadSource.WEBSITE,
                status=PreLeadStatus.NEW,
                city="Mumbai",
                state="Maharashtra",
                country="India",
                product_interest="ERP Software",
                assigned_to=admin.id
            ),
            PreLead(
                first_name="Priya",
                last_name="Patel",
                email="priya.patel@example.com",
                phone="+91 87654 32109",
                company_name="Global Traders",
                source=PreLeadSource.REFERRAL,
                status=PreLeadStatus.NEW,
                city="Delhi",
                state="Delhi",
                country="India",
                product_interest="CRM System",
                assigned_to=admin.id
            ),
            PreLead(
                first_name="Amit",
                last_name="Kumar",
                email="amit.kumar@example.com",
                phone="+91 76543 21098",
                company_name="Sunrise Industries",
                source=PreLeadSource.SOCIAL_MEDIA,
                status=PreLeadStatus.CONTACTED,
                city="Bangalore",
                state="Karnataka",
                country="India",
                product_interest="Inventory Management",
                assigned_to=admin.id
            ),
        ]

        for pl in pre_leads:
            db.add(pl)

        db.commit()
        print(f"Created {len(pre_leads)} sample pre-leads.")

    finally:
        db.close()


if __name__ == "__main__":
    print("=" * 50)
    print("CRM Database Initialization")
    print("=" * 50)

    init_db()
    create_admin_user()
    create_sample_data()

    print("=" * 50)
    print("Database initialization complete!")
    print("=" * 50)
