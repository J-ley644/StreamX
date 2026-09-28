const playbackService = require("./playback.service");

async function getPlaybackData(req, res) {
    try {
        const { movieId } = req.params;

        const data = await playbackService.getPlaybackData(
            movieId,
            req.user.id
        );

        return res.json({
            success: true,
            data
        });
    } catch (error) {
        console.error("Get playback data error:", error);

        return res.status(error.statusCode || 500).json({
            success: false,
            message:
                error.statusCode === 404
                    ? "Movie not found"
                    : "Failed to load playback data"
        });
    }
}

module.exports = {
    getPlaybackData
};