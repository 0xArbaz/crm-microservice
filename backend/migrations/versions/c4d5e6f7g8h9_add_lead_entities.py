"""Add lead entities tables

Revision ID: c4d5e6f7g8h9
Revises: b3c4d5e6f7g8
Create Date: 2026-01-29 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'c4d5e6f7g8h9'
down_revision = 'b3c4d5e6f7g8'
branch_labels = None
depends_on = None


def upgrade():
    # Create lead_contacts table
    op.create_table('lead_contacts',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('lead_id', sa.Integer(), nullable=False),
        sa.Column('contact_type', sa.String(50), nullable=True, default='primary'),
        sa.Column('title', sa.String(20), nullable=True),
        sa.Column('first_name', sa.String(100), nullable=False),
        sa.Column('last_name', sa.String(100), nullable=True),
        sa.Column('designation', sa.String(100), nullable=True),
        sa.Column('department', sa.String(100), nullable=True),
        sa.Column('is_primary', sa.Boolean(), nullable=True, default=False),
        sa.Column('email', sa.String(255), nullable=True),
        sa.Column('work_email', sa.String(255), nullable=True),
        sa.Column('personal_email', sa.String(255), nullable=True),
        sa.Column('phone', sa.String(50), nullable=True),
        sa.Column('work_phone', sa.String(50), nullable=True),
        sa.Column('ext', sa.String(20), nullable=True),
        sa.Column('fax', sa.String(50), nullable=True),
        sa.Column('cell_phone', sa.String(50), nullable=True),
        sa.Column('home_phone', sa.String(50), nullable=True),
        sa.Column('linkedin_url', sa.String(255), nullable=True),
        sa.Column('facebook_url', sa.String(255), nullable=True),
        sa.Column('twitter_url', sa.String(255), nullable=True),
        sa.Column('image', sa.String(255), nullable=True),
        sa.Column('status', sa.String(20), nullable=True, default='active'),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_by', sa.Integer(), nullable=True),
        sa.Column('updated_by', sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(['lead_id'], ['leads.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_lead_contacts_id'), 'lead_contacts', ['id'], unique=False)
    op.create_index(op.f('ix_lead_contacts_lead_id'), 'lead_contacts', ['lead_id'], unique=False)

    # Create lead_activities table
    op.create_table('lead_activities',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('lead_id', sa.Integer(), nullable=False),
        sa.Column('activity_type', sa.String(50), nullable=False),
        sa.Column('subject', sa.String(255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('outcome', sa.Text(), nullable=True),
        sa.Column('activity_date', sa.Date(), nullable=False),
        sa.Column('due_date', sa.Date(), nullable=True),
        sa.Column('is_completed', sa.Boolean(), nullable=True, default=False),
        sa.Column('completed_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('contact_id', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_by', sa.Integer(), nullable=True),
        sa.Column('updated_by', sa.Integer(), nullable=True),
        sa.Column('performed_by', sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(['lead_id'], ['leads.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_lead_activities_id'), 'lead_activities', ['id'], unique=False)
    op.create_index(op.f('ix_lead_activities_lead_id'), 'lead_activities', ['lead_id'], unique=False)

    # Create lead_memos table
    op.create_table('lead_memos',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('lead_id', sa.Integer(), nullable=False),
        sa.Column('memo_type', sa.String(50), nullable=True, default='general'),
        sa.Column('title', sa.String(255), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_by', sa.Integer(), nullable=True),
        sa.Column('updated_by', sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(['lead_id'], ['leads.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_lead_memos_id'), 'lead_memos', ['id'], unique=False)
    op.create_index(op.f('ix_lead_memos_lead_id'), 'lead_memos', ['lead_id'], unique=False)

    # Create lead_documents table
    op.create_table('lead_documents',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('lead_id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('original_name', sa.String(255), nullable=False),
        sa.Column('file_path', sa.String(512), nullable=False),
        sa.Column('file_type', sa.String(100), nullable=True),
        sa.Column('size', sa.Integer(), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('uploaded_by', sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(['lead_id'], ['leads.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_lead_documents_id'), 'lead_documents', ['id'], unique=False)
    op.create_index(op.f('ix_lead_documents_lead_id'), 'lead_documents', ['lead_id'], unique=False)

    # Create lead_status_history table
    op.create_table('lead_status_history',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('lead_id', sa.Integer(), nullable=False),
        sa.Column('status', sa.String(50), nullable=False),
        sa.Column('status_date', sa.Date(), nullable=False),
        sa.Column('remarks', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_by', sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(['lead_id'], ['leads.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_lead_status_history_id'), 'lead_status_history', ['id'], unique=False)
    op.create_index(op.f('ix_lead_status_history_lead_id'), 'lead_status_history', ['lead_id'], unique=False)

    # Create lead_qualified_profiles table
    op.create_table('lead_qualified_profiles',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('lead_id', sa.Integer(), nullable=False),
        sa.Column('profile_type', sa.String(50), nullable=True, default='basic'),
        sa.Column('company_name', sa.String(255), nullable=True),
        sa.Column('company_type', sa.String(100), nullable=True),
        sa.Column('industry_id', sa.Integer(), nullable=True),
        sa.Column('annual_revenue', sa.String(100), nullable=True),
        sa.Column('employee_count', sa.String(50), nullable=True),
        sa.Column('decision_maker', sa.String(255), nullable=True),
        sa.Column('decision_process', sa.Text(), nullable=True),
        sa.Column('budget', sa.String(100), nullable=True),
        sa.Column('timeline', sa.String(100), nullable=True),
        sa.Column('competitors', sa.Text(), nullable=True),
        sa.Column('current_solution', sa.Text(), nullable=True),
        sa.Column('pain_points', sa.Text(), nullable=True),
        sa.Column('requirements', sa.Text(), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_by', sa.Integer(), nullable=True),
        sa.Column('updated_by', sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(['lead_id'], ['leads.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_lead_qualified_profiles_id'), 'lead_qualified_profiles', ['id'], unique=False)
    op.create_index(op.f('ix_lead_qualified_profiles_lead_id'), 'lead_qualified_profiles', ['lead_id'], unique=False)


def downgrade():
    op.drop_index(op.f('ix_lead_qualified_profiles_lead_id'), table_name='lead_qualified_profiles')
    op.drop_index(op.f('ix_lead_qualified_profiles_id'), table_name='lead_qualified_profiles')
    op.drop_table('lead_qualified_profiles')

    op.drop_index(op.f('ix_lead_status_history_lead_id'), table_name='lead_status_history')
    op.drop_index(op.f('ix_lead_status_history_id'), table_name='lead_status_history')
    op.drop_table('lead_status_history')

    op.drop_index(op.f('ix_lead_documents_lead_id'), table_name='lead_documents')
    op.drop_index(op.f('ix_lead_documents_id'), table_name='lead_documents')
    op.drop_table('lead_documents')

    op.drop_index(op.f('ix_lead_memos_lead_id'), table_name='lead_memos')
    op.drop_index(op.f('ix_lead_memos_id'), table_name='lead_memos')
    op.drop_table('lead_memos')

    op.drop_index(op.f('ix_lead_activities_lead_id'), table_name='lead_activities')
    op.drop_index(op.f('ix_lead_activities_id'), table_name='lead_activities')
    op.drop_table('lead_activities')

    op.drop_index(op.f('ix_lead_contacts_lead_id'), table_name='lead_contacts')
    op.drop_index(op.f('ix_lead_contacts_id'), table_name='lead_contacts')
    op.drop_table('lead_contacts')
