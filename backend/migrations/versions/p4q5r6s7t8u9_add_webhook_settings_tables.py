"""Add menu webhook settings tables

Revision ID: p4q5r6s7t8u9
Revises: o3p4q5r6s7t8
Create Date: 2024-01-20 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'p4q5r6s7t8u9'
down_revision = 'o3p4q5r6s7t8'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create menu_webhook_settings table
    op.create_table(
        'menu_webhook_settings',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('menu_key', sa.String(100), nullable=False),
        sa.Column('menu_name', sa.String(255), nullable=False),
        sa.Column('menu_path', sa.String(255), nullable=False),
        sa.Column('is_enabled', sa.Boolean(), default=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), onupdate=sa.func.now()),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_menu_webhook_settings_id', 'menu_webhook_settings', ['id'])
    op.create_index('ix_menu_webhook_settings_menu_key', 'menu_webhook_settings', ['menu_key'], unique=True)

    # Create menu_webhook_configs table
    op.create_table(
        'menu_webhook_configs',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('menu_key', sa.String(100), nullable=False),
        sa.Column('webhook_url', sa.String(500), nullable=True),
        sa.Column('secret_key', sa.String(255), nullable=True),
        sa.Column('events', sa.Text(), nullable=True),
        sa.Column('is_active', sa.Boolean(), default=False),
        sa.Column('last_triggered_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('last_status', sa.String(50), nullable=True),
        sa.Column('last_error', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), onupdate=sa.func.now()),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_menu_webhook_configs_id', 'menu_webhook_configs', ['id'])
    op.create_index('ix_menu_webhook_configs_menu_key', 'menu_webhook_configs', ['menu_key'], unique=True)


def downgrade() -> None:
    op.drop_table('menu_webhook_configs')
    op.drop_table('menu_webhook_settings')
