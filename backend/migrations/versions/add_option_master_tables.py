"""Add option master tables

Revision ID: f1a2b3c4d5e6
Revises: 9c3c66cdb0cd
Create Date: 2026-02-10 10:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'f1a2b3c4d5e6'
down_revision: Union[str, None] = '9c3c66cdb0cd'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create options table
    op.create_table(
        'options',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('created', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated', sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('title')
    )
    op.create_index(op.f('ix_options_id'), 'options', ['id'], unique=False)

    # Create options_dropdowns table
    op.create_table(
        'options_dropdowns',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('option_id', sa.Integer(), nullable=False),
        sa.Column('status', sa.String(length=20), server_default='Active', nullable=True),
        sa.Column('default_value', sa.Boolean(), server_default='false', nullable=True),
        sa.Column('created_by', sa.Integer(), nullable=True),
        sa.Column('company_id', sa.Integer(), nullable=True),
        sa.Column('created', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['option_id'], ['options.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['created_by'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_options_dropdowns_id'), 'options_dropdowns', ['id'], unique=False)
    op.create_index(op.f('ix_options_dropdowns_option_id'), 'options_dropdowns', ['option_id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_options_dropdowns_option_id'), table_name='options_dropdowns')
    op.drop_index(op.f('ix_options_dropdowns_id'), table_name='options_dropdowns')
    op.drop_table('options_dropdowns')
    op.drop_index(op.f('ix_options_id'), table_name='options')
    op.drop_table('options')
