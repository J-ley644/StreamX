const https = require("https");

const config = require("../config/env");

function escapeHtml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function sendResendRequest(payload) {
    return new Promise((resolve, reject) => {
        const body = JSON.stringify(payload);

        const request = https.request(
            {
                hostname: "api.resend.com",
                port: 443,
                path: "/emails",
                method: "POST",

                family: 4,

                timeout: 20000,

                headers: {
                    Authorization:
                        `Bearer ${config.resendApiKey}`,
                    "Content-Type":
                        "application/json",
                    "Content-Length":
                        Buffer.byteLength(body)
                }
            },
            (response) => {
                let responseBody = "";

                response.setEncoding("utf8");

                response.on(
                    "data",
                    (chunk) => {
                        responseBody += chunk;
                    }
                );

                response.on(
                    "end",
                    () => {
                        let data = {};

                        try {
                            data =
                                responseBody
                                    ? JSON.parse(responseBody)
                                    : {};
                        } catch (error) {
                            data = {
                                raw: responseBody
                            };
                        }

                        resolve({
                            statusCode:
                                response.statusCode || 500,
                            data
                        });
                    }
                );
            }
        );

        request.on(
            "timeout",
            () => {
                request.destroy(
                    new Error(
                        "Connection to Resend timed out."
                    )
                );
            }
        );

        request.on(
            "error",
            (error) => {
                reject(error);
            }
        );

        request.write(body);
        request.end();
    });
}

async function sendVerificationEmail({
    email,
    displayName,
    verificationToken
}) {
    if (!config.resendApiKey) {
        throw new Error(
            "RESEND_API_KEY is not configured."
        );
    }

    if (!config.emailFrom) {
        throw new Error(
            "EMAIL_FROM is not configured."
        );
    }

    if (!email) {
        throw new Error(
            "Verification email recipient is required."
        );
    }

    if (!verificationToken) {
        throw new Error(
            "Verification token is required."
        );
    }

    const verificationUrl =
        `${config.frontendUrl}/verify-email?token=${encodeURIComponent(
            verificationToken
        )}`;

    const result =
        await sendResendRequest({
            from: config.emailFrom,
            to: [email],
            subject:
                "Verify your StreamX account",

            html: `
                <div
                    style="
                        font-family:Arial,sans-serif;
                        max-width:600px;
                        margin:auto;
                        padding:30px;
                        color:#222;
                    "
                >
                    <h1>
                        Welcome to StreamX ??
                    </h1>

                    <p>
                        Hello ${escapeHtml(displayName)},
                    </p>

                    <p>
                        Thanks for creating your
                        StreamX account.
                    </p>

                    <p>
                        Please verify your email address
                        to activate your account.
                    </p>

                    <p style="margin:30px 0">
                        <a
                            href="${verificationUrl}"
                            style="
                                background:#e50914;
                                color:#ffffff;
                                padding:14px 24px;
                                text-decoration:none;
                                border-radius:6px;
                                display:inline-block;
                                font-weight:bold;
                            "
                        >
                            Verify Email
                        </a>
                    </p>

                    <p>
                        This verification link expires
                        in 24 hours.
                    </p>

                    <p>
                        If you didn't create this account,
                        you can safely ignore this email.
                    </p>

                    <p>
                        — StreamX
                    </p>
                </div>
            `
        });

    if (
        result.statusCode < 200 ||
        result.statusCode >= 300
    ) {
        const error = new Error(
            result.data.message ||
            "Failed to send verification email."
        );

        error.statusCode = 502;
        error.resend = result.data;

        throw error;
    }

    return result.data;
}

module.exports = {
    sendVerificationEmail
};
