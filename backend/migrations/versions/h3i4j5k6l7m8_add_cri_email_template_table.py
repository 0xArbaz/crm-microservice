"""Add CRI email template table

Revision ID: h3i4j5k6l7m8
Revises: g2h3i4j5k6l7
Create Date: 2026-02-11 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'h3i4j5k6l7m8'
down_revision: Union[str, None] = 'g2h3i4j5k6l7'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'cri_email_templates',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('tab', sa.String(length=100), nullable=True),
        sa.Column('email_format', sa.String(length=255), nullable=True),
        sa.Column('email_format_option_values', sa.String(length=255), nullable=True),
        sa.Column('subject', sa.String(length=500), nullable=True),
        sa.Column('email_template', sa.Text(), nullable=True),
        sa.Column('created_by', sa.Integer(), nullable=True),
        sa.Column('company_id', sa.Integer(), nullable=True),
        sa.Column('created', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated', sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_cri_email_templates_id'), 'cri_email_templates', ['id'], unique=False)
    op.create_index(op.f('ix_cri_email_templates_tab'), 'cri_email_templates', ['tab'], unique=False)
    op.create_index(op.f('ix_cri_email_templates_company_id'), 'cri_email_templates', ['company_id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_cri_email_templates_company_id'), table_name='cri_email_templates')
    op.drop_index(op.f('ix_cri_email_templates_tab'), table_name='cri_email_templates')
    op.drop_index(op.f('ix_cri_email_templates_id'), table_name='cri_email_templates')
    op.drop_table('cri_email_templates')
