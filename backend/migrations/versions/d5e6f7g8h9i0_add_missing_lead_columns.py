"""Add missing lead columns

Revision ID: d5e6f7g8h9i0
Revises: c4d5e6f7g8h9
Create Date: 2026-01-29 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'd5e6f7g8h9i0'
down_revision = 'c4d5e6f7g8h9'
branch_labels = None
depends_on = None


def upgrade():
    # Add missing columns to leads table if they don't exist
    # Using batch_alter_table for better compatibility

    conn = op.get_bind()
    inspector = sa.inspect(conn)
    columns = [col['name'] for col in inspector.get_columns('leads')]

    # List of columns to add if they don't exist
    columns_to_add = [
        ('company_code', sa.String(50), True),
        ('address_line1', sa.String(255), True),
        ('address_line2', sa.String(255), True),
        ('city_id', sa.Integer(), True),
        ('state_id', sa.Integer(), True),
        ('country_id', sa.Integer(), True),
        ('zip_code', sa.String(20), True),
        ('phone_no', sa.String(30), True),
        ('fax', sa.String(30), True),
        ('nof_representative', sa.String(100), True),
        ('memo', sa.Text(), True),
        ('group_id', sa.Integer(), True),
        ('industry_id', sa.Integer(), True),
        ('region_id', sa.Integer(), True),
        ('office_timings', sa.String(100), True),
        ('timezone', sa.String(50), True),
        ('lead_source', sa.String(50), True),
        ('lead_score', sa.Integer(), True),
        ('sales_rep', sa.String(100), True),
        ('lead_since', sa.DateTime(timezone=True), True),
        ('remarks', sa.Text(), True),
        ('team_id', sa.Integer(), True),
        ('company_id', sa.Integer(), True),
        ('createdby', sa.Integer(), True),
        ('updatedby', sa.Integer(), True),
    ]

    for col_name, col_type, nullable in columns_to_add:
        if col_name not in columns:
            op.add_column('leads', sa.Column(col_name, col_type, nullable=nullable))


def downgrade():
    # Remove added columns
    columns_to_remove = [
        'company_code', 'address_line1', 'address_line2', 'city_id', 'state_id',
        'country_id', 'zip_code', 'phone_no', 'fax', 'nof_representative',
        'memo', 'group_id', 'industry_id', 'region_id', 'office_timings',
        'timezone', 'lead_source', 'lead_score', 'sales_rep', 'lead_since',
        'remarks', 'team_id'
    ]

    for col_name in columns_to_remove:
        try:
            op.drop_column('leads', col_name)
        except:
            pass
