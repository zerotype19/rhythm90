-- Add team ownership and invite code fields
ALTER TABLE teams ADD COLUMN owner_id INTEGER REFERENCES users(id);
ALTER TABLE teams ADD COLUMN invite_code VARCHAR(6);

-- Add onboarding reset capability
ALTER TABLE users ADD COLUMN onboarding_reset_at TIMESTAMP;

-- Create index for invite code lookups
CREATE INDEX idx_teams_invite_code ON teams(invite_code);

-- Update existing teams to have an owner (use first team member as owner)
UPDATE teams 
SET owner_id = (
    SELECT user_id 
    FROM team_members 
    WHERE team_id = teams.id 
    ORDER BY created_at ASC 
    LIMIT 1
)
WHERE owner_id IS NULL;

-- Generate invite codes for existing teams
UPDATE teams 
SET invite_code = (
    SELECT UPPER(SUBSTR(MD5(RANDOM()), 1, 6))
    WHERE invite_code IS NULL
);

-- Make invite_code NOT NULL after populating
ALTER TABLE teams ALTER COLUMN invite_code SET NOT NULL;

-- Add UNIQUE constraint after populating data
CREATE UNIQUE INDEX idx_teams_invite_code_unique ON teams(invite_code); 