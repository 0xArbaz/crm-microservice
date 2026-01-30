"""
Migration script to convert status enum to integer and add lead_status for workflow tracking.

Run this script from the backend directory:
    python run_migration.py
"""

from sqlalchemy import create_engine, text
from app.core.config import settings

def run_migration():
    """Run the migration to convert status to integer"""

    engine = create_engine(settings.DATABASE_URL)

    with engine.connect() as conn:
        # Start transaction
        trans = conn.begin()

        try:
            print("Starting migration...")

            # =====================================================
            # PRE_LEADS TABLE MIGRATION
            # =====================================================
            print("\n--- Migrating pre_leads table ---")

            # Check current column type
            result = conn.execute(text("""
                SELECT data_type FROM information_schema.columns
                WHERE table_name = 'pre_leads' AND column_name = 'status'
            """))
            row = result.fetchone()
            current_type = row[0] if row else 'unknown'
            print(f"Current pre_leads.status type: {current_type}")

            if current_type != 'integer':
                # Step 1: Add temporary column
                print("Adding temporary status_new column...")
                conn.execute(text("ALTER TABLE pre_leads ADD COLUMN IF NOT EXISTS status_new INTEGER DEFAULT 0"))

                # Step 2: Migrate values
                print("Migrating status values...")
                # Active statuses -> 0
                conn.execute(text("""
                    UPDATE pre_leads SET status_new = 0
                    WHERE status::text IN ('new', 'contacted', 'validated', 'active', '0')
                    OR status IS NULL
                """))
                # Discarded -> 1
                conn.execute(text("""
                    UPDATE pre_leads SET status_new = 1
                    WHERE status::text IN ('discarded', '1')
                """))

                # Step 3: Copy workflow status to lead_status
                print("Copying workflow status to lead_status...")
                conn.execute(text("""
                    UPDATE pre_leads SET lead_status = status::text
                    WHERE lead_status IS NULL
                    AND status::text IN ('new', 'contacted', 'validated')
                """))

                # Step 4: Drop old column and rename new one
                print("Replacing status column...")
                conn.execute(text("ALTER TABLE pre_leads DROP COLUMN status"))
                conn.execute(text("ALTER TABLE pre_leads RENAME COLUMN status_new TO status"))

                # Step 5: Set constraints
                conn.execute(text("ALTER TABLE pre_leads ALTER COLUMN status SET NOT NULL"))
                conn.execute(text("ALTER TABLE pre_leads ALTER COLUMN status SET DEFAULT 0"))

                print("pre_leads migration complete!")
            else:
                print("pre_leads.status is already INTEGER, skipping migration")

            # =====================================================
            # LEADS TABLE MIGRATION
            # =====================================================
            print("\n--- Migrating leads table ---")

            # Check if lead_status column exists
            result = conn.execute(text("""
                SELECT column_name FROM information_schema.columns
                WHERE table_name = 'leads' AND column_name = 'lead_status'
            """))
            if not result.fetchone():
                print("Adding lead_status column...")
                conn.execute(text("ALTER TABLE leads ADD COLUMN lead_status VARCHAR(50) DEFAULT 'new'"))

            # Check current status column type
            result = conn.execute(text("""
                SELECT data_type FROM information_schema.columns
                WHERE table_name = 'leads' AND column_name = 'status'
            """))
            row = result.fetchone()
            current_type = row[0] if row else 'unknown'
            print(f"Current leads.status type: {current_type}")

            if current_type != 'integer':
                # Step 1: Add temporary column
                print("Adding temporary status_new column...")
                conn.execute(text("ALTER TABLE leads ADD COLUMN IF NOT EXISTS status_new INTEGER DEFAULT 0"))

                # Step 2: Copy workflow status to lead_status first
                print("Copying workflow status to lead_status...")
                conn.execute(text("""
                    UPDATE leads SET lead_status = status::text
                    WHERE (lead_status IS NULL OR lead_status = 'new')
                    AND status::text IN ('new', 'contacted', 'qualified', 'proposal_sent', 'negotiation', 'won', 'lost')
                """))

                # Step 3: Migrate status values
                print("Migrating status values...")
                # Active statuses -> 0
                conn.execute(text("""
                    UPDATE leads SET status_new = 0
                    WHERE status::text IN ('new', 'contacted', 'qualified', 'proposal_sent', 'negotiation', 'won', '0')
                    OR status IS NULL
                """))
                # Lost/Discarded -> 1
                conn.execute(text("""
                    UPDATE leads SET status_new = 1
                    WHERE status::text IN ('lost', 'discarded', '1')
                """))

                # Step 4: Drop old column and rename new one
                print("Replacing status column...")
                conn.execute(text("ALTER TABLE leads DROP COLUMN status"))
                conn.execute(text("ALTER TABLE leads RENAME COLUMN status_new TO status"))

                # Step 5: Set constraints
                conn.execute(text("ALTER TABLE leads ALTER COLUMN status SET NOT NULL"))
                conn.execute(text("ALTER TABLE leads ALTER COLUMN status SET DEFAULT 0"))

                print("leads migration complete!")
            else:
                print("leads.status is already INTEGER, skipping migration")

            # =====================================================
            # CLEANUP
            # =====================================================
            print("\n--- Cleanup ---")
            try:
                conn.execute(text("DROP TYPE IF EXISTS preleadstatus CASCADE"))
                conn.execute(text("DROP TYPE IF EXISTS leadstatus CASCADE"))
                print("Dropped old enum types")
            except Exception as e:
                print(f"Note: Could not drop enum types (may not exist): {e}")

            # =====================================================
            # VERIFY
            # =====================================================
            print("\n--- Verification ---")

            result = conn.execute(text("""
                SELECT COUNT(*) as total,
                       SUM(CASE WHEN status = 0 THEN 1 ELSE 0 END) as active,
                       SUM(CASE WHEN status = 1 THEN 1 ELSE 0 END) as discarded
                FROM pre_leads
            """))
            row = result.fetchone()
            print(f"Pre-leads: Total={row[0]}, Active={row[1]}, Discarded={row[2]}")

            result = conn.execute(text("""
                SELECT COUNT(*) as total,
                       SUM(CASE WHEN status = 0 THEN 1 ELSE 0 END) as active,
                       SUM(CASE WHEN status = 1 THEN 1 ELSE 0 END) as discarded
                FROM leads
            """))
            row = result.fetchone()
            print(f"Leads: Total={row[0]}, Active={row[1]}, Discarded={row[2]}")

            # Commit transaction
            trans.commit()
            print("\n✓ Migration completed successfully!")

        except Exception as e:
            trans.rollback()
            print(f"\n✗ Migration failed: {e}")
            raise

if __name__ == "__main__":
    run_migration()
