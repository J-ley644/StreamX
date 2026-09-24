const app = require("./app");
const config = require("./config/env");
const {
    testDatabaseConnection
} = require("./database/connection");

async function startServer() {

    const databaseConnected =
        await testDatabaseConnection();

    if (!databaseConnected) {
        console.error(
            "StreamX cannot start without database access."
        );

        process.exit(1);
    }

    app.listen(config.port, () => {

        console.log(
            `StreamX API running on port ${config.port}`
        );

    });
}

startServer();