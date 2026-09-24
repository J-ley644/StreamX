CREATE EXTENSION IF NOT EXISTS pgcrypto;


-- ==========================================
-- USERS
-- ==========================================

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    email VARCHAR(255) NOT NULL UNIQUE,

    password_hash TEXT NOT NULL,

    display_name VARCHAR(100) NOT NULL,

    avatar_url TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ==========================================
-- MOVIES
-- ==========================================

CREATE TABLE IF NOT EXISTS movies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    title VARCHAR(255) NOT NULL,

    description TEXT,

    release_year INTEGER,

    duration_seconds INTEGER,

    rating NUMERIC(3,1),

    poster_url TEXT,

    backdrop_url TEXT,

    video_status VARCHAR(30) NOT NULL DEFAULT 'pending',

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT movies_release_year_check
        CHECK (
            release_year IS NULL
            OR release_year BETWEEN 1888 AND 2100
        ),

    CONSTRAINT movies_duration_check
        CHECK (
            duration_seconds IS NULL
            OR duration_seconds > 0
        ),

    CONSTRAINT movies_rating_check
        CHECK (
            rating IS NULL
            OR rating BETWEEN 0 AND 10
        ),

    CONSTRAINT movies_video_status_check
        CHECK (
            video_status IN (
                'pending',
                'processing',
                'ready',
                'unavailable'
            )
        )
);


-- ==========================================
-- GENRES
-- ==========================================

CREATE TABLE IF NOT EXISTS genres (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    name VARCHAR(100) NOT NULL UNIQUE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ==========================================
-- MOVIE ↔ GENRE
-- ==========================================

CREATE TABLE IF NOT EXISTS movie_genres (
    movie_id UUID NOT NULL,

    genre_id UUID NOT NULL,

    PRIMARY KEY (movie_id, genre_id),

    CONSTRAINT movie_genres_movie_fk
        FOREIGN KEY (movie_id)
        REFERENCES movies(id)
        ON DELETE CASCADE,

    CONSTRAINT movie_genres_genre_fk
        FOREIGN KEY (genre_id)
        REFERENCES genres(id)
        ON DELETE CASCADE
);


-- ==========================================
-- WATCHLIST
-- ==========================================

CREATE TABLE IF NOT EXISTS watchlist (
    user_id UUID NOT NULL,

    movie_id UUID NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    PRIMARY KEY (user_id, movie_id),

    CONSTRAINT watchlist_user_fk
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT watchlist_movie_fk
        FOREIGN KEY (movie_id)
        REFERENCES movies(id)
        ON DELETE CASCADE
);


-- ==========================================
-- WATCH HISTORY
-- ==========================================

CREATE TABLE IF NOT EXISTS watch_history (
    user_id UUID NOT NULL,

    movie_id UUID NOT NULL,

    progress_seconds INTEGER NOT NULL DEFAULT 0,

    completed BOOLEAN NOT NULL DEFAULT FALSE,

    last_watched_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    PRIMARY KEY (user_id, movie_id),

    CONSTRAINT watch_history_user_fk
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT watch_history_movie_fk
        FOREIGN KEY (movie_id)
        REFERENCES movies(id)
        ON DELETE CASCADE,

    CONSTRAINT watch_history_progress_check
        CHECK (progress_seconds >= 0)
);


-- ==========================================
-- DOWNLOADS
-- ==========================================

CREATE TABLE IF NOT EXISTS downloads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL,

    movie_id UUID NOT NULL,

    quality VARCHAR(20) NOT NULL,

    status VARCHAR(30) NOT NULL DEFAULT 'pending',

    local_identifier TEXT,

    downloaded_at TIMESTAMPTZ,

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT downloads_user_fk
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT downloads_movie_fk
        FOREIGN KEY (movie_id)
        REFERENCES movies(id)
        ON DELETE CASCADE,

    CONSTRAINT downloads_status_check
        CHECK (
            status IN (
                'pending',
                'downloading',
                'completed',
                'failed',
                'deleted'
            )
        )
);


-- ==========================================
-- INDEXES
-- ==========================================

CREATE INDEX IF NOT EXISTS idx_movies_title
    ON movies(title);

CREATE INDEX IF NOT EXISTS idx_movies_release_year
    ON movies(release_year);

CREATE INDEX IF NOT EXISTS idx_movies_video_status
    ON movies(video_status);

CREATE INDEX IF NOT EXISTS idx_movie_genres_genre_id
    ON movie_genres(genre_id);

CREATE INDEX IF NOT EXISTS idx_watchlist_movie_id
    ON watchlist(movie_id);

CREATE INDEX IF NOT EXISTS idx_watch_history_movie_id
    ON watch_history(movie_id);

CREATE INDEX IF NOT EXISTS idx_downloads_user_id
    ON downloads(user_id);

CREATE INDEX IF NOT EXISTS idx_downloads_movie_id
    ON downloads(movie_id);