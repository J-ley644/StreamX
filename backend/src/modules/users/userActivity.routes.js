const express = require("express");

const router = express.Router();

const controller =
    require("./userActivity.controller");

const {
    requireAuth
} = require("../../middleware/auth.middleware");


// ============================================
// WATCHLIST
// ============================================

router.get(
    "/watchlist",
    requireAuth,
    controller.getWatchlist
);

router.post(
    "/watchlist/:movieId",
    requireAuth,
    controller.addToWatchlist
);

router.delete(
    "/watchlist/:movieId",
    requireAuth,
    controller.removeFromWatchlist
);

router.get(
    "/watchlist/:movieId",
    requireAuth,
    controller.checkWatchlist
);


// ============================================
// WATCH HISTORY
// ============================================

router.get(
    "/history",
    requireAuth,
    controller.getWatchHistory
);

router.post(
    "/history/:movieId",
    requireAuth,
    controller.updateWatchProgress
);

router.delete(
    "/history/:movieId",
    requireAuth,
    controller.removeFromWatchHistory
);


module.exports = router;