-- Migration: Create admin audit logs, experiments, and feedback tables
-- Batch 38: Admin Tools, Growth Experiments, Monitoring, and Post-Launch Setup

-- Admin audit logs table
CREATE TABLE IF NOT EXISTS admin_audit_logs (
    id TEXT PRIMARY KEY,
    admin_user_id TEXT NOT NULL,
    action_type TEXT NOT NULL, -- 'role_change', 'premium_toggle', 'experiment_created', etc.
    target_user_id TEXT,
    target_team_id TEXT,
    old_value TEXT,
    new_value TEXT,
    details TEXT, -- JSON string for additional context
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_user_id) REFERENCES users(id),
    FOREIGN KEY (target_user_id) REFERENCES users(id),
    FOREIGN KEY (target_team_id) REFERENCES teams(id)
);

-- Experiments table
CREATE TABLE IF NOT EXISTS experiments (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    variants TEXT NOT NULL, -- JSON array of variant names ['A', 'B']
    is_active BOOLEAN DEFAULT TRUE,
    start_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    end_date DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- User experiment assignments table
CREATE TABLE IF NOT EXISTS user_experiments (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    experiment_id TEXT NOT NULL,
    variant TEXT NOT NULL, -- 'A', 'B', etc.
    assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (experiment_id) REFERENCES experiments(id),
    UNIQUE(user_id, experiment_id)
);

-- Experiment events table (for tracking conversions, engagement)
CREATE TABLE IF NOT EXISTS experiment_events (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    experiment_id TEXT NOT NULL,
    variant TEXT NOT NULL,
    event_type TEXT NOT NULL, -- 'signup_completed', 'upgrade_clicked', 'pricing_viewed'
    event_data TEXT, -- JSON string for additional event data
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (experiment_id) REFERENCES experiments(id)
);

-- Feedback table
CREATE TABLE IF NOT EXISTS feedback (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    user_email TEXT,
    category TEXT NOT NULL, -- 'bug_report', 'feature_request', 'general_feedback'
    subject TEXT NOT NULL,
    description TEXT NOT NULL,
    status TEXT DEFAULT 'new', -- 'new', 'in_progress', 'resolved'
    priority TEXT DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
    assigned_to TEXT, -- admin user id
    resolved_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (assigned_to) REFERENCES users(id)
);

-- System announcements table
CREATE TABLE IF NOT EXISTS system_announcements (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info', -- 'info', 'success', 'warning', 'error'
    is_active BOOLEAN DEFAULT TRUE,
    is_dismissible BOOLEAN DEFAULT TRUE,
    start_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    end_date DATETIME,
    created_by TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_admin_user_id ON admin_audit_logs(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_action_type ON admin_audit_logs(action_type);
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_created_at ON admin_audit_logs(created_at);

CREATE INDEX IF NOT EXISTS idx_user_experiments_user_id ON user_experiments(user_id);
CREATE INDEX IF NOT EXISTS idx_user_experiments_experiment_id ON user_experiments(experiment_id);

CREATE INDEX IF NOT EXISTS idx_experiment_events_user_id ON experiment_events(user_id);
CREATE INDEX IF NOT EXISTS idx_experiment_events_experiment_id ON experiment_events(experiment_id);
CREATE INDEX IF NOT EXISTS idx_experiment_events_event_type ON experiment_events(event_type);

CREATE INDEX IF NOT EXISTS idx_feedback_status ON feedback(status);
CREATE INDEX IF NOT EXISTS idx_feedback_category ON feedback(category);
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON feedback(created_at);

CREATE INDEX IF NOT EXISTS idx_system_announcements_is_active ON system_announcements(is_active);
CREATE INDEX IF NOT EXISTS idx_system_announcements_type ON system_announcements(type);

-- Insert default experiments
INSERT OR IGNORE INTO experiments (id, name, description, variants) VALUES
('pricing_experiment', 'Pricing Page A/B Test', 'Test different pricing page layouts and CTAs', '["A", "B"]'),
('signup_experiment', 'Signup Flow A/B Test', 'Test signup flow with and without email opt-in', '["A", "B"]');

-- Insert default system announcement (will be updated with actual user ID later)
-- INSERT OR IGNORE INTO system_announcements (id, title, message, type, created_by) VALUES
-- ('welcome_announcement', 'Welcome to Rhythm90!', 'We''re excited to have you here. Check out our new features and let us know what you think!', 'info', 'system'); 