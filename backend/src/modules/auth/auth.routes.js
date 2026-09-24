const express = require("express");

const controller = require("./auth.controller");

const {
    requireAuth
} = require("../../middleware/auth.middleware");

const router = express.Router();

router.post(
    "/register",
    controller.register
);

router.post(
    "/resend-verification",
    controller.resendVerification
);

router.post(
    "/login",
    controller.login
);

router.get(
    "/verify-email",
    controller.verifyEmail
);

router.post(
    "/google",
    controller.googleLogin
);

router.get(
    "/me",
    requireAuth,
    controller.me
);

module.exports = router;
