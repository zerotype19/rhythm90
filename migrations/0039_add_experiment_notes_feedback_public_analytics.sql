-- Migration: Add experiment notes, feedback public/comment fields, and analytics enhancements
-- Batch 39: Advanced Experiments, Admin Log Viewer, Frontend Sentry, Deeper Analytics, Growth Push

-- Add notes field to experiments table
ALTER TABLE experiments ADD COLUMN admin_notes TEXT;

-- Add public and comment fields to feedback table
ALTER TABLE feedback ADD COLUMN is_public BOOLEAN DEFAULT FALSE;
ALTER TABLE feedback ADD COLUMN admin_comment TEXT;

-- Add cohort tracking table for retention analytics
CREATE TABLE IF NOT EXISTS user_cohorts (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    cohort_date DATE NOT NULL, -- Date user signed up (cohort start)
    cohort_type TEXT DEFAULT 'signup', -- 'signup', 'first_activity', etc.
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Add cohort activity tracking
CREATE TABLE IF NOT EXISTS cohort_activity (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    activity_date DATE NOT NULL,
    activity_type TEXT NOT NULL, -- 'login', 'play_created', 'signal_logged', etc.
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Add AI assistant usage tracking
CREATE TABLE IF NOT EXISTS ai_assistant_usage (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    action_type TEXT NOT NULL, -- 'hypothesis_generated', 'signal_analyzed', 'play_suggested', etc.
    action_data TEXT, -- JSON string for additional context
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Add CTA tracking for growth experiments
CREATE TABLE IF NOT EXISTS cta_tracking (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    cta_type TEXT NOT NULL, -- 'pricing_upgrade', 'signup_submit', 'product_hunt_click', etc.
    cta_location TEXT NOT NULL, -- 'pricing_page', 'signup_form', 'homepage', etc.
    experiment_id TEXT, -- If part of an A/B test
    variant TEXT, -- A, B, etc.
    session_id TEXT, -- For anonymous tracking
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (experiment_id) REFERENCES experiments(id)
);

-- Add social post drafts table
CREATE TABLE IF NOT EXISTS social_post_drafts (
    id TEXT PRIMARY KEY,
    platform TEXT NOT NULL, -- 'twitter', 'linkedin', 'product_hunt', etc.
    title TEXT,
    content TEXT NOT NULL,
    status TEXT DEFAULT 'draft', -- 'draft', 'scheduled', 'published'
    scheduled_at DATETIME,
    published_at DATETIME,
    created_by TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Add product hunt tracking
CREATE TABLE IF NOT EXISTS product_hunt_tracking (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    action_type TEXT NOT NULL, -- 'page_view', 'upvote_click', 'comment_click', etc.
    session_id TEXT, -- For anonymous tracking
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_cohorts_user_id ON user_cohorts(user_id);
CREATE INDEX IF NOT EXISTS idx_user_cohorts_cohort_date ON user_cohorts(cohort_date);

CREATE INDEX IF NOT EXISTS idx_cohort_activity_user_id ON cohort_activity(user_id);
CREATE INDEX IF NOT EXISTS idx_cohort_activity_activity_date ON cohort_activity(activity_date);
CREATE INDEX IF NOT EXISTS idx_cohort_activity_activity_type ON cohort_activity(activity_type);

CREATE INDEX IF NOT EXISTS idx_ai_assistant_usage_user_id ON ai_assistant_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_assistant_usage_action_type ON ai_assistant_usage(action_type);
CREATE INDEX IF NOT EXISTS idx_ai_assistant_usage_created_at ON ai_assistant_usage(created_at);

CREATE INDEX IF NOT EXISTS idx_cta_tracking_user_id ON cta_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_cta_tracking_cta_type ON cta_tracking(cta_type);
CREATE INDEX IF NOT EXISTS idx_cta_tracking_experiment_id ON cta_tracking(experiment_id);

CREATE INDEX IF NOT EXISTS idx_social_post_drafts_platform ON social_post_drafts(platform);
CREATE INDEX IF NOT EXISTS idx_social_post_drafts_status ON social_post_drafts(status);

CREATE INDEX IF NOT EXISTS idx_product_hunt_tracking_user_id ON product_hunt_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_product_hunt_tracking_action_type ON product_hunt_tracking(action_type);

-- Insert default social post drafts
INSERT OR IGNORE INTO social_post_drafts (id, platform, title, content, created_by) VALUES
('twitter-launch', 'twitter', 'Rhythm90 Launch', '🚀 Just launched Rhythm90 - AI-powered product strategy insights! Turn observations into actionable insights with your team. Check it out: https://rhythm90.io #ProductStrategy #AI #Launch', 'system'),
('linkedin-launch', 'linkedin', 'Rhythm90: AI-Powered Product Strategy', 'Excited to share Rhythm90, our new AI-powered platform that helps product teams turn observations into actionable insights. Built for collaboration and data-driven decision making. https://rhythm90.io', 'system'),
('product-hunt', 'product_hunt', 'Rhythm90 - AI-Powered Product Strategy Platform', 'Rhythm90 helps product teams collaborate on strategy by turning observations into actionable insights with AI. Perfect for PMs, designers, and developers working together.', 'system');

-- Update existing experiments with placeholder notes
UPDATE experiments SET admin_notes = 'Default experiment - monitor performance and adjust as needed.' WHERE admin_notes IS NULL; 