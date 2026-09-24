const authService = require("./auth.service");

const {
    sendVerificationEmail
} = require("../../services/email.service");

async function register(req, res) {
    try {
        const {
            email,
            password,
            displayName
        } = req.body;

        if (!email || !password || !displayName) {
            return res.status(400).json({
                success: false,
                message:
                    "Email, password and display name are required."
            });
        }

        if (String(password).length < 8) {
            return res.status(400).json({
                success: false,
                message:
                    "Password must be at least 8 characters."
            });
        }

        if (String(displayName).trim().length < 2) {
            return res.status(400).json({
                success: false,
                message:
                    "Display name must be at least 2 characters."
            });
        }

        const result =
            await authService.registerUser({
                email,
                password,
                displayName
            });

        try {
            await sendVerificationEmail({
                email: result.user.email,
                displayName: result.user.display_name,
                verificationToken:
                    result.verificationToken
            });
        } catch (emailError) {
            console.error(
                "Verification email error:",
                emailError
            );

            return res.status(502).json({
                success: false,
                message:
                    "Account was created, but the verification email could not be sent.",
                user: {
                    id: result.user.id,
                    email: result.user.email,
                    display_name:
                        result.user.display_name
                }
            });
        }

        return res.status(201).json({
            success: true,
            message:
                "Account created. Please check your email to verify your account.",
            user: {
                id: result.user.id,
                email: result.user.email,
                display_name:
                    result.user.display_name
            }
        });

    } catch (error) {
        console.error(
            "Register error:",
            error
        );

        return res.status(
            error.statusCode || 500
        ).json({
            success: false,
            message:
                error.message ||
                "Failed to create account."
        });
    }
}

async function resendVerification(req, res) {
    try {
        const {
            email
        } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message:
                    "Email address is required."
            });
        }

        try {
            const result =
                await authService.createNewVerificationToken(
                    email
                );

            await sendVerificationEmail({
                email: result.user.email,
                displayName:
                    result.user.display_name,
                verificationToken:
                    result.verificationToken
            });

        } catch (error) {
            if (error.hideAccountExistence) {
                return res.json({
                    success: true,
                    message:
                        "If an account exists with this email, a verification email has been sent."
                });
            }

            throw error;
        }

        return res.json({
            success: true,
            message:
                "A new verification email has been sent."
        });

    } catch (error) {
        console.error(
            "Resend verification error:",
            error
        );

        return res.status(
            error.statusCode || 500
        ).json({
            success: false,
            message:
                error.message ||
                "Failed to resend verification email."
        });
    }
}

async function login(req, res) {
    try {
        const {
            email,
            password
        } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message:
                    "Email and password are required."
            });
        }

        const result =
            await authService.loginUser({
                email,
                password
            });

        return res.json({
            success: true,
            message: "Login successful.",
            token: result.token,
            user: result.user
        });

    } catch (error) {
        console.error(
            "Login error:",
            error
        );

        return res.status(
            error.statusCode || 500
        ).json({
            success: false,
            message:
                error.message ||
                "Login failed.",
            code:
                error.code || undefined
        });
    }
}

async function verifyEmail(req, res) {
    try {
        const {
            token
        } = req.query;

        const user =
            await authService.verifyEmail(token);

        return res.json({
            success: true,
            message:
                "Email verified successfully.",
            user: {
                id: user.id,
                email: user.email,
                display_name:
                    user.display_name,
                email_verified:
                    user.email_verified
            }
        });

    } catch (error) {
        console.error(
            "Email verification error:",
            error
        );

        return res.status(
            error.statusCode || 500
        ).json({
            success: false,
            message:
                error.message ||
                "Email verification failed."
        });
    }
}

async function googleLogin(req, res) {
    try {
        const {
            idToken
        } = req.body;

        const result =
            await authService.authenticateGoogle(
                idToken
            );

        return res.json({
            success: true,
            message:
                "Google login successful.",
            token: result.token,
            user: result.user
        });

    } catch (error) {
        console.error(
            "Google authentication error:",
            error
        );

        return res.status(
            error.statusCode || 500
        ).json({
            success: false,
            message:
                error.message ||
                "Google authentication failed."
        });
    }
}

async function me(req, res) {
    try {
        const user =
            await authService.findUserById(
                req.user.id
            );

        if (!user) {
            return res.status(404).json({
                success: false,
                message:
                    "User account not found."
            });
        }

        return res.json({
            success: true,
            user:
                authService.sanitizeUser(user)
        });

    } catch (error) {
        console.error(
            "Get current user error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to retrieve account."
        });
    }
}

module.exports = {
    register,
    resendVerification,
    login,
    verifyEmail,
    googleLogin,
    me
};
