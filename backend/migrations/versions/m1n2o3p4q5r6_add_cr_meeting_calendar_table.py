"""add cr_meeting_calendars table

Revision ID: m1n2o3p4q5r6
Revises: k5l6m7n8o9p0
Create Date: 2024-01-15 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'm1n2o3p4q5r6'
down_revision = '366bc376ae4b'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table('cr_meeting_calendars',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('customer_requirement_id', sa.Integer(), nullable=False),

        # General Information
        sa.Column('gi_name', sa.String(255), nullable=True),
        sa.Column('gi_company', sa.String(255), nullable=True),
        sa.Column('gi_address', sa.Text(), nullable=True),
        sa.Column('gi_country', sa.Integer(), nullable=True),
        sa.Column('gi_province', sa.Integer(), nullable=True),
        sa.Column('gi_city', sa.Integer(), nullable=True),
        sa.Column('gi_postal', sa.String(50), nullable=True),
        sa.Column('gi_phone', sa.String(100), nullable=True),
        sa.Column('gi_ext', sa.String(20), nullable=True),
        sa.Column('gi_fax', sa.String(100), nullable=True),
        sa.Column('gi_email', sa.String(255), nullable=True),
        sa.Column('gi_website', sa.String(255), nullable=True),
        sa.Column('gi_branch_office', sa.String(255), nullable=True),
        sa.Column('gi_branch_address', sa.Text(), nullable=True),

        # Meeting Session 1
        sa.Column('prefered_date', sa.Date(), nullable=True),
        sa.Column('prefered_time', sa.String(50), nullable=True),
        sa.Column('gi_remark', sa.Text(), nullable=True),
        sa.Column('timezone', sa.Integer(), nullable=True),

        # Meeting Session 2
        sa.Column('prefered_date2', sa.Date(), nullable=True),
        sa.Column('prefered_time2', sa.String(50), nullable=True),
        sa.Column('gi_remark2', sa.Text(), nullable=True),
        sa.Column('timezone2', sa.Integer(), nullable=True),

        # Status
        sa.Column('submit_status', sa.Integer(), nullable=True, default=1),

        # Timestamps
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_by', sa.Integer(), nullable=True),

        sa.ForeignKeyConstraint(['customer_requirement_id'], ['customer_requirements.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_cr_meeting_calendars_id'), 'cr_meeting_calendars', ['id'], unique=False)
    op.create_index(op.f('ix_cr_meeting_calendars_customer_requirement_id'), 'cr_meeting_calendars', ['customer_requirement_id'], unique=False)


def downgrade():
    op.drop_index(op.f('ix_cr_meeting_calendars_customer_requirement_id'), table_name='cr_meeting_calendars')
    op.drop_index(op.f('ix_cr_meeting_calendars_id'), table_name='cr_meeting_calendars')
    op.drop_table('cr_meeting_calendars')
