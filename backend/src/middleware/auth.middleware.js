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
            displayName: decoded.displayName
        };

        next();

    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Invalid or expired authentication token."
        });
    }
}

module.exports = {
    requireAuth
};
