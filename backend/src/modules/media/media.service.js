const { pool } = require("../../database/connection");

async function getMovieVideoAssets(movieId) {
    const result = await pool.query(
        `
        SELECT
            id,
            movie_id,
            quality,
            format,
            stream_url,
            download_url,
            file_size_bytes,
            duration_seconds,
            status,
            created_at,
            updated_at
        FROM video_assets
        WHERE movie_id = $1
        ORDER BY
            CASE quality
                WHEN '1080p' THEN 1
                WHEN '720p' THEN 2
                WHEN '480p' THEN 3
                WHEN '360p' THEN 4
                ELSE 5
            END,
            created_at DESC
        `,
        [movieId]
    );

    return result.rows;
}

async function getMovieSubtitles(movieId) {
    const result = await pool.query(
        `
        SELECT
            id,
            movie_id,
            language_code,
            language_name,
            format,
            file_url,
            status,
            created_at,
            updated_at
        FROM subtitles
        WHERE movie_id = $1
        ORDER BY language_name ASC
        `,
        [movieId]
    );

    return result.rows;
}

async function getMovieMedia(movieId) {
    const [
        videoAssets,
        subtitles
    ] = await Promise.all([
        getMovieVideoAssets(movieId),
        getMovieSubtitles(movieId)
    ]);

    return {
        video_assets: videoAssets,
        subtitles
    };
}

async function getVideoAssetById(id) {
    const result = await pool.query(
        `
        SELECT
            id,
            movie_id,
            quality,
            format,
            stream_url,
            download_url,
            file_size_bytes,
            duration_seconds,
            status,
            created_at,
            updated_at
        FROM video_assets
        WHERE id = $1
        LIMIT 1
        `,
        [id]
    );

    return result.rows[0] || null;
}

async function createVideoAsset(asset) {
    const {
        movie_id,
        quality,
        format = "mp4",
        stream_url,
        download_url = null,
        file_size_bytes = null,
        duration_seconds = null,
        status = "pending"
    } = asset;

    const result = await pool.query(
        `
        INSERT INTO video_assets (
            movie_id,
            quality,
            format,
            stream_url,
            download_url,
            file_size_bytes,
            duration_seconds,
            status
        )
        VALUES (
            $1,
            $2,
            $3,
            $4,
            $5,
            $6,
            $7,
            $8
        )
        RETURNING
            id,
            movie_id,
            quality,
            format,
            stream_url,
            download_url,
            file_size_bytes,
            duration_seconds,
            status,
            created_at,
            updated_at
        `,
        [
            movie_id,
            quality,
            format,
            stream_url,
            download_url,
            file_size_bytes,
            duration_seconds,
            status
        ]
    );

    return result.rows[0];
}

async function deleteVideoAsset(id) {
    const result = await pool.query(
        `
        DELETE FROM video_assets
        WHERE id = $1
        RETURNING id
        `,
        [id]
    );

    return result.rows[0] || null;
}

async function createSubtitle(subtitle) {
    const {
        movie_id,
        language_code,
        language_name,
        format = "vtt",
        file_url,
        status = "pending"
    } = subtitle;

    const result = await pool.query(
        `
        INSERT INTO subtitles (
            movie_id,
            language_code,
            language_name,
            format,
            file_url,
            status
        )
        VALUES (
            $1,
            $2,
            $3,
            $4,
            $5,
            $6
        )
        RETURNING
            id,
            movie_id,
            language_code,
            language_name,
            format,
            file_url,
            status,
            created_at,
            updated_at
        `,
        [
            movie_id,
            language_code,
            language_name,
            format,
            file_url,
            status
        ]
    );

    return result.rows[0];
}

async function deleteSubtitle(id) {
    const result = await pool.query(
        `
        DELETE FROM subtitles
        WHERE id = $1
        RETURNING id
        `,
        [id]
    );

    return result.rows[0] || null;
}

module.exports = {
    getMovieVideoAssets,
    getMovieSubtitles,
    getMovieMedia,
    getVideoAssetById,
    createVideoAsset,
    deleteVideoAsset,
    createSubtitle,
    deleteSubtitle
};
