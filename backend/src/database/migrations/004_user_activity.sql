-- ============================================
-- StreamX User Activity
-- Watchlist + Watch History
-- ============================================

CREATE TABLE IF NOT EXISTS watchlist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL
        REFERENCES users(id)
        ON DELETE CASCADE,

    movie_id UUID NOT NULL
        REFERENCES movies(id)
        ON DELETE CASCADE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT watchlist_user_movie_unique
        UNIQUE (user_id, movie_id)
);


CREATE INDEX IF NOT EXISTS idx_watchlist_user_id
    ON watchlist(user_id);


CREATE INDEX IF NOT EXISTS idx_watchlist_movie_id
    ON watchlist(movie_id);


CREATE TABLE IF NOT EXISTS watch_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL
        REFERENCES users(id)
        ON DELETE CASCADE,

    movie_id UUID NOT NULL
        REFERENCES movies(id)
        ON DELETE CASCADE,

    progress_seconds INTEGER NOT NULL DEFAULT 0,

    duration_seconds INTEGER,

    completed BOOLEAN NOT NULL DEFAULT FALSE,

    last_watched_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT watch_history_user_movie_unique
        UNIQUE (user_id, movie_id)
);


CREATE INDEX IF NOT EXISTS idx_watch_history_user_id
    ON watch_history(user_id);


CREATE INDEX IF NOT EXISTS idx_watch_history_last_watched
    ON watch_history(user_id, last_watched_at DESC);