const { pool } = require("../../database/connection");

async function getGenres() {
    const result = await pool.query(`
        SELECT
            id,
            name,
            created_at
        FROM genres
        ORDER BY name ASC;
    `);

    return result.rows;
}

async function createGenre(name) {
    const result = await pool.query(
        `
        INSERT INTO genres (name)
        VALUES ($1)
        RETURNING id, name, created_at;
        `,
        [name.trim()]
    );

    return result.rows[0];
}

async function deleteGenre(id) {
    const result = await pool.query(
        `
        DELETE FROM genres
        WHERE id = $1
        RETURNING id, name;
        `,
        [id]
    );

    return result.rows[0] || null;
}

module.exports = {
    getGenres,
    createGenre,
    deleteGenre
};