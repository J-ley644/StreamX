const { pool } = require("../../database/connection");

async function getDashboard(req, res) {
    try {
        const [
            moviesResult,
            usersResult,
            readyVideosResult,
            pendingVideosResult
        ] = await Promise.all([
            pool.query(`
                SELECT COUNT(*)::int AS count
                FROM movies;
            `),

            pool.query(`
                SELECT COUNT(*)::int AS count
                FROM users;
            `),

            pool.query(`
                SELECT COUNT(*)::int AS count
                FROM video_assets
                WHERE status = 'ready';
            `),

            pool.query(`
                SELECT COUNT(*)::int AS count
                FROM video_assets
                WHERE status IN ('pending', 'processing');
            `)
        ]);

        res.json({
            success: true,
            data: {
                movies: moviesResult.rows[0].count,
                users: usersResult.rows[0].count,
                readyVideos: readyVideosResult.rows[0].count,
                pendingVideos: pendingVideosResult.rows[0].count
            }
        });

    } catch (error) {
        console.error("Admin dashboard error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to load admin dashboard."
        });
    }
}

module.exports = {
    getDashboard
};