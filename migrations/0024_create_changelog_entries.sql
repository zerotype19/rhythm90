-- Create changelog entries table
CREATE TABLE changelog_entries (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('New Feature', 'Improvement', 'Bug Fix', 'Security')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Add index for sorting by creation date
CREATE INDEX idx_changelog_created_at ON changelog_entries(created_at DESC);

-- Add index for category filtering
CREATE INDEX idx_changelog_category ON changelog_entries(category);

-- Insert some sample changelog entries
INSERT INTO changelog_entries (id, title, description, category) VALUES
  (crypto.randomUUID(), 'AI-Powered Signal Insights', 'Added intelligent recommendations for marketing signals with AI analysis', 'New Feature'),
  (crypto.randomUUID(), 'Team Collaboration Tools', 'Enhanced team management with role-based permissions and real-time collaboration', 'New Feature'),
  (crypto.randomUUID(), 'Slack Integration', 'Seamless integration with Slack for real-time signal logging and notifications', 'New Feature'),
  (crypto.randomUUID(), 'Analytics Dashboard', 'Comprehensive analytics dashboard with performance metrics and insights', 'New Feature'),
  (crypto.randomUUID(), 'API Access', 'Public API for programmatic access to plays, signals, and analytics data', 'New Feature'),
  (crypto.randomUUID(), 'Dark Mode Support', 'Added dark mode theme for better user experience in low-light environments', 'Improvement'),
  (crypto.randomUUID(), 'Mobile Responsiveness', 'Improved mobile experience with responsive design across all pages', 'Improvement'),
  (crypto.randomUUID(), 'Performance Optimization', 'Enhanced loading speeds and reduced API response times', 'Improvement'),
  (crypto.randomUUID(), 'User Onboarding Tour', 'Interactive tour to help new users get started with the platform', 'Improvement'),
  (crypto.randomUUID(), 'Subscription Management', 'Admin tools for managing team subscriptions and billing', 'New Feature'),
  (crypto.randomUUID(), 'Fixed Signal Logging Bug', 'Resolved issue where signals weren\'t saving properly in some cases', 'Bug Fix'),
  (crypto.randomUUID(), 'Security Enhancement', 'Improved authentication and authorization mechanisms', 'Security'); 