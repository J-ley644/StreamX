const { Pool } = require("pg");
const config = require("../config/env");

if (!config.databaseUrl) {
    throw new Error(
        "DATABASE_URL is not configured."
    );
}

const databaseUrl = new URL(
    config.databaseUrl
);

const pool = new Pool({
    host: databaseUrl.hostname,
    port: Number(databaseUrl.port || 5432),
    user: decodeURIComponent(databaseUrl.username),
    password: decodeURIComponent(databaseUrl.password),
    database:
        databaseUrl.pathname.replace(
            /^\//,
            ""
        ) || "neondb",

    family: 4,

    connectionTimeoutMillis: 15000,

    ssl: {
        rejectUnauthorized: false
    }
});

async function testDatabaseConnection() {
    try {
        const result = await pool.query(
            "SELECT NOW() AS current_time"
        );

        console.log(
            "StreamX PostgreSQL connected:",
            result.rows[0].current_time
        );

        return true;

    } catch (error) {
        console.error(
            "\n========== DATABASE ERROR =========="
        );

        console.error(
            "Name:",
            error.name
        );

        console.error(
            "Message:",
            error.message
        );

        console.error(
            "Code:",
            error.code
        );

        console.error(
            "Errors:",
            error.errors
        );

        console.error(
            "====================================\n"
        );

        return false;
    }
}

module.exports = {
    pool,
    testDatabaseConnection
};
