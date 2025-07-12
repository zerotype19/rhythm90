-- Create users table with all necessary fields
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  provider TEXT DEFAULT 'email',
  role TEXT DEFAULT 'member',
  is_premium BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Onboarding fields
  has_completed_profile BOOLEAN DEFAULT FALSE,
  has_joined_team BOOLEAN DEFAULT FALSE,
  has_created_play BOOLEAN DEFAULT FALSE,
  has_logged_signal BOOLEAN DEFAULT FALSE,
  is_onboarded BOOLEAN DEFAULT FALSE,
  
  -- Profile fields
  role_title TEXT,
  avatar_url TEXT,
  
  -- Team management
  current_team_id TEXT
);

-- Create teams table
CREATE TABLE teams (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  is_premium BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  billing_status TEXT DEFAULT 'free',
  stripe_customer_id TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create team_users table
CREATE TABLE team_users (
  team_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  role TEXT DEFAULT 'member',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (team_id, user_id),
  FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create plays table
CREATE TABLE plays (
  id TEXT PRIMARY KEY,
  team_id TEXT NOT NULL,
  name TEXT NOT NULL,
  target_outcome TEXT,
  why_this_play TEXT,
  how_to_run TEXT,
  signals TEXT,
  status TEXT DEFAULT 'active',
  is_archived BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE
);

-- Create signals table
CREATE TABLE signals (
  id TEXT PRIMARY KEY,
  play_id TEXT NOT NULL,
  observation TEXT NOT NULL,
  meaning TEXT,
  action TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (play_id) REFERENCES plays(id) ON DELETE CASCADE
);

-- Create indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_onboarding_status ON users(is_onboarded, has_completed_profile, has_joined_team, has_created_play, has_logged_signal);
CREATE INDEX idx_users_current_team ON users(current_team_id);
CREATE INDEX idx_team_users_user_id ON team_users(user_id);
CREATE INDEX idx_team_users_team_id ON team_users(team_id);
CREATE INDEX idx_plays_team_id ON plays(team_id);
CREATE INDEX idx_signals_play_id ON signals(play_id); 