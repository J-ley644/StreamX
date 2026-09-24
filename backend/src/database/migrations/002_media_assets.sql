-- ==========================================
-- VIDEO ASSETS
-- ==========================================

CREATE TABLE IF NOT EXISTS video_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    movie_id UUID NOT NULL,

    quality VARCHAR(20) NOT NULL,

    format VARCHAR(20) NOT NULL DEFAULT 'mp4',

    stream_url TEXT,

    download_url TEXT,

    file_size_bytes BIGINT,

    duration_seconds INTEGER,

    status VARCHAR(30) NOT NULL DEFAULT 'pending',

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT video_assets_movie_fk
        FOREIGN KEY (movie_id)
        REFERENCES movies(id)
        ON DELETE CASCADE,

    CONSTRAINT video_assets_quality_check
        CHECK (
            quality IN (
                '360p',
                '480p',
                '720p',
                '1080p'
            )
        ),

    CONSTRAINT video_assets_status_check
        CHECK (
            status IN (
                'pending',
                'processing',
                'ready',
                'unavailable'
            )
        ),

    CONSTRAINT video_assets_file_size_check
        CHECK (
            file_size_bytes IS NULL
            OR file_size_bytes > 0
        ),

    CONSTRAINT video_assets_duration_check
        CHECK (
            duration_seconds IS NULL
            OR duration_seconds > 0
        )
);


-- ==========================================
-- SUBTITLES
-- ==========================================

CREATE TABLE IF NOT EXISTS subtitles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    movie_id UUID NOT NULL,

    language_code VARCHAR(10) NOT NULL,

    language_name VARCHAR(100) NOT NULL,

    format VARCHAR(20) NOT NULL DEFAULT 'vtt',

    file_url TEXT,

    status VARCHAR(30) NOT NULL DEFAULT 'pending',

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT subtitles_movie_fk
        FOREIGN KEY (movie_id)
        REFERENCES movies(id)
        ON DELETE CASCADE,

    CONSTRAINT subtitles_status_check
        CHECK (
            status IN (
                'pending',
                'ready',
                'unavailable'
            )
        )
);


-- ==========================================
-- INDEXES
-- ==========================================

CREATE INDEX IF NOT EXISTS idx_video_assets_movie_id
    ON video_assets(movie_id);

CREATE INDEX IF NOT EXISTS idx_video_assets_quality
    ON video_assets(quality);

CREATE INDEX IF NOT EXISTS idx_video_assets_status
    ON video_assets(status);

CREATE INDEX IF NOT EXISTS idx_subtitles_movie_id
    ON subtitles(movie_id);

CREATE INDEX IF NOT EXISTS idx_subtitles_language
    ON subtitles(language_code);