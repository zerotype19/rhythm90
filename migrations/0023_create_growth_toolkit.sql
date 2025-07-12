-- Create referral_codes table
CREATE TABLE IF NOT EXISTS referral_codes (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL,
    discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
    discount_value DECIMAL(10,2) NOT NULL,
    max_uses INTEGER DEFAULT NULL,
    current_uses INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    expires_at TIMESTAMP DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create discount_credits table
CREATE TABLE IF NOT EXISTS discount_credits (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    referral_code_id TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    is_applied BOOLEAN DEFAULT false,
    applied_at TIMESTAMP DEFAULT NULL,
    expires_at TIMESTAMP DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (referral_code_id) REFERENCES referral_codes(id) ON DELETE CASCADE
);

-- Create referral_usage table to track usage
CREATE TABLE IF NOT EXISTS referral_usage (
    id TEXT PRIMARY KEY,
    referral_code_id TEXT NOT NULL,
    referrer_id TEXT NOT NULL,
    referred_user_id TEXT NOT NULL,
    discount_credit_id TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (referral_code_id) REFERENCES referral_codes(id) ON DELETE CASCADE,
    FOREIGN KEY (referrer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (referred_user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (discount_credit_id) REFERENCES discount_credits(id) ON DELETE CASCADE
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_referral_codes_user_id ON referral_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_referral_codes_code ON referral_codes(code);
CREATE INDEX IF NOT EXISTS idx_discount_credits_user_id ON discount_credits(user_id);
CREATE INDEX IF NOT EXISTS idx_discount_credits_referral_code_id ON discount_credits(referral_code_id);
CREATE INDEX IF NOT EXISTS idx_referral_usage_referral_code_id ON referral_usage(referral_code_id);
CREATE INDEX IF NOT EXISTS idx_referral_usage_referrer_id ON referral_usage(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referral_usage_referred_user_id ON referral_usage(referred_user_id); 