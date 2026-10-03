-- =========================================================================
-- CodeForge AI — PostgreSQL / Supabase Initial Schema Migration
-- Migration: 001_initial_schema.sql
-- Compatible with: Supabase / PostgreSQL 14+
-- =========================================================================

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) DEFAULT '',
    role VARCHAR(50) DEFAULT 'developer',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- 2. Sessions Table
CREATE TABLE IF NOT EXISTS sessions (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(500) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);

-- 3. Repositories Table
CREATE TABLE IF NOT EXISTS repositories (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    source_type VARCHAR(50) DEFAULT 'local',
    source_path TEXT,
    workspace_path TEXT NOT NULL,
    default_branch VARCHAR(100) DEFAULT 'main',
    analysis_json TEXT DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_repositories_name ON repositories(name);

-- 4. Tasks Table
CREATE TABLE IF NOT EXISTS tasks (
    id VARCHAR(36) PRIMARY KEY,
    repository_id VARCHAR(36) NOT NULL REFERENCES repositories(id) ON DELETE CASCADE,
    request TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'INITIAL',
    current_stage VARCHAR(50) DEFAULT 'INITIAL',
    retry_count INTEGER DEFAULT 0,
    auto_approve BOOLEAN DEFAULT TRUE,
    plan_json TEXT,
    verification_json TEXT,
    git_diff TEXT DEFAULT '',
    error_message TEXT,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_tasks_repo_id ON tasks(repository_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);

-- 5. Task Events Table
CREATE TABLE IF NOT EXISTS task_events (
    id VARCHAR(36) PRIMARY KEY,
    task_id VARCHAR(36) NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    agent VARCHAR(50) NOT NULL,
    stage VARCHAR(50) NOT NULL,
    event_type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    detail TEXT,
    data_json TEXT DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_task_events_task_id ON task_events(task_id);
CREATE INDEX IF NOT EXISTS idx_task_events_created_at ON task_events(created_at);

-- 6. Tool Calls Table
CREATE TABLE IF NOT EXISTS tool_calls (
    id VARCHAR(36) PRIMARY KEY,
    task_id VARCHAR(36) NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    agent VARCHAR(50) NOT NULL,
    tool VARCHAR(100) NOT NULL,
    arguments_json TEXT DEFAULT '{}',
    output TEXT,
    error TEXT,
    exit_code INTEGER DEFAULT 0,
    duration_ms INTEGER DEFAULT 0,
    risk_level VARCHAR(20) DEFAULT 'LOW',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_tool_calls_task_id ON tool_calls(task_id);

-- 7. Evaluations Table
CREATE TABLE IF NOT EXISTS evaluations (
    id VARCHAR(36) PRIMARY KEY,
    benchmark_id VARCHAR(50) NOT NULL,
    task_prompt TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'PENDING',
    passed BOOLEAN DEFAULT FALSE,
    retries INTEGER DEFAULT 0,
    tests_summary VARCHAR(100) DEFAULT '0/0',
    duration_seconds FLOAT DEFAULT 0.0,
    precision_score VARCHAR(20) DEFAULT '100%',
    report_json TEXT DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_evaluations_benchmark_id ON evaluations(benchmark_id);

-- 8. Test Runs Table
CREATE TABLE IF NOT EXISTS test_runs (
    id VARCHAR(36) PRIMARY KEY,
    task_id VARCHAR(36) NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    command VARCHAR(255) NOT NULL,
    exit_code INTEGER DEFAULT 0,
    passed BOOLEAN DEFAULT FALSE,
    stdout TEXT,
    stderr TEXT,
    duration_ms INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_test_runs_task_id ON test_runs(task_id);
