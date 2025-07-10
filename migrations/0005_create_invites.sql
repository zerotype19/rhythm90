-- Create invites table
CREATE TABLE invites (
  id TEXT PRIMARY KEY,
  email TEXT,
  token TEXT,
  accepted INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
); 