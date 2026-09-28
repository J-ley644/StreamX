
const jwt = require("jsonwebtoken");
const config = require("../config/env");

function requireAuth(req, res, next) {
    try {
        const authorization =
            req.headers.authorization || "";

        if (!authorization.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Authentication required."
            });
        }

        const token =
            authorization.substring(7).trim();

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Authentication token is missing."
            });
        }

        const decoded =
            jwt.verify(token, config.jwtSecret);

        req.user = {
            id: decoded.sub,
            email: decoded.email,
            displayName: decoded.displayName,
            role: decoded.role || "user"
        };

        next();

    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Invalid or expired authentication token."
        });
    }
}

function requireAdmin(req, res, next) {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: "Authentication required."
        });
    }

    if (req.user.role !== "admin") {
        return res.status(403).json({
            success: false,
            message: "Administrator access required."
        });
    }

    next();
}

module.exports = {
    requireAuth,
    requireAdmin
};

