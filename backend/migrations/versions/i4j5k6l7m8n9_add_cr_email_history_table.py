"""add cr_email_history table

Revision ID: i4j5k6l7m8n9
Revises: h3i4j5k6l7m8
Create Date: 2026-02-11

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'i4j5k6l7m8n9'
down_revision = 'h3i4j5k6l7m8'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'cr_email_histories',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('customer_requirement_id', sa.Integer(), nullable=False),
        sa.Column('tab_name', sa.String(100), nullable=False),
        sa.Column('template_id', sa.Integer(), nullable=True),
        sa.Column('template_name', sa.String(255), nullable=True),
        sa.Column('to_email', sa.Text(), nullable=False),
        sa.Column('cc_email', sa.Text(), nullable=True),
        sa.Column('bcc_email', sa.Text(), nullable=True),
        sa.Column('email_name', sa.String(255), nullable=True),
        sa.Column('subject', sa.String(500), nullable=False),
        sa.Column('content', sa.Text(), nullable=True),
        sa.Column('attachment_ids', sa.Text(), nullable=True),
        sa.Column('uploaded_attachments', sa.Text(), nullable=True),
        sa.Column('status', sa.String(50), server_default='sent'),
        sa.Column('sent_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('created_by', sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(['customer_requirement_id'], ['customer_requirements.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_cr_email_histories_id'), 'cr_email_histories', ['id'], unique=False)
    op.create_index(op.f('ix_cr_email_histories_customer_requirement_id'), 'cr_email_histories', ['customer_requirement_id'], unique=False)


def downgrade():
    op.drop_index(op.f('ix_cr_email_histories_customer_requirement_id'), table_name='cr_email_histories')
    op.drop_index(op.f('ix_cr_email_histories_id'), table_name='cr_email_histories')
    op.drop_table('cr_email_histories')
