-- Create feature_flags table
CREATE TABLE feature_flags (
  key TEXT PRIMARY KEY,
  enabled INTEGER
);

-- Seed initial feature flags
INSERT INTO feature_flags (key, enabled) VALUES 
('aiAssistant', 1),
('darkMode', 1),
('notifications', 1); 