const { Pool } = require("pg");
const config = require("../config/env");

const pool = new Pool({
    connectionString: config.databaseUrl,

    // Force IPv4.
    family: 4,

    // Give Neon enough time to establish the connection.
    connectionTimeoutMillis: 15000,

    // Neon requires SSL.
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

        console.error("\n========== DATABASE ERROR ==========");
        console.error("Name:", error.name);
        console.error("Message:", error.message);
        console.error("Code:", error.code);
        console.error("Errors:", error.errors);
        console.error("====================================\n");

        return false;
    }
}

module.exports = {
    pool,
    testDatabaseConnection
};