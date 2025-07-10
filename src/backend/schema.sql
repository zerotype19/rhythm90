-- users
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT,
  name TEXT,
  provider TEXT,
  role TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- teams
CREATE TABLE teams (
  id TEXT PRIMARY KEY,
  name TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- team_users
CREATE TABLE team_users (
  team_id TEXT,
  user_id TEXT,
  role TEXT,
  PRIMARY KEY (team_id, user_id)
);

-- plays
CREATE TABLE plays (
  id TEXT PRIMARY KEY,
  team_id TEXT,
  name TEXT,
  target_outcome TEXT,
  why_this_play TEXT,
  how_to_run TEXT,
  signals TEXT,
  status TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- signals
CREATE TABLE signals (
  id TEXT PRIMARY KEY,
  play_id TEXT,
  observation TEXT,
  meaning TEXT,
  action TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
); 