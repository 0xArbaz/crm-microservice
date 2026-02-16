"""Add CR diligence short form table

Revision ID: j5k6l7m8n9o0
Revises: i4j5k6l7m8n9
Create Date: 2026-02-12 10:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'j5k6l7m8n9o0'
down_revision: Union[str, None] = 'i4j5k6l7m8n9'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'cr_diligence_short_forms',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('customer_requirement_id', sa.Integer(), nullable=False),

        # Section 1: General Information
        sa.Column('company_name', sa.String(length=255), nullable=True),
        sa.Column('key_person', sa.String(length=255), nullable=True),
        sa.Column('designation', sa.String(length=255), nullable=True),
        sa.Column('email', sa.String(length=255), nullable=True),
        sa.Column('phone', sa.String(length=100), nullable=True),
        sa.Column('website', sa.String(length=255), nullable=True),
        sa.Column('address', sa.Text(), nullable=True),
        sa.Column('city', sa.Integer(), nullable=True),
        sa.Column('state', sa.Integer(), nullable=True),
        sa.Column('postal_code', sa.String(length=50), nullable=True),
        sa.Column('country', sa.Integer(), nullable=True),
        sa.Column('years_operation', sa.String(length=50), nullable=True),
        sa.Column('branch_address', sa.Text(), nullable=True),

        # Section 2: Years in Business
        sa.Column('years_1_5', sa.Boolean(), default=False),
        sa.Column('years_6_10', sa.Boolean(), default=False),
        sa.Column('years_11_50', sa.Boolean(), default=False),
        sa.Column('years_51_100', sa.Boolean(), default=False),

        # Section 2: Company Size
        sa.Column('size_1_5', sa.Boolean(), default=False),
        sa.Column('size_6_10', sa.Boolean(), default=False),
        sa.Column('size_11_50', sa.Boolean(), default=False),
        sa.Column('size_51_100', sa.Boolean(), default=False),
        sa.Column('size_100_plus', sa.Boolean(), default=False),

        # Section 2: Industry Type
        sa.Column('industry_trading', sa.Boolean(), default=False),
        sa.Column('industry_manufacturing', sa.Boolean(), default=False),
        sa.Column('industry_services', sa.Boolean(), default=False),
        sa.Column('industry_distribution', sa.Boolean(), default=False),
        sa.Column('industry_retail', sa.Boolean(), default=False),
        sa.Column('industry_projects', sa.Boolean(), default=False),
        sa.Column('industry_consulting', sa.Boolean(), default=False),
        sa.Column('industry_other_chk', sa.Boolean(), default=False),
        sa.Column('industry_other', sa.String(length=255), nullable=True),

        # Section 2: Legal Structure
        sa.Column('legal_sole', sa.Boolean(), default=False),
        sa.Column('legal_partnership', sa.Boolean(), default=False),
        sa.Column('legal_llc', sa.Boolean(), default=False),

        # Section 2: Annual Revenue
        sa.Column('rev_100k', sa.Boolean(), default=False),
        sa.Column('rev_250k', sa.Boolean(), default=False),
        sa.Column('rev_1m', sa.Boolean(), default=False),
        sa.Column('rev_5m', sa.Boolean(), default=False),
        sa.Column('rev_10m', sa.Boolean(), default=False),
        sa.Column('rev_above_10m', sa.Boolean(), default=False),

        # Section 2: Market Reach
        sa.Column('market_local', sa.Boolean(), default=False),
        sa.Column('market_national', sa.Boolean(), default=False),
        sa.Column('market_international', sa.Boolean(), default=False),

        # Section 3: Current Systems
        sa.Column('sys_paper', sa.Boolean(), default=False),
        sa.Column('sys_account', sa.Boolean(), default=False),
        sa.Column('sys_crm', sa.Boolean(), default=False),
        sa.Column('sys_hrm', sa.Boolean(), default=False),
        sa.Column('sys_inv', sa.Boolean(), default=False),
        sa.Column('sys_erp', sa.Boolean(), default=False),
        sa.Column('sys_other_chk', sa.Boolean(), default=False),
        sa.Column('sys_other', sa.String(length=255), nullable=True),

        # Section 4: Key Business Priorities
        sa.Column('key_cust', sa.Boolean(), default=False),
        sa.Column('key_proposal', sa.Boolean(), default=False),
        sa.Column('key_suppliers', sa.Boolean(), default=False),
        sa.Column('key_inventory', sa.Boolean(), default=False),
        sa.Column('key_financial', sa.Boolean(), default=False),
        sa.Column('key_employees', sa.Boolean(), default=False),
        sa.Column('key_projects', sa.Boolean(), default=False),
        sa.Column('key_dms', sa.Boolean(), default=False),
        sa.Column('key_reports', sa.Boolean(), default=False),
        sa.Column('key_integration', sa.Boolean(), default=False),
        sa.Column('key_multicurrency', sa.Boolean(), default=False),
        sa.Column('key_errors', sa.Boolean(), default=False),
        sa.Column('key_costs', sa.Boolean(), default=False),
        sa.Column('key_other_chk', sa.Boolean(), default=False),
        sa.Column('key_other', sa.String(length=255), nullable=True),

        # Section 5: Main Business Challenges
        sa.Column('main_manual', sa.Boolean(), default=False),
        sa.Column('main_delay', sa.Boolean(), default=False),
        sa.Column('main_tracking', sa.Boolean(), default=False),
        sa.Column('main_payments', sa.Boolean(), default=False),
        sa.Column('main_suppliers', sa.Boolean(), default=False),
        sa.Column('main_inventory', sa.Boolean(), default=False),
        sa.Column('main_hr', sa.Boolean(), default=False),
        sa.Column('main_reports', sa.Boolean(), default=False),
        sa.Column('main_currency', sa.Boolean(), default=False),
        sa.Column('main_branches', sa.Boolean(), default=False),
        sa.Column('main_emp', sa.Boolean(), default=False),
        sa.Column('main_lack', sa.Boolean(), default=False),
        sa.Column('main_diff', sa.Boolean(), default=False),
        sa.Column('main_branch', sa.Boolean(), default=False),
        sa.Column('main_other_chk', sa.Boolean(), default=False),
        sa.Column('main_other', sa.String(length=255), nullable=True),

        # Section 6: Other Requirements
        sa.Column('other_notes', sa.Text(), nullable=True),

        # Status
        sa.Column('submit_status', sa.Integer(), default=1),

        # Timestamps
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_by', sa.Integer(), nullable=True),

        sa.ForeignKeyConstraint(['customer_requirement_id'], ['customer_requirements.id']),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_cr_diligence_short_forms_id'), 'cr_diligence_short_forms', ['id'], unique=False)
    op.create_index(op.f('ix_cr_diligence_short_forms_customer_requirement_id'), 'cr_diligence_short_forms', ['customer_requirement_id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_cr_diligence_short_forms_customer_requirement_id'), table_name='cr_diligence_short_forms')
    op.drop_index(op.f('ix_cr_diligence_short_forms_id'), table_name='cr_diligence_short_forms')
    op.drop_table('cr_diligence_short_forms')
