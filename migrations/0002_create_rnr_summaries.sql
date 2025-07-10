CREATE TABLE rnr_summaries (
  id TEXT PRIMARY KEY,
  team_id TEXT,
  summary TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
); 