"""Add pre-lead entities tables

Revision ID: b3c4d5e6f7g8
Revises: a2b3c4d5e6f7
Create Date: 2026-01-28 14:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'b3c4d5e6f7g8'
down_revision: Union[str, None] = 'a2b3c4d5e6f7'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create pre_lead_contacts table
    op.create_table(
        'pre_lead_contacts',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('pre_lead_id', sa.Integer(), sa.ForeignKey('pre_leads.id'), nullable=False),
        sa.Column('contact_type', sa.String(50), default='primary'),
        sa.Column('title', sa.String(20), nullable=True),
        sa.Column('first_name', sa.String(100), nullable=False),
        sa.Column('last_name', sa.String(100), nullable=True),
        sa.Column('designation', sa.String(100), nullable=True),
        sa.Column('work_email', sa.String(255), nullable=True),
        sa.Column('personal_email', sa.String(255), nullable=True),
        sa.Column('work_phone', sa.String(50), nullable=True),
        sa.Column('ext', sa.String(20), nullable=True),
        sa.Column('fax', sa.String(50), nullable=True),
        sa.Column('cell_phone', sa.String(50), nullable=True),
        sa.Column('home_phone', sa.String(50), nullable=True),
        sa.Column('linkedin_url', sa.String(255), nullable=True),
        sa.Column('facebook_url', sa.String(255), nullable=True),
        sa.Column('twitter_url', sa.String(255), nullable=True),
        sa.Column('image', sa.String(255), nullable=True),
        sa.Column('status', sa.String(20), default='active'),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), onupdate=sa.func.now()),
        sa.Column('created_by', sa.Integer(), nullable=True),
        sa.Column('updated_by', sa.Integer(), nullable=True),
    )
    op.create_index('ix_pre_lead_contacts_pre_lead_id', 'pre_lead_contacts', ['pre_lead_id'])

    # Create pre_lead_activities table
    op.create_table(
        'pre_lead_activities',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('pre_lead_id', sa.Integer(), sa.ForeignKey('pre_leads.id'), nullable=False),
        sa.Column('contact_id', sa.Integer(), sa.ForeignKey('pre_lead_contacts.id'), nullable=True),
        sa.Column('activity_type', sa.String(50), nullable=False),
        sa.Column('subject', sa.String(255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('start_date', sa.Date(), nullable=True),
        sa.Column('start_time', sa.String(20), nullable=True),
        sa.Column('due_date', sa.Date(), nullable=True),
        sa.Column('due_time', sa.String(20), nullable=True),
        sa.Column('priority', sa.String(20), default='medium'),
        sa.Column('status', sa.String(50), default='pending'),
        sa.Column('category', sa.String(50), nullable=True),
        sa.Column('assigned_to', sa.Integer(), sa.ForeignKey('users.id'), nullable=True),
        sa.Column('location', sa.String(255), nullable=True),
        sa.Column('contact_email', sa.String(255), nullable=True),
        sa.Column('contact_phone', sa.String(50), nullable=True),
        sa.Column('fax_no', sa.String(50), nullable=True),
        sa.Column('activity_checklist', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), onupdate=sa.func.now()),
        sa.Column('created_by', sa.Integer(), nullable=True),
        sa.Column('updated_by', sa.Integer(), nullable=True),
    )
    op.create_index('ix_pre_lead_activities_pre_lead_id', 'pre_lead_activities', ['pre_lead_id'])

    # Create pre_lead_memos table
    op.create_table(
        'pre_lead_memos',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('pre_lead_id', sa.Integer(), sa.ForeignKey('pre_leads.id'), nullable=False),
        sa.Column('details', sa.Text(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), onupdate=sa.func.now()),
        sa.Column('created_by', sa.Integer(), sa.ForeignKey('users.id'), nullable=True),
        sa.Column('updated_by', sa.Integer(), sa.ForeignKey('users.id'), nullable=True),
    )
    op.create_index('ix_pre_lead_memos_pre_lead_id', 'pre_lead_memos', ['pre_lead_id'])

    # Create pre_lead_documents table
    op.create_table(
        'pre_lead_documents',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('pre_lead_id', sa.Integer(), sa.ForeignKey('pre_leads.id'), nullable=False),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('original_name', sa.String(255), nullable=True),
        sa.Column('file_path', sa.String(500), nullable=False),
        sa.Column('file_type', sa.String(50), nullable=True),
        sa.Column('size', sa.BigInteger(), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), onupdate=sa.func.now()),
        sa.Column('uploaded_by', sa.Integer(), sa.ForeignKey('users.id'), nullable=True),
    )
    op.create_index('ix_pre_lead_documents_pre_lead_id', 'pre_lead_documents', ['pre_lead_id'])

    # Create pre_lead_status_history table
    op.create_table(
        'pre_lead_status_history',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('pre_lead_id', sa.Integer(), sa.ForeignKey('pre_leads.id'), nullable=False),
        sa.Column('status', sa.String(50), nullable=False),
        sa.Column('status_date', sa.Date(), nullable=True),
        sa.Column('remarks', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_by', sa.Integer(), sa.ForeignKey('users.id'), nullable=True),
    )
    op.create_index('ix_pre_lead_status_history_pre_lead_id', 'pre_lead_status_history', ['pre_lead_id'])

    # Create qualified_lead_profiles table
    op.create_table(
        'qualified_lead_profiles',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('pre_lead_id', sa.Integer(), sa.ForeignKey('pre_leads.id'), nullable=False),
        sa.Column('contact_id', sa.Integer(), sa.ForeignKey('pre_lead_contacts.id'), nullable=True),
        sa.Column('company_name', sa.String(255), nullable=True),
        sa.Column('industry_id', sa.Integer(), nullable=True),
        sa.Column('best_time_call', sa.String(50), nullable=True),
        sa.Column('best_time_call_timezone', sa.Integer(), nullable=True),
        sa.Column('mode', sa.String(50), nullable=True),
        sa.Column('contact_name', sa.String(255), nullable=True),
        sa.Column('designation', sa.String(100), nullable=True),
        sa.Column('phone', sa.String(50), nullable=True),
        sa.Column('email', sa.String(255), nullable=True),
        sa.Column('need_type', sa.Integer(), nullable=True),
        sa.Column('current_software', sa.String(255), nullable=True),
        sa.Column('need_summary', sa.Text(), nullable=True),
        sa.Column('budget', sa.Integer(), nullable=True),
        sa.Column('decision_maker', sa.Integer(), nullable=True),
        sa.Column('time_frame', sa.Integer(), nullable=True),
        sa.Column('qualified_by', sa.Integer(), sa.ForeignKey('users.id'), nullable=True),
        sa.Column('company_profile', sa.Text(), nullable=True),
        sa.Column('summary_of_discussion', sa.Text(), nullable=True),
        sa.Column('conclusion', sa.Text(), nullable=True),
        sa.Column('status', sa.String(20), default='draft'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), onupdate=sa.func.now()),
        sa.Column('created_by', sa.Integer(), nullable=True),
        sa.Column('updated_by', sa.Integer(), nullable=True),
    )
    op.create_index('ix_qualified_lead_profiles_pre_lead_id', 'qualified_lead_profiles', ['pre_lead_id'])


def downgrade() -> None:
    op.drop_table('qualified_lead_profiles')
    op.drop_table('pre_lead_status_history')
    op.drop_table('pre_lead_documents')
    op.drop_table('pre_lead_memos')
    op.drop_table('pre_lead_activities')
    op.drop_table('pre_lead_contacts')
