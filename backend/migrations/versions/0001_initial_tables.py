"""Initial database tables

Revision ID: 0001_initial
Revises:
Create Date: 2026-01-01 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '0001_initial'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create users table
    op.create_table(
        'users',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('email', sa.String(255), unique=True, index=True, nullable=False),
        sa.Column('hashed_password', sa.String(255), nullable=False),
        sa.Column('full_name', sa.String(255), nullable=False),
        sa.Column('role', sa.String(20), default='sales', nullable=False),
        sa.Column('is_active', sa.Boolean(), default=True),
        sa.Column('phone', sa.String(20), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), onupdate=sa.func.now()),
    )
    op.create_index('ix_users_email', 'users', ['email'])

    # Create customers table (needed before leads due to foreign key)
    op.create_table(
        'customers',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('customer_code', sa.String(50), unique=True, index=True, nullable=True),
        sa.Column('erp_customer_id', sa.String(50), nullable=True),
        sa.Column('first_name', sa.String(100), nullable=False),
        sa.Column('last_name', sa.String(100), nullable=True),
        sa.Column('email', sa.String(255), index=True, nullable=True),
        sa.Column('phone', sa.String(20), index=True, nullable=True),
        sa.Column('alternate_phone', sa.String(20), nullable=True),
        sa.Column('company_name', sa.String(255), nullable=True),
        sa.Column('designation', sa.String(100), nullable=True),
        sa.Column('company_size', sa.String(50), nullable=True),
        sa.Column('industry', sa.String(100), nullable=True),
        sa.Column('website', sa.String(255), nullable=True),
        sa.Column('gst_number', sa.String(20), nullable=True),
        sa.Column('pan_number', sa.String(20), nullable=True),
        sa.Column('customer_type', sa.String(20), default='business'),
        sa.Column('status', sa.String(20), default='active'),
        sa.Column('total_revenue', sa.Numeric(15, 2), default=0),
        sa.Column('credit_limit', sa.Numeric(15, 2), nullable=True),
        sa.Column('outstanding_amount', sa.Numeric(15, 2), default=0),
        sa.Column('currency', sa.String(3), default='INR'),
        sa.Column('health_score', sa.Integer(), default=100),
        sa.Column('last_order_date', sa.DateTime(timezone=True), nullable=True),
        sa.Column('total_orders', sa.Integer(), default=0),
        sa.Column('billing_address', sa.Text(), nullable=True),
        sa.Column('billing_city', sa.String(100), nullable=True),
        sa.Column('billing_state', sa.String(100), nullable=True),
        sa.Column('billing_country', sa.String(100), default='India'),
        sa.Column('billing_pincode', sa.String(10), nullable=True),
        sa.Column('shipping_address', sa.Text(), nullable=True),
        sa.Column('shipping_city', sa.String(100), nullable=True),
        sa.Column('shipping_state', sa.String(100), nullable=True),
        sa.Column('shipping_country', sa.String(100), default='India'),
        sa.Column('shipping_pincode', sa.String(10), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('account_manager', sa.Integer(), sa.ForeignKey('users.id'), nullable=True),
        sa.Column('lead_id', sa.Integer(), nullable=True),  # Will add FK after leads table
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), onupdate=sa.func.now()),
    )
    op.create_index('ix_customers_email', 'customers', ['email'])
    op.create_index('ix_customers_phone', 'customers', ['phone'])
    op.create_index('ix_customers_customer_code', 'customers', ['customer_code'])

    # Create pre_leads table
    op.create_table(
        'pre_leads',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('first_name', sa.String(100), nullable=False),
        sa.Column('last_name', sa.String(100), nullable=True),
        sa.Column('email', sa.String(255), index=True, nullable=True),
        sa.Column('phone', sa.String(50), index=True, nullable=True),
        sa.Column('alternate_phone', sa.String(50), nullable=True),
        sa.Column('company_name', sa.String(255), nullable=True),
        sa.Column('designation', sa.String(100), nullable=True),
        sa.Column('website', sa.String(255), nullable=True),
        sa.Column('source', sa.String(20), default='website', nullable=False),
        sa.Column('source_details', sa.String(255), nullable=True),
        sa.Column('status', sa.Integer(), default=0, nullable=False),
        sa.Column('product_interest', sa.String(255), nullable=True),
        sa.Column('requirements', sa.Text(), nullable=True),
        sa.Column('budget_range', sa.String(100), nullable=True),
        sa.Column('city', sa.String(100), nullable=True),
        sa.Column('state', sa.String(100), nullable=True),
        sa.Column('country', sa.String(100), default='India'),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('discard_reason', sa.Text(), nullable=True),
        sa.Column('assigned_to', sa.Integer(), sa.ForeignKey('users.id'), nullable=True),
        sa.Column('is_converted', sa.Boolean(), default=False),
        sa.Column('converted_lead_id', sa.Integer(), nullable=True),  # Will add FK after leads table
        sa.Column('converted_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), onupdate=sa.func.now()),
    )
    op.create_index('ix_pre_leads_email', 'pre_leads', ['email'])
    op.create_index('ix_pre_leads_phone', 'pre_leads', ['phone'])

    # Create leads table
    op.create_table(
        'leads',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('first_name', sa.String(100), nullable=False),
        sa.Column('last_name', sa.String(100), nullable=True),
        sa.Column('email', sa.String(255), index=True, nullable=True),
        sa.Column('phone', sa.String(20), index=True, nullable=True),
        sa.Column('alternate_phone', sa.String(20), nullable=True),
        sa.Column('company_name', sa.String(255), nullable=True),
        sa.Column('designation', sa.String(100), nullable=True),
        sa.Column('company_size', sa.String(50), nullable=True),
        sa.Column('industry', sa.String(100), nullable=True),
        sa.Column('website', sa.String(255), nullable=True),
        sa.Column('source', sa.String(20), default='direct', nullable=False),
        sa.Column('source_details', sa.String(255), nullable=True),
        sa.Column('status', sa.Integer(), default=0, nullable=False),
        sa.Column('lead_status', sa.String(50), default='new', nullable=True),
        sa.Column('priority', sa.String(20), default='medium', nullable=False),
        sa.Column('pipeline_stage', sa.Integer(), default=1),
        sa.Column('expected_value', sa.Numeric(15, 2), nullable=True),
        sa.Column('actual_value', sa.Numeric(15, 2), nullable=True),
        sa.Column('currency', sa.String(3), default='INR'),
        sa.Column('product_interest', sa.String(255), nullable=True),
        sa.Column('requirements', sa.Text(), nullable=True),
        sa.Column('expected_close_date', sa.DateTime(timezone=True), nullable=True),
        sa.Column('last_contacted', sa.DateTime(timezone=True), nullable=True),
        sa.Column('next_follow_up', sa.DateTime(timezone=True), nullable=True),
        sa.Column('address', sa.Text(), nullable=True),
        sa.Column('city', sa.String(100), nullable=True),
        sa.Column('state', sa.String(100), nullable=True),
        sa.Column('country', sa.String(100), default='India'),
        sa.Column('pincode', sa.String(10), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('loss_reason', sa.Text(), nullable=True),
        sa.Column('assigned_to', sa.Integer(), sa.ForeignKey('users.id'), nullable=True),
        sa.Column('team_id', sa.Integer(), nullable=True),
        sa.Column('pre_lead_id', sa.Integer(), sa.ForeignKey('pre_leads.id'), nullable=True),
        sa.Column('is_converted', sa.Boolean(), default=False),
        sa.Column('converted_customer_id', sa.Integer(), sa.ForeignKey('customers.id'), nullable=True),
        sa.Column('converted_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), onupdate=sa.func.now()),
    )
    op.create_index('ix_leads_email', 'leads', ['email'])
    op.create_index('ix_leads_phone', 'leads', ['phone'])

    # Add foreign keys that were deferred
    op.create_foreign_key('fk_pre_leads_converted_lead_id', 'pre_leads', 'leads', ['converted_lead_id'], ['id'])
    op.create_foreign_key('fk_customers_lead_id', 'customers', 'leads', ['lead_id'], ['id'])

    # Create contacts table
    op.create_table(
        'contacts',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('first_name', sa.String(100), nullable=False),
        sa.Column('last_name', sa.String(100), nullable=True),
        sa.Column('email', sa.String(255), index=True, nullable=True),
        sa.Column('phone', sa.String(20), nullable=True),
        sa.Column('alternate_phone', sa.String(20), nullable=True),
        sa.Column('whatsapp_number', sa.String(20), nullable=True),
        sa.Column('designation', sa.String(100), nullable=True),
        sa.Column('department', sa.String(100), nullable=True),
        sa.Column('contact_type', sa.String(20), default='primary'),
        sa.Column('is_primary', sa.Boolean(), default=False),
        sa.Column('preferred_contact_method', sa.String(50), default='phone'),
        sa.Column('best_time_to_contact', sa.String(100), nullable=True),
        sa.Column('do_not_contact', sa.Boolean(), default=False),
        sa.Column('linkedin_url', sa.String(255), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('lead_id', sa.Integer(), sa.ForeignKey('leads.id'), index=True, nullable=True),
        sa.Column('customer_id', sa.Integer(), sa.ForeignKey('customers.id'), index=True, nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), onupdate=sa.func.now()),
    )
    op.create_index('ix_contacts_email', 'contacts', ['email'])

    # Create activities table
    op.create_table(
        'activities',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('activity_type', sa.String(20), nullable=False),
        sa.Column('subject', sa.String(255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('outcome', sa.String(30), nullable=True),
        sa.Column('activity_date', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('duration_minutes', sa.Integer(), nullable=True),
        sa.Column('scheduled_date', sa.DateTime(timezone=True), nullable=True),
        sa.Column('is_completed', sa.Boolean(), default=False),
        sa.Column('completed_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('call_direction', sa.String(20), nullable=True),
        sa.Column('call_recording_url', sa.String(500), nullable=True),
        sa.Column('email_subject', sa.String(255), nullable=True),
        sa.Column('email_opened', sa.Boolean(), default=False),
        sa.Column('email_clicked', sa.Boolean(), default=False),
        sa.Column('document_name', sa.String(255), nullable=True),
        sa.Column('document_url', sa.String(500), nullable=True),
        sa.Column('lead_id', sa.Integer(), sa.ForeignKey('leads.id'), index=True, nullable=True),
        sa.Column('customer_id', sa.Integer(), sa.ForeignKey('customers.id'), index=True, nullable=True),
        sa.Column('performed_by', sa.Integer(), sa.ForeignKey('users.id'), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), onupdate=sa.func.now()),
    )

    # Create sales_targets table
    op.create_table(
        'sales_targets',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('designation', sa.String(100), nullable=True),
        sa.Column('reporting_to', sa.String(255), nullable=True),
        sa.Column('region', sa.String(100), nullable=True),
        sa.Column('frequency', sa.String(50), default='monthly'),
        sa.Column('stage', sa.String(100), nullable=True),
        sa.Column('sales_type', sa.String(50), nullable=True),
        sa.Column('target_value', sa.Numeric(15, 2), nullable=False),
        sa.Column('achieved_value', sa.Numeric(15, 2), default=0),
        sa.Column('currency', sa.String(3), default='INR'),
        sa.Column('start_date', sa.DateTime(timezone=True), nullable=False),
        sa.Column('end_date', sa.DateTime(timezone=True), nullable=False),
        sa.Column('remarks', sa.String(500), nullable=True),
        sa.Column('description', sa.String(500), nullable=True),
        sa.Column('target_type', sa.String(20), default='revenue'),
        sa.Column('period', sa.String(20), default='monthly'),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id'), nullable=True),
        sa.Column('team_id', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), onupdate=sa.func.now()),
    )

    # Create webhook_configs table
    op.create_table(
        'webhook_configs',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('description', sa.String(500), nullable=True),
        sa.Column('direction', sa.String(20), nullable=False),
        sa.Column('event', sa.String(50), nullable=False),
        sa.Column('url', sa.String(500), nullable=True),
        sa.Column('secret_key', sa.String(255), nullable=True),
        sa.Column('auth_header', sa.String(100), nullable=True),
        sa.Column('auth_value', sa.String(255), nullable=True),
        sa.Column('is_active', sa.Boolean(), default=True),
        sa.Column('retry_count', sa.Integer(), default=3),
        sa.Column('timeout_seconds', sa.Integer(), default=30),
        sa.Column('headers', sa.JSON(), nullable=True),
        sa.Column('payload_template', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), onupdate=sa.func.now()),
    )

    # Create webhook_logs table
    op.create_table(
        'webhook_logs',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('webhook_config_id', sa.Integer(), nullable=True),
        sa.Column('direction', sa.String(20), nullable=False),
        sa.Column('event', sa.String(50), nullable=True),
        sa.Column('url', sa.String(500), nullable=True),
        sa.Column('method', sa.String(10), default='POST'),
        sa.Column('request_headers', sa.JSON(), nullable=True),
        sa.Column('request_payload', sa.JSON(), nullable=True),
        sa.Column('response_status', sa.Integer(), nullable=True),
        sa.Column('response_body', sa.Text(), nullable=True),
        sa.Column('is_successful', sa.Boolean(), default=False),
        sa.Column('error_message', sa.Text(), nullable=True),
        sa.Column('retry_count', sa.Integer(), default=0),
        sa.Column('entity_type', sa.String(50), nullable=True),
        sa.Column('entity_id', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('processed_at', sa.DateTime(timezone=True), nullable=True),
    )


def downgrade() -> None:
    op.drop_table('webhook_logs')
    op.drop_table('webhook_configs')
    op.drop_table('sales_targets')
    op.drop_table('activities')
    op.drop_table('contacts')
    op.drop_constraint('fk_customers_lead_id', 'customers', type_='foreignkey')
    op.drop_constraint('fk_pre_leads_converted_lead_id', 'pre_leads', type_='foreignkey')
    op.drop_table('leads')
    op.drop_table('pre_leads')
    op.drop_table('customers')
    op.drop_table('users')
