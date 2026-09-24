const activityService = require("./userActivity.service");


// ============================================
// WATCHLIST
// ============================================

async function getWatchlist(req, res) {
    try {
        const movies =
            await activityService.getWatchlist(
                req.user.id
            );

        return res.json({
            success: true,
            data: movies
        });

    } catch (error) {
        console.error(
            "Get watchlist error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to fetch watchlist"
        });
    }
}


async function addToWatchlist(req, res) {
    try {
        const { movieId } = req.params;

        const item =
            await activityService.addToWatchlist(
                req.user.id,
                movieId
            );

        if (!item) {
            return res.status(409).json({
                success: false,
                message: "Movie is already in watchlist"
            });
        }

        return res.status(201).json({
            success: true,
            data: item
        });

    } catch (error) {
        console.error(
            "Add watchlist error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to add movie to watchlist"
        });
    }
}


async function removeFromWatchlist(req, res) {
    try {
        const { movieId } = req.params;

        const item =
            await activityService.removeFromWatchlist(
                req.user.id,
                movieId
            );

        if (!item) {
            return res.status(404).json({
                success: false,
                message: "Movie is not in watchlist"
            });
        }

        return res.json({
            success: true,
            message: "Movie removed from watchlist"
        });

    } catch (error) {
        console.error(
            "Remove watchlist error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to remove movie from watchlist"
        });
    }
}


async function checkWatchlist(req, res) {
    try {
        const { movieId } = req.params;

        const exists =
            await activityService.isInWatchlist(
                req.user.id,
                movieId
            );

        return res.json({
            success: true,
            data: {
                in_watchlist: exists
            }
        });

    } catch (error) {
        console.error(
            "Check watchlist error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to check watchlist"
        });
    }
}


// ============================================
// WATCH HISTORY
// ============================================

async function getWatchHistory(req, res) {
    try {
        const history =
            await activityService.getWatchHistory(
                req.user.id
            );

        return res.json({
            success: true,
            data: history
        });

    } catch (error) {
        console.error(
            "Get watch history error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to fetch watch history"
        });
    }
}


async function updateWatchProgress(req, res) {
    try {
        const { movieId } = req.params;

        const {
            progress_seconds,
            duration_seconds
        } = req.body;

        if (
            progress_seconds === undefined ||
            progress_seconds === null
        ) {
            return res.status(400).json({
                success: false,
                message: "progress_seconds is required"
            });
        }

        const history =
            await activityService.updateWatchProgress(
                req.user.id,
                movieId,
                progress_seconds,
                duration_seconds
            );

        return res.json({
            success: true,
            data: history
        });

    } catch (error) {
        console.error(
            "Update watch progress error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to update watch progress"
        });
    }
}


async function removeFromWatchHistory(req, res) {
    try {
        const { movieId } = req.params;

        const item =
            await activityService.removeFromWatchHistory(
                req.user.id,
                movieId
            );

        if (!item) {
            return res.status(404).json({
                success: false,
                message: "Movie is not in watch history"
            });
        }

        return res.json({
            success: true,
            message: "Movie removed from watch history"
        });

    } catch (error) {
        console.error(
            "Remove watch history error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to remove movie from watch history"
        });
    }
}


module.exports = {
    getWatchlist,
    addToWatchlist,
    removeFromWatchlist,
    checkWatchlist,

    getWatchHistory,
    updateWatchProgress,
    removeFromWatchHistory
};