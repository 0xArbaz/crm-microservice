"""Add new lead fields

Revision ID: a2b3c4d5e6f7
Revises: 69e6232e176c
Create Date: 2026-01-28 10:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a2b3c4d5e6f7'
down_revision: Union[str, None] = '69e6232e176c'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Use IF NOT EXISTS to handle columns already created by the initial migration
    op.execute("ALTER TABLE leads ADD COLUMN IF NOT EXISTS company_code VARCHAR(50)")
    op.execute("ALTER TABLE leads ADD COLUMN IF NOT EXISTS address_line1 VARCHAR(255)")
    op.execute("ALTER TABLE leads ADD COLUMN IF NOT EXISTS address_line2 VARCHAR(255)")
    op.execute("ALTER TABLE leads ADD COLUMN IF NOT EXISTS city_id INTEGER")
    op.execute("ALTER TABLE leads ADD COLUMN IF NOT EXISTS state_id INTEGER")
    op.execute("ALTER TABLE leads ADD COLUMN IF NOT EXISTS country_id INTEGER")
    op.execute("ALTER TABLE leads ADD COLUMN IF NOT EXISTS zip_code VARCHAR(20)")
    op.execute("ALTER TABLE leads ADD COLUMN IF NOT EXISTS phone_no VARCHAR(30)")
    op.execute("ALTER TABLE leads ADD COLUMN IF NOT EXISTS fax VARCHAR(30)")
    op.execute("ALTER TABLE leads ADD COLUMN IF NOT EXISTS nof_representative VARCHAR(100)")
    op.execute("ALTER TABLE leads ADD COLUMN IF NOT EXISTS memo TEXT")
    op.execute("ALTER TABLE leads ADD COLUMN IF NOT EXISTS group_id INTEGER")
    op.execute("ALTER TABLE leads ADD COLUMN IF NOT EXISTS industry_id INTEGER")
    op.execute("ALTER TABLE leads ADD COLUMN IF NOT EXISTS region_id INTEGER")
    op.execute("ALTER TABLE leads ADD COLUMN IF NOT EXISTS office_timings VARCHAR(100)")
    op.execute("ALTER TABLE leads ADD COLUMN IF NOT EXISTS timezone VARCHAR(50)")
    op.execute("ALTER TABLE leads ADD COLUMN IF NOT EXISTS lead_source VARCHAR(50)")
    op.execute("ALTER TABLE leads ADD COLUMN IF NOT EXISTS lead_score INTEGER")
    op.execute("ALTER TABLE leads ADD COLUMN IF NOT EXISTS sales_rep VARCHAR(100)")
    op.execute("ALTER TABLE leads ADD COLUMN IF NOT EXISTS lead_since TIMESTAMPTZ")
    op.execute("ALTER TABLE leads ADD COLUMN IF NOT EXISTS remarks TEXT")
    op.execute("ALTER TABLE leads ADD COLUMN IF NOT EXISTS company_id INTEGER")
    op.execute("ALTER TABLE leads ADD COLUMN IF NOT EXISTS createdby INTEGER")
    op.execute("ALTER TABLE leads ADD COLUMN IF NOT EXISTS updatedby INTEGER")


def downgrade() -> None:
    op.drop_column('leads', 'updatedby')
    op.drop_column('leads', 'createdby')
    op.drop_column('leads', 'company_id')
    op.drop_column('leads', 'remarks')
    op.drop_column('leads', 'lead_since')
    op.drop_column('leads', 'sales_rep')
    op.drop_column('leads', 'lead_score')
    op.drop_column('leads', 'lead_source')
    op.drop_column('leads', 'timezone')
    op.drop_column('leads', 'office_timings')
    op.drop_column('leads', 'region_id')
    op.drop_column('leads', 'industry_id')
    op.drop_column('leads', 'group_id')
    op.drop_column('leads', 'memo')
    op.drop_column('leads', 'nof_representative')
    op.drop_column('leads', 'fax')
    op.drop_column('leads', 'phone_no')
    op.drop_column('leads', 'zip_code')
    op.drop_column('leads', 'country_id')
    op.drop_column('leads', 'state_id')
    op.drop_column('leads', 'city_id')
    op.drop_column('leads', 'address_line2')
    op.drop_column('leads', 'address_line1')
    op.drop_column('leads', 'company_code')
