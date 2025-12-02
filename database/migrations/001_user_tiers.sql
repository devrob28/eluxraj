-- =======================================================
-- USERS TABLE ENHANCEMENTS (Subscription, Stripe, Security)
-- =======================================================
ALTER TABLE users
    ADD COLUMN IF NOT EXISTS tier VARCHAR(30) DEFAULT 'free',
    ADD COLUMN IF NOT EXISTS tier_expires_at TIMESTAMP WITH TIME ZONE,
    ADD COLUMN IF NOT EXISTS stripe_customer_id VARCHAR(255),
    ADD COLUMN IF NOT EXISTS stripe_subscription_id VARCHAR(255),
    ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(30) DEFAULT 'inactive',
    ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMP WITH TIME ZONE,
    ADD COLUMN IF NOT EXISTS last_payment_at TIMESTAMP WITH TIME ZONE,
    ADD COLUMN IF NOT EXISTS next_billing_at TIMESTAMP WITH TIME ZONE,
    ADD COLUMN IF NOT EXISTS canceled_at TIMESTAMP WITH TIME ZONE,
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_users_tier                ON users(tier);
CREATE INDEX IF NOT EXISTS idx_users_stripe_customer    ON users(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_users_stripe_subscription ON users(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_users_subscription_status ON users(subscription_status);
CREATE INDEX IF NOT EXISTS idx_users_tier_expiration    ON users(tier_expires_at);
