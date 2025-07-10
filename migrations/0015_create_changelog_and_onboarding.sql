-- Create changelog_entries table for public changelog
CREATE TABLE changelog_entries (
  id TEXT PRIMARY KEY,
  version TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL, -- 'feature', 'improvement', 'bug_fix'
  release_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create user_onboarding table for tracking onboarding progress
CREATE TABLE user_onboarding (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  item TEXT NOT NULL, -- 'create_play', 'connect_slack', 'explore_help', 'invite_team'
  completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, item)
);

-- Add indexes for performance
CREATE INDEX idx_changelog_entries_version ON changelog_entries(version);
CREATE INDEX idx_changelog_entries_category ON changelog_entries(category);
CREATE INDEX idx_changelog_entries_release_date ON changelog_entries(release_date);
CREATE INDEX idx_user_onboarding_user_id ON user_onboarding(user_id);
CREATE INDEX idx_user_onboarding_item ON user_onboarding(item);

-- Insert some sample changelog entries
INSERT INTO changelog_entries (id, version, title, description, category, release_date) VALUES
('changelog-001', '1.0.0', 'Initial Release', 'Launch of Rhythm90 with core play management and signal tracking features', 'feature', '2024-01-15'),
('changelog-002', '1.1.0', 'Team Collaboration', 'Added team management, user roles, and invite system', 'feature', '2024-01-20'),
('changelog-003', '1.2.0', 'Premium Features', 'Introduced premium plans with advanced analytics and unlimited plays', 'feature', '2024-01-25'),
('changelog-004', '1.2.1', 'Performance Improvements', 'Optimized database queries and reduced page load times', 'improvement', '2024-01-28'),
('changelog-005', '1.2.2', 'Bug Fixes', 'Fixed issue with signal creation and improved error handling', 'bug_fix', '2024-01-30'),
('changelog-006', '1.3.0', 'Admin Dashboard', 'New admin panel with team management, invite controls, and audit logging', 'feature', '2024-02-01'),
('changelog-007', '1.3.1', 'Help Center', 'Added comprehensive help center with search functionality', 'feature', '2024-02-05'),
('changelog-008', '1.4.0', 'Stripe Integration', 'Complete billing integration with customer portal and subscription management', 'feature', '2024-02-10'); 