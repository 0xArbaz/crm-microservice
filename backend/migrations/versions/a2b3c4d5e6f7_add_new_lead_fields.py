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
    # Add new fields to leads table
    op.add_column('leads', sa.Column('company_code', sa.String(length=50), nullable=True))
    op.add_column('leads', sa.Column('address_line1', sa.String(length=255), nullable=True))
    op.add_column('leads', sa.Column('address_line2', sa.String(length=255), nullable=True))
    op.add_column('leads', sa.Column('city_id', sa.Integer(), nullable=True))
    op.add_column('leads', sa.Column('state_id', sa.Integer(), nullable=True))
    op.add_column('leads', sa.Column('country_id', sa.Integer(), nullable=True))
    op.add_column('leads', sa.Column('zip_code', sa.String(length=20), nullable=True))
    op.add_column('leads', sa.Column('phone_no', sa.String(length=30), nullable=True))
    op.add_column('leads', sa.Column('fax', sa.String(length=30), nullable=True))
    op.add_column('leads', sa.Column('nof_representative', sa.String(length=100), nullable=True))
    op.add_column('leads', sa.Column('memo', sa.Text(), nullable=True))
    op.add_column('leads', sa.Column('group_id', sa.Integer(), nullable=True))
    op.add_column('leads', sa.Column('industry_id', sa.Integer(), nullable=True))
    op.add_column('leads', sa.Column('region_id', sa.Integer(), nullable=True))
    op.add_column('leads', sa.Column('office_timings', sa.String(length=100), nullable=True))
    op.add_column('leads', sa.Column('timezone', sa.String(length=50), nullable=True))
    op.add_column('leads', sa.Column('lead_source', sa.String(length=50), nullable=True))
    op.add_column('leads', sa.Column('lead_score', sa.Integer(), nullable=True))
    op.add_column('leads', sa.Column('sales_rep', sa.String(length=100), nullable=True))
    op.add_column('leads', sa.Column('lead_since', sa.DateTime(timezone=True), nullable=True))
    op.add_column('leads', sa.Column('remarks', sa.Text(), nullable=True))
    op.add_column('leads', sa.Column('company_id', sa.Integer(), nullable=True))
    op.add_column('leads', sa.Column('createdby', sa.Integer(), nullable=True))
    op.add_column('leads', sa.Column('updatedby', sa.Integer(), nullable=True))


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
