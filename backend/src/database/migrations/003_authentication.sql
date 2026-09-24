-- ==========================================
-- STREAMX AUTHENTICATION UPGRADE
-- ==========================================

ALTER TABLE users
    ALTER COLUMN password_hash DROP NOT NULL;


ALTER TABLE users
    ADD COLUMN IF NOT EXISTS auth_provider VARCHAR(30)
        NOT NULL DEFAULT 'local';


ALTER TABLE users
    ADD COLUMN IF NOT EXISTS google_id VARCHAR(255);


ALTER TABLE users
    ADD COLUMN IF NOT EXISTS email_verified BOOLEAN
        NOT NULL DEFAULT FALSE;


ALTER TABLE users
    ADD COLUMN IF NOT EXISTS email_verification_token TEXT;


ALTER TABLE users
    ADD COLUMN IF NOT EXISTS email_verification_expires_at TIMESTAMPTZ;


ALTER TABLE users
    ADD CONSTRAINT users_auth_provider_check
    CHECK (
        auth_provider IN (
            'local',
            'google'
        )
    );


CREATE UNIQUE INDEX IF NOT EXISTS idx_users_google_id
    ON users(google_id)
    WHERE google_id IS NOT NULL;


CREATE INDEX IF NOT EXISTS idx_users_email_verification_token
    ON users(email_verification_token)
    WHERE email_verification_token IS NOT NULL;


CREATE INDEX IF NOT EXISTS idx_users_auth_provider
    ON users(auth_provider);