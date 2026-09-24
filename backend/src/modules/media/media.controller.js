const mediaService = require("./media.service");


async function getMovieMedia(req, res) {
    try {
        const { movieId } = req.params;

        const media = await mediaService.getMovieMedia(movieId);

        return res.json({
            success: true,
            data: media
        });
    } catch (error) {
        console.error("Get movie media error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch movie media"
        });
    }
}


async function getMovieVideoAssets(req, res) {
    try {
        const { movieId } = req.params;

        const assets = await mediaService.getMovieVideoAssets(movieId);

        return res.json({
            success: true,
            data: assets
        });
    } catch (error) {
        console.error("Get video assets error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch video assets"
        });
    }
}


async function getMovieSubtitles(req, res) {
    try {
        const { movieId } = req.params;

        const subtitles = await mediaService.getMovieSubtitles(movieId);

        return res.json({
            success: true,
            data: subtitles
        });
    } catch (error) {
        console.error("Get subtitles error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch subtitles"
        });
    }
}


async function createVideoAsset(req, res) {
    try {
        const { movieId } = req.params;

        const asset = await mediaService.createVideoAsset({
            ...req.body,
            movie_id: movieId
        });

        return res.status(201).json({
            success: true,
            data: asset
        });
    } catch (error) {
        console.error("Create video asset error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to create video asset"
        });
    }
}


async function deleteVideoAsset(req, res) {
    try {
        const { assetId } = req.params;

        const asset = await mediaService.deleteVideoAsset(assetId);

        if (!asset) {
            return res.status(404).json({
                success: false,
                message: "Video asset not found"
            });
        }

        return res.json({
            success: true,
            message: "Video asset deleted successfully"
        });
    } catch (error) {
        console.error("Delete video asset error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to delete video asset"
        });
    }
}


async function createSubtitle(req, res) {
    try {
        const { movieId } = req.params;

        const subtitle = await mediaService.createSubtitle({
            ...req.body,
            movie_id: movieId
        });

        return res.status(201).json({
            success: true,
            data: subtitle
        });
    } catch (error) {
        console.error("Create subtitle error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to create subtitle"
        });
    }
}


async function deleteSubtitle(req, res) {
    try {
        const { subtitleId } = req.params;

        const subtitle = await mediaService.deleteSubtitle(subtitleId);

        if (!subtitle) {
            return res.status(404).json({
                success: false,
                message: "Subtitle not found"
            });
        }

        return res.json({
            success: true,
            message: "Subtitle deleted successfully"
        });
    } catch (error) {
        console.error("Delete subtitle error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to delete subtitle"
        });
    }
}


module.exports = {
    getMovieMedia,
    getMovieVideoAssets,
    getMovieSubtitles,
    createVideoAsset,
    deleteVideoAsset,
    createSubtitle,
    deleteSubtitle
};