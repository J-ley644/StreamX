const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");

const { pool } = require("../../database/connection");
const config = require("../../config/env");

const googleClient = new OAuth2Client(config.googleClientId);

function normalizeEmail(email) {
    return String(email || "").trim().toLowerCase();
}

function createVerificationToken() {
    const rawToken = crypto.randomBytes(32).toString("hex");

    const hashedToken = crypto
        .createHash("sha256")
        .update(rawToken)
        .digest("hex");

    return {
        rawToken,
        hashedToken
    };
}

function createJwt(user) {
    return jwt.sign(
        {
            sub: user.id,
            email: user.email,
            displayName: user.display_name
        },
        config.jwtSecret,
        {
            expiresIn: "7d"
        }
    );
}

function sanitizeUser(user) {
    return {
        id: user.id,
        email: user.email,
        display_name: user.display_name,
        avatar_url: user.avatar_url,
        auth_provider: user.auth_provider,
        email_verified: user.email_verified,
        created_at: user.created_at,
        updated_at: user.updated_at
    };
}

async function findUserByEmail(email) {
    const result = await pool.query(
        `
        SELECT
            id,
            email,
            password_hash,
            display_name,
            avatar_url,
            auth_provider,
            google_id,
            email_verified,
            email_verification_token,
            email_verification_expires_at,
            created_at,
            updated_at
        FROM users
        WHERE LOWER(email) = LOWER($1)
        LIMIT 1;
        `,
        [normalizeEmail(email)]
    );

    return result.rows[0] || null;
}

async function findUserById(id) {
    const result = await pool.query(
        `
        SELECT
            id,
            email,
            password_hash,
            display_name,
            avatar_url,
            auth_provider,
            google_id,
            email_verified,
            created_at,
            updated_at
        FROM users
        WHERE id = $1
        LIMIT 1;
        `,
        [id]
    );

    return result.rows[0] || null;
}

