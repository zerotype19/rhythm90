-- Create feedback entries table
CREATE TABLE feedback_entries (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  team_id TEXT,
  message TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Bug', 'Feature Request', 'General Feedback')),
  anonymous BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE SET NULL
);

-- Add index for sorting by creation date
CREATE INDEX idx_feedback_created_at ON feedback_entries(created_at DESC);

-- Add index for category filtering
CREATE INDEX idx_feedback_category ON feedback_entries(category);

-- Add index for user filtering
CREATE INDEX idx_feedback_user_id ON feedback_entries(user_id);

-- Add index for team filtering
CREATE INDEX idx_feedback_team_id ON feedback_entries(team_id);

-- Add index for anonymous feedback
CREATE INDEX idx_feedback_anonymous ON feedback_entries(anonymous); 