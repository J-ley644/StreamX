
-- ==========================================
-- STREAMX ADMIN ROLE
-- ==========================================

ALTER TABLE users
    ADD COLUMN IF NOT EXISTS role VARCHAR(30)
        NOT NULL DEFAULT 'user';


-- ==========================================
-- ROLE VALIDATION
-- ==========================================

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'users_role_check'
    ) THEN
        ALTER TABLE users
            ADD CONSTRAINT users_role_check
            CHECK (
                role IN (
                    'user',
                    'admin'
                )
            );
    END IF;
END
$$;


-- ==========================================
-- INDEX
-- ==========================================

CREATE INDEX IF NOT EXISTS idx_users_role
    ON users(role);

