"""Add location tables (countries, states, cities)

Revision ID: g2h3i4j5k6l7
Revises: f1a2b3c4d5e6
Create Date: 2026-02-10 11:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'g2h3i4j5k6l7'
down_revision: Union[str, None] = 'f1a2b3c4d5e6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create countries table
    op.create_table(
        'countries',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('code', sa.String(length=10), nullable=True),
        sa.Column('status', sa.String(length=20), server_default='Active', nullable=True),
        sa.Column('created', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated', sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_countries_id'), 'countries', ['id'], unique=False)

    # Create states table
    op.create_table(
        'states',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('code', sa.String(length=10), nullable=True),
        sa.Column('country_id', sa.Integer(), nullable=False),
        sa.Column('status', sa.String(length=20), server_default='Active', nullable=True),
        sa.Column('created', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['country_id'], ['countries.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_states_id'), 'states', ['id'], unique=False)
    op.create_index(op.f('ix_states_country_id'), 'states', ['country_id'], unique=False)

    # Create cities table
    op.create_table(
        'cities',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('state_id', sa.Integer(), nullable=False),
        sa.Column('status', sa.String(length=20), server_default='Active', nullable=True),
        sa.Column('created', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['state_id'], ['states.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_cities_id'), 'cities', ['id'], unique=False)
    op.create_index(op.f('ix_cities_state_id'), 'cities', ['state_id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_cities_state_id'), table_name='cities')
    op.drop_index(op.f('ix_cities_id'), table_name='cities')
    op.drop_table('cities')
    op.drop_index(op.f('ix_states_country_id'), table_name='states')
    op.drop_index(op.f('ix_states_id'), table_name='states')
    op.drop_table('states')
    op.drop_index(op.f('ix_countries_id'), table_name='countries')
    op.drop_table('countries')
