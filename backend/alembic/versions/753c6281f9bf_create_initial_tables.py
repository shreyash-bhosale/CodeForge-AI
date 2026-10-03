"""create_initial_tables

Revision ID: 753c6281f9bf
Revises: 
Create Date: 2026-10-03 21:20:28.372061

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy import inspect

revision: str = '753c6281f9bf'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = inspect(bind)
    existing_tables = set(inspector.get_table_names())

    # 1. users
    if 'users' not in existing_tables:
        op.create_table(
            'users',
            sa.Column('id', sa.String(length=36), nullable=False),
            sa.Column('email', sa.String(length=255), nullable=False),
            sa.Column('hashed_password', sa.String(length=255), nullable=False),
            sa.Column('full_name', sa.String(length=255), nullable=True),
            sa.Column('role', sa.String(length=50), nullable=True),
            sa.Column('is_active', sa.Boolean(), nullable=True),
            sa.Column('created_at', sa.DateTime(), nullable=True),
            sa.PrimaryKeyConstraint('id'),
            sa.UniqueConstraint('email')
        )

    # 2. sessions
    if 'sessions' not in existing_tables:
        op.create_table(
            'sessions',
            sa.Column('id', sa.String(length=36), nullable=False),
            sa.Column('user_id', sa.String(length=36), nullable=False),
            sa.Column('token', sa.String(length=500), nullable=False),
            sa.Column('expires_at', sa.DateTime(), nullable=False),
            sa.Column('created_at', sa.DateTime(), nullable=True),
            sa.PrimaryKeyConstraint('id'),
            sa.UniqueConstraint('token')
        )

    # 3. repositories
    if 'repositories' not in existing_tables:
        op.create_table(
            'repositories',
            sa.Column('id', sa.String(length=36), nullable=False),
            sa.Column('name', sa.String(length=255), nullable=False),
            sa.Column('source_type', sa.String(length=50), nullable=True),
            sa.Column('source_path', sa.Text(), nullable=True),
            sa.Column('workspace_path', sa.Text(), nullable=False),
            sa.Column('default_branch', sa.String(length=100), nullable=True),
            sa.Column('analysis_json', sa.Text(), nullable=True),
            sa.Column('created_at', sa.DateTime(), nullable=True),
            sa.PrimaryKeyConstraint('id')
        )

    # 4. tasks
    if 'tasks' not in existing_tables:
        op.create_table(
            'tasks',
            sa.Column('id', sa.String(length=36), nullable=False),
            sa.Column('repository_id', sa.String(length=36), nullable=False),
            sa.Column('request', sa.Text(), nullable=False),
            sa.Column('status', sa.String(length=50), nullable=True),
            sa.Column('current_stage', sa.String(length=50), nullable=True),
            sa.Column('retry_count', sa.Integer(), nullable=True),
            sa.Column('auto_approve', sa.Boolean(), nullable=True),
            sa.Column('plan_json', sa.Text(), nullable=True),
            sa.Column('verification_json', sa.Text(), nullable=True),
            sa.Column('git_diff', sa.Text(), nullable=True),
            sa.Column('error_message', sa.Text(), nullable=True),
            sa.Column('started_at', sa.DateTime(), nullable=True),
            sa.Column('completed_at', sa.DateTime(), nullable=True),
            sa.PrimaryKeyConstraint('id')
        )

    # 5. task_events
    if 'task_events' not in existing_tables:
        op.create_table(
            'task_events',
            sa.Column('id', sa.String(length=36), nullable=False),
            sa.Column('task_id', sa.String(length=36), nullable=False),
            sa.Column('agent', sa.String(length=50), nullable=False),
            sa.Column('stage', sa.String(length=50), nullable=False),
            sa.Column('event_type', sa.String(length=50), nullable=False),
            sa.Column('title', sa.String(length=255), nullable=False),
            sa.Column('detail', sa.Text(), nullable=True),
            sa.Column('data_json', sa.Text(), nullable=True),
            sa.Column('created_at', sa.DateTime(), nullable=True),
            sa.PrimaryKeyConstraint('id')
        )

    # 6. tool_calls
    if 'tool_calls' not in existing_tables:
        op.create_table(
            'tool_calls',
            sa.Column('id', sa.String(length=36), nullable=False),
            sa.Column('task_id', sa.String(length=36), nullable=False),
            sa.Column('agent', sa.String(length=50), nullable=False),
            sa.Column('tool', sa.String(length=100), nullable=False),
            sa.Column('arguments_json', sa.Text(), nullable=True),
            sa.Column('output', sa.Text(), nullable=True),
            sa.Column('error', sa.Text(), nullable=True),
            sa.Column('exit_code', sa.Integer(), nullable=True),
            sa.Column('duration_ms', sa.Integer(), nullable=True),
            sa.Column('risk_level', sa.String(length=20), nullable=True),
            sa.Column('created_at', sa.DateTime(), nullable=True),
            sa.PrimaryKeyConstraint('id')
        )

    # 7. evaluations
    if 'evaluations' not in existing_tables:
        op.create_table(
            'evaluations',
            sa.Column('id', sa.String(length=36), nullable=False),
            sa.Column('benchmark_id', sa.String(length=50), nullable=False),
            sa.Column('task_prompt', sa.Text(), nullable=False),
            sa.Column('status', sa.String(length=50), nullable=True),
            sa.Column('passed', sa.Boolean(), nullable=True),
            sa.Column('retries', sa.Integer(), nullable=True),
            sa.Column('tests_summary', sa.String(length=100), nullable=True),
            sa.Column('duration_seconds', sa.Float(), nullable=True),
            sa.Column('precision_score', sa.String(length=20), nullable=True),
            sa.Column('report_json', sa.Text(), nullable=True),
            sa.Column('created_at', sa.DateTime(), nullable=True),
            sa.PrimaryKeyConstraint('id')
        )

    # 8. test_runs
    if 'test_runs' not in existing_tables:
        op.create_table(
            'test_runs',
            sa.Column('id', sa.String(length=36), nullable=False),
            sa.Column('task_id', sa.String(length=36), nullable=False),
            sa.Column('command', sa.String(length=255), nullable=False),
            sa.Column('exit_code', sa.Integer(), nullable=True),
            sa.Column('passed', sa.Boolean(), nullable=True),
            sa.Column('stdout', sa.Text(), nullable=True),
            sa.Column('stderr', sa.Text(), nullable=True),
            sa.Column('duration_ms', sa.Integer(), nullable=True),
            sa.Column('created_at', sa.DateTime(), nullable=True),
            sa.PrimaryKeyConstraint('id')
        )


def downgrade() -> None:
    op.drop_table('test_runs')
    op.drop_table('evaluations')
    op.drop_table('tool_calls')
    op.drop_table('task_events')
    op.drop_table('tasks')
    op.drop_table('repositories')
    op.drop_table('sessions')
    op.drop_table('users')
