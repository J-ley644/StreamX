const { pool } = require("../../database/connection");

async function getMovies({ search, genre, year, limit = 20, offset = 0 }) {
    const values = [];
    const conditions = [];

    if (search) {
        values.push(`%${search}%`);
        conditions.push(`
            (
                m.title ILIKE $${values.length}
                OR m.description ILIKE $${values.length}
            )
        `);
    }

    if (year) {
        values.push(Number(year));
        conditions.push(`m.release_year = $${values.length}`);
    }

    if (genre) {
        values.push(genre);
        conditions.push(`
            EXISTS (
                SELECT 1
                FROM movie_genres mg2
                JOIN genres g2
                    ON g2.id = mg2.genre_id
                WHERE mg2.movie_id = m.id
                AND LOWER(g2.name) = LOWER($${values.length})
            )
        `);
    }

    const whereClause =
        conditions.length > 0
            ? `WHERE ${conditions.join(" AND ")}`
            : "";

    values.push(Number(limit));
    const limitIndex = values.length;

    values.push(Number(offset));
    const offsetIndex = values.length;

    const query = `
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

            COALESCE(
                JSON_AGG(
                    DISTINCT JSONB_BUILD_OBJECT(
                        'id', g.id,
                        'name', g.name
                    )
                ) FILTER (WHERE g.id IS NOT NULL),
                '[]'
            ) AS genres

        FROM movies m

        LEFT JOIN movie_genres mg
            ON mg.movie_id = m.id

        LEFT JOIN genres g
            ON g.id = mg.genre_id

        ${whereClause}

        GROUP BY m.id

        ORDER BY m.created_at DESC

        LIMIT $${limitIndex}
        OFFSET $${offsetIndex};
    `;

    const result = await pool.query(query, values);

    return result.rows;
}


async function getMovieById(id) {
    const query = `
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

            COALESCE(
                JSON_AGG(
                    DISTINCT JSONB_BUILD_OBJECT(
                        'id', g.id,
                        'name', g.name
                    )
                ) FILTER (WHERE g.id IS NOT NULL),
                '[]'
            ) AS genres

        FROM movies m

        LEFT JOIN movie_genres mg
            ON mg.movie_id = m.id

        LEFT JOIN genres g
            ON g.id = mg.genre_id

        WHERE m.id = $1

        GROUP BY m.id;
    `;

    const result = await pool.query(query, [id]);

    return result.rows[0] || null;
}


async function createMovie(movie) {
    const {
        title,
        description,
        release_year,
        duration_seconds,
        rating,
        poster_url,
        backdrop_url,
        video_status
    } = movie;

    const query = `
        INSERT INTO movies (
            title,
            description,
            release_year,
            duration_seconds,
            rating,
            poster_url,
            backdrop_url,
            video_status
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
        RETURNING *;
    `;

    const values = [
        title,
        description || null,
        release_year || null,
        duration_seconds || null,
        rating || null,
        poster_url || null,
        backdrop_url || null,
        video_status || "pending"
    ];

    const result = await pool.query(query, values);

    return result.rows[0];
}


async function deleteMovie(id) {
    const result = await pool.query(
        `
        DELETE FROM movies
        WHERE id = $1
        RETURNING id;
        `,
        [id]
    );

    return result.rows[0] || null;
}


module.exports = {
    getMovies,
    getMovieById,
    createMovie,
    deleteMovie
};