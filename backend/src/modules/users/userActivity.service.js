const { pool } = require("../../database/connection");


// ============================================
// WATCHLIST
// ============================================

async function getWatchlist(userId) {
    const result = await pool.query(
        `
        SELECT
            m.id,
            m.title,
            m.description,
            m.release_year,
            m.duration_seconds,
            m.rating,
            m.poster_url,
            m.backdrop_url,
            m.video_status,
            w.created_at AS added_at

        FROM watchlist w

        INNER JOIN movies m
            ON m.id = w.movie_id

        WHERE w.user_id = $1

        ORDER BY w.created_at DESC;
        `,
        [userId]
    );

    return result.rows;
}


async function addToWatchlist(userId, movieId) {
    const result = await pool.query(
        `
        INSERT INTO watchlist (
            user_id,
            movie_id
        )

        VALUES ($1, $2)

        ON CONFLICT (user_id, movie_id)
        DO NOTHING

        RETURNING
            user_id,
            movie_id,
            created_at;
        `,
        [userId, movieId]
    );

    return result.rows[0] || null;
}


async function removeFromWatchlist(userId, movieId) {
    const result = await pool.query(
        `
        DELETE FROM watchlist

        WHERE user_id = $1
        AND movie_id = $2

        RETURNING
            user_id,
            movie_id;
        `,
        [userId, movieId]
    );

    return result.rows[0] || null;
}


async function isInWatchlist(userId, movieId) {
    const result = await pool.query(
        `
        SELECT
            user_id,
            movie_id
        FROM watchlist

        WHERE user_id = $1
        AND movie_id = $2

        LIMIT 1;
        `,
        [userId, movieId]
    );

    return !!result.rows[0];
}


// ============================================
// WATCH HISTORY
// ============================================

async function getWatchHistory(userId) {
    const result = await pool.query(
        `
        SELECT
            m.id,
            m.title,
            m.description,
            m.release_year,
            m.duration_seconds,
            m.rating,
            m.poster_url,
            m.backdrop_url,
            m.video_status,

            wh.progress_seconds,
            wh.completed,
            wh.last_watched_at,
            wh.updated_at

        FROM watch_history wh

        INNER JOIN movies m
            ON m.id = wh.movie_id

        WHERE wh.user_id = $1

        ORDER BY wh.last_watched_at DESC;
        `,
        [userId]
    );

    return result.rows;
}


async function updateWatchProgress(
    userId,
    movieId,
    progressSeconds,
    durationSeconds
) {
    const progress = Math.max(
        0,
        Number(progressSeconds) || 0
    );

    const duration =
        durationSeconds !== undefined &&
        durationSeconds !== null
            ? Math.max(
                0,
                Number(durationSeconds) || 0
            )
            : null;

    const completed =
        duration !== null &&
        duration > 0 &&
        progress >= duration * 0.95;

    const result = await pool.query(
        `
        INSERT INTO watch_history (
            user_id,
            movie_id,
            progress_seconds,
            completed,
            last_watched_at,
            updated_at
        )

        VALUES (
            $1,
            $2,
            $3,
            $4,
            NOW(),
            NOW()
        )

        ON CONFLICT (user_id, movie_id)

        DO UPDATE SET
            progress_seconds = EXCLUDED.progress_seconds,
            completed = EXCLUDED.completed,
            last_watched_at = NOW(),
            updated_at = NOW()

        RETURNING *;
        `,
        [
            userId,
            movieId,
            progress,
            completed
        ]
    );

    return result.rows[0];
}


async function removeFromWatchHistory(userId, movieId) {
    const result = await pool.query(
        `
        DELETE FROM watch_history

        WHERE user_id = $1
        AND movie_id = $2

        RETURNING
            user_id,
            movie_id;
        `,
        [userId, movieId]
    );

    return result.rows[0] || null;
}


module.exports = {
    getWatchlist,
    addToWatchlist,
    removeFromWatchlist,
    isInWatchlist,

    getWatchHistory,
    updateWatchProgress,
    removeFromWatchHistory
};