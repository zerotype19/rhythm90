-- Create ai_usage table for tracking AI feature usage per team
CREATE TABLE ai_usage (
  id TEXT PRIMARY KEY,
  team_id TEXT NOT NULL,
  feature TEXT NOT NULL, -- 'signal_help', 'hypothesis_generator'
  count INTEGER DEFAULT 0,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(team_id, feature)
);

-- Create slack_settings table for Slack/Teams integration
CREATE TABLE slack_settings (
  id TEXT PRIMARY KEY,
  team_id TEXT NOT NULL,
  workspace_name TEXT,
  workspace_id TEXT,
  connected_channels TEXT, -- JSON array or comma-separated
  webhook_url TEXT,
  last_sync TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(team_id)
);

-- Create templates table for prebuilt play templates
CREATE TABLE templates (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL, -- 'engagement', 'conversion', 'retention', 'awareness'
  description TEXT,
  content TEXT NOT NULL, -- JSON with play structure
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create workshop_progress table for guided workshop tracking
CREATE TABLE workshop_progress (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  team_id TEXT NOT NULL,
  step TEXT NOT NULL, -- 'intro', 'create_play', 'add_signals', 'review'
  completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  data TEXT, -- JSON with step-specific data
  UNIQUE(user_id, team_id, step)
);

-- Add indexes for performance
CREATE INDEX idx_ai_usage_team_id ON ai_usage(team_id);
CREATE INDEX idx_ai_usage_feature ON ai_usage(feature);
CREATE INDEX idx_slack_settings_team_id ON slack_settings(team_id);
CREATE INDEX idx_slack_settings_is_active ON slack_settings(is_active);
CREATE INDEX idx_templates_category ON templates(category);
CREATE INDEX idx_templates_is_active ON templates(is_active);
CREATE INDEX idx_workshop_progress_user_team ON workshop_progress(user_id, team_id);
CREATE INDEX idx_workshop_progress_step ON workshop_progress(step);

-- Insert sample templates
INSERT INTO templates (id, title, category, description, content) VALUES
('template-001', 'Boost Social Engagement', 'engagement', 'Increase social media engagement and community interaction', '{"name": "Boost Social Engagement", "target_outcome": "Increase social media engagement by 25%", "why_this_play": "Engagement is dropping across all social channels", "how_to_run": "Focus on interactive content, community building, and timely responses", "signals": [{"observation": "High comment rate on posts", "meaning": "Audience is highly engaged", "action": "Double down on interactive content"}, {"observation": "Low share rate", "meaning": "Content not compelling enough to share", "action": "Create more shareable, valuable content"}]}'),
('template-002', 'Improve Email Conversion', 'conversion', 'Optimize email campaigns for better conversion rates', '{"name": "Improve Email Conversion", "target_outcome": "Increase email conversion rate by 15%", "why_this_play": "Current email funnel has low conversion rates", "how_to_run": "Optimize subject lines, content, and CTAs", "signals": [{"observation": "High open rate, low click rate", "meaning": "Subject lines work but content doesn't", "action": "Improve email content and CTAs"}, {"observation": "High unsubscribe rate", "meaning": "Content not relevant to audience", "action": "Segment audience and personalize content"}]}'),
('template-003', 'Reduce Customer Churn', 'retention', 'Identify and address customer churn signals', '{"name": "Reduce Customer Churn", "target_outcome": "Reduce churn rate by 20%", "why_this_play": "Customer retention is declining", "how_to_run": "Monitor usage patterns and proactively engage at-risk customers", "signals": [{"observation": "Decreased usage frequency", "meaning": "Customer may be losing interest", "action": "Reach out with personalized re-engagement campaign"}, {"observation": "Support ticket volume increase", "meaning": "Product issues causing frustration", "action": "Address root causes and improve product experience"}]}'),
('template-004', 'Increase Brand Awareness', 'awareness', 'Expand brand reach and recognition', '{"name": "Increase Brand Awareness", "target_outcome": "Increase brand mentions by 30%", "why_this_play": "Low brand visibility in target market", "how_to_run": "Focus on content marketing, partnerships, and PR", "signals": [{"observation": "Increase in organic brand searches", "meaning": "Brand awareness is growing", "action": "Amplify successful content and campaigns"}, {"observation": "Low social media reach", "meaning": "Content not reaching target audience", "action": "Optimize content strategy and paid promotion"}]}'); 