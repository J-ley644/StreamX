
const { pool } = require("../../database/connection");

async function getPlaybackData(movieId, userId) {
    const movieResult = await pool.query(
        `
        SELECT
            id,
            title,
            description,
            poster_url,
            backdrop_url,
            release_year,
            duration_seconds
        FROM movies
        WHERE id = $1
        LIMIT 1;
        `,
        [movieId]
    );

    if (movieResult.rows.length === 0) {
        const error = new Error("Movie not found");
        error.statusCode = 404;
        throw error;
    }

    const [videoResult, subtitleResult, historyResult] =
        await Promise.all([
            pool.query(
                `
                SELECT
                    id,
                    quality,
                    format,
                    stream_url,
                    duration_seconds,
                    status
                FROM video_assets
                WHERE movie_id = $1
                  AND status = 'ready'
                ORDER BY
                    CASE quality
                        WHEN '1080p' THEN 1
                        WHEN '720p' THEN 2
                        WHEN '480p' THEN 3
                        WHEN '360p' THEN 4
                        ELSE 5
                    END;
                `,
                [movieId]
            ),

            pool.query(
                `
                SELECT
                    id,
                    language_code,
                    language_name,
                    format,
                    file_url,
                    status
                FROM subtitles
                WHERE movie_id = $1
                  AND status = 'ready'
                ORDER BY language_name ASC;
                `,
                [movieId]
            ),

            pool.query(
                `
                SELECT
                    progress_seconds,
                    completed,
                    last_watched_at
                FROM watch_history
                WHERE user_id = $1
                  AND movie_id = $2
                LIMIT 1;
                `,
                [userId, movieId]
            )
        ]);

    const history = historyResult.rows[0];

    return {
        movie: movieResult.rows[0],

        video_assets: videoResult.rows,

        subtitles: subtitleResult.rows,

        progress: history
            ? {
                progress_seconds: history.progress_seconds,
                duration_seconds:
                    movieResult.rows[0].duration_seconds,
                completed: history.completed,
                last_watched_at: history.last_watched_at
            }
            : {
                progress_seconds: 0,
                duration_seconds:
                    movieResult.rows[0].duration_seconds,
                completed: false,
                last_watched_at: null
            }
    };
}

module.exports = {
    getPlaybackData
};

