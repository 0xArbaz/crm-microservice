"""Add WhatsApp marketing tables

Revision ID: o3p4q5r6s7t8
Revises: n2o3p4q5r6s7
Create Date: 2024-01-15 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'o3p4q5r6s7t8'
down_revision = 'n2o3p4q5r6s7'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create whatsapp_messages table
    op.create_table(
        'whatsapp_messages',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('lead_id', sa.Integer(), nullable=True),
        sa.Column('contact_id', sa.Integer(), nullable=True),
        sa.Column('phone_number', sa.String(30), nullable=False),
        sa.Column('contact_name', sa.String(255), nullable=True),
        sa.Column('company_name', sa.String(255), nullable=True),
        sa.Column('message_body', sa.Text(), nullable=True),
        sa.Column('template_key', sa.String(100), nullable=True),
        sa.Column('direction', sa.String(20), default='outbound', nullable=False),
        sa.Column('status', sa.String(20), default='pending', nullable=False),
        sa.Column('file_attachment', sa.JSON(), nullable=True),
        sa.Column('external_message_id', sa.String(255), nullable=True),
        sa.Column('error_message', sa.Text(), nullable=True),
        sa.Column('sender_id', sa.Integer(), nullable=True),
        sa.Column('sent_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('delivered_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('read_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), onupdate=sa.func.now()),
        sa.ForeignKeyConstraint(['lead_id'], ['leads.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['contact_id'], ['lead_contacts.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['sender_id'], ['users.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_whatsapp_messages_id', 'whatsapp_messages', ['id'])
    op.create_index('ix_whatsapp_messages_phone_number', 'whatsapp_messages', ['phone_number'])
    op.create_index('ix_whatsapp_messages_lead_id', 'whatsapp_messages', ['lead_id'])

    # Create whatsapp_documents table
    op.create_table(
        'whatsapp_documents',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('folder', sa.String(255), nullable=True),
        sa.Column('size', sa.Integer(), default=0),
        sa.Column('url', sa.String(500), nullable=True),
        sa.Column('created_by', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), onupdate=sa.func.now()),
        sa.ForeignKeyConstraint(['created_by'], ['users.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_whatsapp_documents_id', 'whatsapp_documents', ['id'])

    # Create whatsapp_engagements table
    op.create_table(
        'whatsapp_engagements',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('phone_number', sa.String(30), nullable=False),
        sa.Column('contact_name', sa.String(255), nullable=True),
        sa.Column('lead_id', sa.Integer(), nullable=True),
        sa.Column('event_type', sa.String(50), nullable=False),
        sa.Column('message_id', sa.Integer(), nullable=True),
        sa.Column('response_body', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.ForeignKeyConstraint(['lead_id'], ['leads.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['message_id'], ['whatsapp_messages.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_whatsapp_engagements_id', 'whatsapp_engagements', ['id'])
    op.create_index('ix_whatsapp_engagements_phone_number', 'whatsapp_engagements', ['phone_number'])
    op.create_index('ix_whatsapp_engagements_lead_id', 'whatsapp_engagements', ['lead_id'])

    # Create whatsapp_audit_logs table
    op.create_table(
        'whatsapp_audit_logs',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=True),
        sa.Column('action_type', sa.String(100), nullable=False),
        sa.Column('comment', sa.Text(), nullable=True),
        sa.Column('lead_id', sa.Integer(), nullable=True),
        sa.Column('message_id', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['lead_id'], ['leads.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['message_id'], ['whatsapp_messages.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_whatsapp_audit_logs_id', 'whatsapp_audit_logs', ['id'])


def downgrade() -> None:
    op.drop_table('whatsapp_audit_logs')
    op.drop_table('whatsapp_engagements')
    op.drop_table('whatsapp_documents')
    op.drop_table('whatsapp_messages')
