const express = require("express");

const controller = require("./playback.controller");

const {
    requireAuth
} = require("../../middleware/auth.middleware");

const router = express.Router();

router.get(
    "/movies/:movieId",
    requireAuth,
    controller.getPlaybackData
);

module.exports = router;