async function registerUser({
    email,
    password,
    displayName
}) {
    const normalizedEmail = normalizeEmail(email);

    const existingUser = await findUserByEmail(normalizedEmail);

    if (existingUser) {
        const error = new Error(
            "An account with this email already exists."
        );

        error.statusCode = 409;
        throw error;
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const {
        rawToken,
        hashedToken
    } = createVerificationToken();

    const verificationExpiresAt = new Date(
        Date.now() + 24 * 60 * 60 * 1000
    );

    const result = await pool.query(
        `
        INSERT INTO users (
            email,
            password_hash,
            display_name,
            auth_provider,
            email_verified,
            email_verification_token,
            email_verification_expires_at
        )
        VALUES ($1,$2,$3,'local',FALSE,$4,$5)
        RETURNING
            id,
            email,
            display_name,
            avatar_url,
            auth_provider,
            email_verified,
            created_at,
            updated_at;
        `,
        [
            normalizedEmail,
            passwordHash,
            String(displayName).trim(),
            hashedToken,
            verificationExpiresAt
        ]
    );

    return {
        user: result.rows[0],
        verificationToken: rawToken
    };
}

async function createNewVerificationToken(email) {
    const normalizedEmail = normalizeEmail(email);

    const user = await findUserByEmail(normalizedEmail);

    if (!user) {
        const error = new Error(
            "If an account exists with this email, a verification email will be sent."
        );

        error.statusCode = 200;
        error.hideAccountExistence = true;
        throw error;
    }

    if (user.email_verified) {
        const error = new Error(
            "This email address is already verified."
        );

        error.statusCode = 400;
        throw error;
    }

    if (user.auth_provider !== "local") {
        const error = new Error(
            "This account uses Google authentication and does not require email verification."
        );

        error.statusCode = 400;
        throw error;
    }

    const {
        rawToken,
        hashedToken
    } = createVerificationToken();

    const verificationExpiresAt = new Date(
        Date.now() + 24 * 60 * 60 * 1000
    );

    const result = await pool.query(
        `
        UPDATE users
        SET
            email_verification_token = $1,
            email_verification_expires_at = $2,
            updated_at = NOW()
        WHERE id = $3
        RETURNING
            id,
            email,
            display_name,
            avatar_url,
            auth_provider,
            email_verified,
            created_at,
            updated_at;
        `,
        [
            hashedToken,
            verificationExpiresAt,
            user.id
        ]
    );

    return {
        user: result.rows[0],
        verificationToken: rawToken
    };
}

async function verifyEmail(rawToken) {
    if (!rawToken) {
        const error = new Error(
            "Verification token is required."
        );

        error.statusCode = 400;
        throw error;
    }

    const hashedToken = crypto
        .createHash("sha256")
        .update(rawToken)
        .digest("hex");

    const result = await pool.query(
        `
        UPDATE users
        SET
            email_verified = TRUE,
            email_verification_token = NULL,
            email_verification_expires_at = NULL,
            updated_at = NOW()
        WHERE
            email_verification_token = $1
            AND email_verification_expires_at > NOW()
            AND email_verified = FALSE
        RETURNING
            id,
            email,
            display_name,
            avatar_url,
            auth_provider,
            email_verified,
            created_at,
            updated_at;
        `,
        [hashedToken]
    );

    if (!result.rows[0]) {
        const error = new Error(
            "This verification link is invalid or has expired."
        );

        error.statusCode = 400;
        throw error;
    }

    return result.rows[0];
}

async function loginUser({
    email,
    password
}) {
    const normalizedEmail = normalizeEmail(email);

    const user = await findUserByEmail(normalizedEmail);

    if (!user || !user.password_hash) {
        const error = new Error(
            "Invalid email or password."
        );

        error.statusCode = 401;
        throw error;
    }

    const passwordMatches = await bcrypt.compare(
        password,
        user.password_hash
    );

    if (!passwordMatches) {
        const error = new Error(
            "Invalid email or password."
        );

        error.statusCode = 401;
        throw error;
    }

    if (!user.email_verified) {
        const error = new Error(
            "Please verify your email before logging in."
        );

        error.statusCode = 403;
        error.code = "EMAIL_NOT_VERIFIED";

        throw error;
    }

    return {
        user: sanitizeUser(user),
        token: createJwt(user)
    };
}

async function authenticateGoogle(idToken) {
    if (!config.googleClientId) {
        const error = new Error(
            "Google authentication is not configured."
        );

        error.statusCode = 500;
        throw error;
    }

    if (!idToken) {
        const error = new Error(
            "Google ID token is required."
        );

        error.statusCode = 400;
        throw error;
    }

    let payload;

    try {
        const ticket = await googleClient.verifyIdToken({
            idToken,
            audience: config.googleClientId
        });

        payload = ticket.getPayload();
    } catch (error) {
        const authError = new Error(
            "Invalid Google authentication token."
        );

        authError.statusCode = 401;
        throw authError;
    }

    if (
        !payload ||
        !payload.email ||
        payload.email_verified !== true
    ) {
        const error = new Error(
            "Google account email could not be verified."
        );

        error.statusCode = 401;
        throw error;
    }

    const email = normalizeEmail(payload.email);

    let user = await findUserByEmail(email);

    if (user) {
        if (
            user.google_id &&
            user.google_id !== payload.sub
        ) {
            const error = new Error(
                "This email is already connected to another Google account."
            );

            error.statusCode = 409;
            throw error;
        }

        const result = await pool.query(
            `
            UPDATE users
            SET
                google_id = $1,
                email_verified = TRUE,
                avatar_url = COALESCE($2, avatar_url),
                updated_at = NOW()
            WHERE id = $3
            RETURNING
                id,
                email,
                password_hash,
                display_name,
                avatar_url,
                auth_provider,
                google_id,
                email_verified,
                created_at,
                updated_at;
            `,
            [
                payload.sub,
                payload.picture || null,
                user.id
            ]
        );

        user = result.rows[0];
    } else {
        const displayName =
            payload.name ||
            payload.given_name ||
            email.split("@")[0];

        const result = await pool.query(
            `
            INSERT INTO users (
                email,
                password_hash,
                display_name,
                avatar_url,
                auth_provider,
                google_id,
                email_verified
            )
            VALUES ($1,NULL,$2,$3,'google',$4,TRUE)
            RETURNING
                id,
                email,
                password_hash,
                display_name,
                avatar_url,
                auth_provider,
                google_id,
                email_verified,
                created_at,
                updated_at;
            `,
            [
                email,
                displayName,
                payload.picture || null,
                payload.sub
            ]
        );

        user = result.rows[0];
    }

    return {
        user: sanitizeUser(user),
        token: createJwt(user)
    };
}

module.exports = {
    registerUser,
    createNewVerificationToken,
    verifyEmail,
    loginUser,
    authenticateGoogle,
    findUserById,
    sanitizeUser
};
