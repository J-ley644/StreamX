const fs = require("fs");
const path = require("path");

const { pool } = require("./connection");

async function runMigrations() {
    const migrationsDir = path.join(__dirname, "migrations");

    const files = fs
        .readdirSync(migrationsDir)
        .filter((file) => file.endsWith(".sql"))
        .sort();

    if (files.length === 0) {
        console.log("No migrations found.");
        return;
    }

    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        await client.query(`
            CREATE TABLE IF NOT EXISTS schema_migrations (
                id SERIAL PRIMARY KEY,
                filename VARCHAR(255) NOT NULL UNIQUE,
                applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            );
        `);

        for (const file of files) {
            const alreadyApplied = await client.query(
                `
                SELECT id
                FROM schema_migrations
                WHERE filename = $1
                `,
                [file]
            );

            if (alreadyApplied.rowCount > 0) {
                console.log(`Skipping ${file}`);
                continue;
            }

            const filePath = path.join(migrationsDir, file);
            const sql = fs.readFileSync(filePath, "utf8");

            console.log(`Running ${file}...`);

            await client.query(sql);

            await client.query(
                `
                INSERT INTO schema_migrations (filename)
                VALUES ($1)
                `,
                [file]
            );

            console.log(`Applied ${file}`);
        }

        await client.query("COMMIT");

        console.log("\nAll migrations completed successfully.");
    } catch (error) {
        await client.query("ROLLBACK");

        console.error("\nMigration failed:");
        console.error(error.message);

        process.exitCode = 1;
    } finally {
        client.release();
        await pool.end();
    }
}

runMigrations();