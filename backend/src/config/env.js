require("dotenv").config();

const config = {
    port: process.env.PORT || 5000,
    databaseUrl: process.env.DATABASE_URL || "",

    jwtSecret: process.env.JWT_SECRET || "",

    googleClientId: process.env.GOOGLE_CLIENT_ID || "",

    resendApiKey: process.env.RESEND_API_KEY || "",
    emailFrom: process.env.EMAIL_FROM || "",

    frontendUrl:
        process.env.FRONTEND_URL || "http://localhost:3000"
};

module.exports = config;