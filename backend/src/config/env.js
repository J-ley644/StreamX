require("dotenv").config();

const config = {
    port: process.env.PORT || 5000,
    databaseUrl: process.env.DATABASE_URL || ""
};

module.exports = config;