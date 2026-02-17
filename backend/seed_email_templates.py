"""
Seed script for CRI Email Templates
Run: python seed_email_templates.py
"""

from sqlalchemy.orm import Session
from app.core.database import SessionLocal, engine
from app.models.cri_email_template import CRIEmailTemplate

# Email template definitions (matching frontend templates)
EMAIL_TEMPLATES = [
    # Introduction Templates
    {"title": "Introduction Email 1 - Oil & Gas Industry", "tab": "introduction", "email_format": "introduction", "email_format_option_values": "introduction-1", "subject": "Streamline Operations with Smart Cloud Business Management Software (ERP)"},
    {"title": "Introduction Email 2 - Follow-up", "tab": "introduction", "email_format": "introduction", "email_format_option_values": "introduction-2", "subject": "Follow-Up: Introduction to ERP Software Solution"},
    {"title": "Introduction Email 3 - General Introduction", "tab": "introduction", "email_format": "introduction", "email_format_option_values": "introduction-3", "subject": "Introduction to Axiever - Cloud ERP Solution"},
    {"title": "Introduction Email 4 - Manufacturing Focus", "tab": "introduction", "email_format": "introduction", "email_format_option_values": "introduction-4", "subject": "Transform Your Manufacturing Operations with Axiever ERP"},
    {"title": "Introduction Email 5 - Trading Company", "tab": "introduction", "email_format": "introduction", "email_format_option_values": "introduction-5", "subject": "Streamline Your Trading Operations with Axiever"},
    {"title": "Introduction Email 6 - Service Industry", "tab": "introduction", "email_format": "introduction", "email_format_option_values": "introduction-6", "subject": "Enhance Your Service Business with Axiever ERP"},
    {"title": "Introduction Email 7 - Retail Business", "tab": "introduction", "email_format": "introduction", "email_format_option_values": "introduction-7", "subject": "Grow Your Retail Business with Axiever ERP"},
    {"title": "Introduction Email 8 - Construction Industry", "tab": "introduction", "email_format": "introduction", "email_format_option_values": "introduction-8", "subject": "Manage Construction Projects Efficiently with Axiever"},
    {"title": "Introduction Email 9 - E-commerce Business", "tab": "introduction", "email_format": "introduction", "email_format_option_values": "introduction-9", "subject": "Scale Your E-commerce with Axiever ERP Integration"},

    # Requirement Templates
    {"title": "Requirement Email 1 - Initial Requirements", "tab": "requirement", "email_format": "requirement", "email_format_option_values": "requirement-1", "subject": "Business Requirements Discussion - Axiever ERP"},
    {"title": "Requirement Email 3 - Requirements Follow-up", "tab": "requirement", "email_format": "requirement", "email_format_option_values": "requirement-3", "subject": "Follow-Up: Business Requirements for ERP Implementation"},
    {"title": "Requirement Email 21 - Detailed Requirements", "tab": "requirement", "email_format": "requirement", "email_format_option_values": "requirement-21", "subject": "Detailed Requirements Analysis - Axiever ERP"},

    # Presentation Templates
    {"title": "Presentation Email 1 - Presentation Invitation", "tab": "presentation", "email_format": "presentation", "email_format_option_values": "presentation-1", "subject": "Invitation: Axiever ERP Product Presentation"},
    {"title": "Presentation Email 2 - Presentation Follow-up", "tab": "presentation", "email_format": "presentation", "email_format_option_values": "presentation-2", "subject": "Follow-Up: ERP Presentation Discussion"},

    # Demo Templates
    {"title": "Demo Email 1 - Demo Invitation", "tab": "demo", "email_format": "demo", "email_format_option_values": "demo-1", "subject": "Invitation: Axiever ERP Live Demo"},
    {"title": "Demo Email 2 - Demo Follow-up", "tab": "demo", "email_format": "demo", "email_format_option_values": "demo-2", "subject": "Follow-Up: ERP Demo Session"},
    {"title": "Demo Email 3 - Demo Scheduling", "tab": "demo", "email_format": "demo", "email_format_option_values": "demo-3", "subject": "Schedule Your Axiever ERP Demo"},
    {"title": "Demo Email 4 - Demo Reminder", "tab": "demo", "email_format": "demo", "email_format_option_values": "demo-4", "subject": "Reminder: Upcoming Axiever ERP Demo"},
    {"title": "Demo Email 5 - Demo Recording", "tab": "demo", "email_format": "demo", "email_format_option_values": "demo-5", "subject": "Your Axiever ERP Demo Recording"},
    {"title": "Demo Email 6 - Post Demo", "tab": "demo", "email_format": "demo", "email_format_option_values": "demo-6", "subject": "Thank You for Attending Our ERP Demo"},

    # Proposal Templates
    {"title": "Proposal Email 1 - Proposal Submission", "tab": "proposal", "email_format": "proposal", "email_format_option_values": "proposal-1", "subject": "ERP Solution Proposal - Axiever"},
    {"title": "Proposal Email 2 - Proposal Follow-up", "tab": "proposal", "email_format": "proposal", "email_format_option_values": "proposal-2", "subject": "Follow-Up: ERP Solution Proposal"},
    {"title": "Proposal Email 3 - Revised Proposal", "tab": "proposal", "email_format": "proposal", "email_format_option_values": "proposal-3", "subject": "Revised ERP Solution Proposal - Axiever"},

    # Agreement Templates
    {"title": "Agreement Email 1 - Agreement for Review", "tab": "agreement", "email_format": "agreement", "email_format_option_values": "agreement-1", "subject": "Agreement for Your Review - Axiever ERP Solution"},
    {"title": "Agreement Email 2 - Agreement Follow-up", "tab": "agreement", "email_format": "agreement", "email_format_option_values": "agreement-2", "subject": "Follow-Up: Request for Signed Agreement for our ERP solution"},
    {"title": "Agreement Email 3 - Signed Confirmation", "tab": "agreement", "email_format": "agreement", "email_format_option_values": "agreement-3", "subject": "Counter-Signed Agreement"},
    {"title": "Agreement Email 4 - Payment Terms", "tab": "agreement", "email_format": "agreement", "email_format_option_values": "agreement-4", "subject": "Request for Advance Payment - Invoice Attached"},
    {"title": "Agreement Email 5 - Payment Follow-up", "tab": "agreement", "email_format": "agreement", "email_format_option_values": "agreement-5", "subject": "Follow-Up: Request for Advance Payment for proposed ERP solution"},

    # Implementation - Initiation Templates
    {"title": "Initiation Email 1 - Project Kickoff", "tab": "initiation", "email_format": "initiation", "email_format_option_values": "initiation-1", "subject": "Project Kickoff - Axiever ERP Implementation"},
    {"title": "Initiation Email 2 - Team Introduction", "tab": "initiation", "email_format": "initiation", "email_format_option_values": "initiation-2", "subject": "Meet Your Implementation Team - Axiever ERP"},
    {"title": "Initiation Email 3 - Project Timeline", "tab": "initiation", "email_format": "initiation", "email_format_option_values": "initiation-3", "subject": "ERP Implementation Timeline - Axiever"},
    {"title": "Initiation Email 4 - Access Setup", "tab": "initiation", "email_format": "initiation", "email_format_option_values": "initiation-4", "subject": "System Access Setup - Axiever ERP"},
    {"title": "Initiation Email 5 - Documentation Request", "tab": "initiation", "email_format": "initiation", "email_format_option_values": "initiation-5", "subject": "Documentation Required for ERP Implementation"},

    # Implementation - Planning Templates
    {"title": "Planning Email 1 - Planning Phase Start", "tab": "planning", "email_format": "planning", "email_format_option_values": "planning-1", "subject": "Planning Phase Initiated - Axiever ERP"},
    {"title": "Planning Email 2 - Requirements Workshop", "tab": "planning", "email_format": "planning", "email_format_option_values": "planning-2", "subject": "Requirements Workshop Invitation - Axiever ERP"},
    {"title": "Planning Email 3 - Process Mapping", "tab": "planning", "email_format": "planning", "email_format_option_values": "planning-3", "subject": "Process Mapping Session - Axiever ERP"},
    {"title": "Planning Email 4 - Gap Analysis", "tab": "planning", "email_format": "planning", "email_format_option_values": "planning-4", "subject": "Gap Analysis Report - Axiever ERP"},
    {"title": "Planning Email 5 - Planning Summary", "tab": "planning", "email_format": "planning", "email_format_option_values": "planning-5", "subject": "Planning Phase Summary - Axiever ERP"},
    {"title": "Send ERP Implementation Forms", "tab": "planning", "email_format": "planning", "email_format_option_values": "send_erp_implementation_forms", "subject": "ERP Implementation Forms - Please Complete"},
    {"title": "Meeting to Guide Customer on Forms", "tab": "planning", "email_format": "planning", "email_format_option_values": "meeting_to_guide_customer_on_forms", "subject": "Meeting Invitation: Form Completion Guidance"},

    # Implementation - Configuration Templates
    {"title": "Configuration Email 1 - Configuration Start", "tab": "configuration", "email_format": "configuration", "email_format_option_values": "config-1", "subject": "Configuration Phase Started - Axiever ERP"},
    {"title": "Configuration Email 2 - Configuration Update", "tab": "configuration", "email_format": "configuration", "email_format_option_values": "config-2", "subject": "Configuration Progress Update - Axiever ERP"},

    # Implementation - Training Templates
    {"title": "Training Email 1 - Training Schedule", "tab": "training", "email_format": "training", "email_format_option_values": "training-1", "subject": "Training Schedule - Axiever ERP"},
    {"title": "Training Email 2 - Training Materials", "tab": "training", "email_format": "training", "email_format_option_values": "training-2", "subject": "Training Materials - Axiever ERP"},
    {"title": "Training Email 3 - Training Reminder", "tab": "training", "email_format": "training", "email_format_option_values": "training-3", "subject": "Training Reminder - Axiever ERP"},
    {"title": "Training Email 4 - Training Completion", "tab": "training", "email_format": "training", "email_format_option_values": "training-4", "subject": "Training Completed - Axiever ERP"},
    {"title": "Training Email 5 - Additional Training", "tab": "training", "email_format": "training", "email_format_option_values": "training-5", "subject": "Additional Training Available - Axiever ERP"},
    {"title": "Training Email 6 - Training Feedback", "tab": "training", "email_format": "training", "email_format_option_values": "training-6", "subject": "Training Feedback Request - Axiever ERP"},
    {"title": "Training Email 7 - Certification", "tab": "training", "email_format": "training", "email_format_option_values": "training-7", "subject": "Training Certification - Axiever ERP"},

    # Implementation - UAT Templates
    {"title": "UAT Email 1 - UAT Start", "tab": "uat", "email_format": "uat", "email_format_option_values": "uat-1", "subject": "User Acceptance Testing Started - Axiever ERP"},
    {"title": "UAT Email 2 - UAT Progress", "tab": "uat", "email_format": "uat", "email_format_option_values": "uat-2", "subject": "UAT Progress Update - Axiever ERP"},

    # Implementation - Data Migration Templates
    {"title": "Data Migration Email 1 - Migration Plan", "tab": "data-migration", "email_format": "data-migration", "email_format_option_values": "data-migration-1", "subject": "Data Migration Plan - Axiever ERP"},

    # Implementation - Go-Live Templates
    {"title": "Go-Live Email 1 - Go-Live Preparation", "tab": "go-live", "email_format": "go-live", "email_format_option_values": "go-live-1", "subject": "Go-Live Preparation - Axiever ERP"},
    {"title": "Go-Live Email 2 - Go-Live Announcement", "tab": "go-live", "email_format": "go-live", "email_format_option_values": "go-live-2", "subject": "Go-Live Announcement - Axiever ERP is Now Live!"},
]


def seed_email_templates():
    """Seed email templates into the database"""
    db: Session = SessionLocal()

    try:
        # Check if templates already exist
        existing_count = db.query(CRIEmailTemplate).count()
        if existing_count > 0:
            print(f"Database already has {existing_count} email templates.")
            response = input("Do you want to add more templates anyway? (y/n): ")
            if response.lower() != 'y':
                print("Skipping template seeding.")
                return

        # Insert templates
        added_count = 0
        for template_data in EMAIL_TEMPLATES:
            # Check if template with same email_format_option_values exists
            existing = db.query(CRIEmailTemplate).filter(
                CRIEmailTemplate.email_format_option_values == template_data["email_format_option_values"]
            ).first()

            if existing:
                print(f"Template '{template_data['email_format_option_values']}' already exists, skipping...")
                continue

            template = CRIEmailTemplate(**template_data)
            db.add(template)
            added_count += 1
            print(f"Added template: {template_data['title']}")

        db.commit()
        print(f"\nSuccessfully added {added_count} email templates!")

    except Exception as e:
        db.rollback()
        print(f"Error seeding templates: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_email_templates()
