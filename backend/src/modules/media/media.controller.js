const mediaService = require("./media.service");
const {
    deleteVideoFile
} = require("../uploads/storage.service");

async function getMovieMedia(req, res) {
    try {
        const data =
            await mediaService.getMovieMedia(
                req.params.movieId
            );

        res.json({
            success: true,
            data
        });
    } catch (error) {
        console.error(
            "Get movie media error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Failed to load movie media."
        });
    }
}

async function getMovieVideoAssets(req, res) {
    try {
        const data =
            await mediaService.getMovieVideoAssets(
                req.params.movieId
            );

        res.json({
            success: true,
            data
        });
    } catch (error) {
        console.error(
            "Get video assets error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Failed to load video assets."
        });
    }
}

async function getMovieSubtitles(req, res) {
    try {
        const data =
            await mediaService.getMovieSubtitles(
                req.params.movieId
            );

        res.json({
            success: true,
            data
        });
    } catch (error) {
        console.error(
            "Get subtitles error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Failed to load subtitles."
        });
    }
}

async function createVideoAsset(req, res) {
    try {
        const movieId =
            req.params.movieId;

        const asset =
            await mediaService.createVideoAsset({
                movie_id: movieId,
                ...req.body
            });

        res.status(201).json({
            success: true,
            data: asset
        });
    } catch (error) {
        console.error(
            "Create video asset error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Failed to create video asset."
        });
    }
}

async function uploadVideo(req, res) {
    let uploadedFilename = null;

    try {
        const movieId =
            req.params.movieId;

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message:
                    "Please select an MP4 video file."
            });
        }

        uploadedFilename =
            req.file.filename;

        const quality =
            req.body.quality || "1080p";

        const allowedQualities = [
            "360p",
            "480p",
            "720p",
            "1080p"
        ];

        if (
            !allowedQualities.includes(
                quality
            )
        ) {
            deleteVideoFile(
                uploadedFilename
            );

            return res.status(400).json({
                success: false,
                message:
                    "Invalid video quality."
            });
        }

        const streamUrl =
            `${req.protocol}://${req.get(
                "host"
            )}/uploads/${uploadedFilename}`;

        const asset =
            await mediaService.createVideoAsset({
                movie_id: movieId,
                quality,
                format: "mp4",
                stream_url: streamUrl,
                download_url: streamUrl,
                file_size_bytes:
                    req.file.size,
                duration_seconds: null,
                status: "ready"
            });

        res.status(201).json({
            success: true,
            message:
                "Video uploaded successfully.",
            data: asset
        });
    } catch (error) {
        console.error(
            "Upload video error:",
            error
        );

        if (uploadedFilename) {
            try {
                deleteVideoFile(
                    uploadedFilename
                );
            } catch (deleteError) {
                console.error(
                    "Failed to remove uploaded file:",
                    deleteError
                );
            }
        }

        res.status(500).json({
            success: false,
            message:
                "Failed to upload video."
        });
    }
}

async function deleteVideoAsset(req, res) {
    try {
        const assetId =
            req.params.assetId;

        const asset =
            await mediaService.getVideoAssetById(
                assetId
            );

        if (!asset) {
            return res.status(404).json({
                success: false,
                message:
                    "Video asset not found."
            });
        }

        await mediaService.deleteVideoAsset(
            assetId
        );

        if (asset.stream_url) {
            const filename =
                asset.stream_url
                    .split("/")
                    .pop();

            if (
                filename &&
                !filename.includes("..")
            ) {
                deleteVideoFile(
                    filename
                );
            }
        }

        res.json({
            success: true,
            message:
                "Video asset deleted successfully."
        });
    } catch (error) {
        console.error(
            "Delete video asset error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Failed to delete video asset."
        });
    }
}

async function createSubtitle(req, res) {
    try {
        const subtitle =
            await mediaService.createSubtitle({
                movie_id:
                    req.params.movieId,
                ...req.body
            });

        res.status(201).json({
            success: true,
            data: subtitle
        });
    } catch (error) {
        console.error(
            "Create subtitle error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Failed to create subtitle."
        });
    }
}

async function deleteSubtitle(req, res) {
    try {
        await mediaService.deleteSubtitle(
            req.params.subtitleId
        );

        res.json({
            success: true,
            message:
                "Subtitle deleted successfully."
        });
    } catch (error) {
        console.error(
            "Delete subtitle error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Failed to delete subtitle."
        });
    }
}

module.exports = {
    getMovieMedia,
    getMovieVideoAssets,
    getMovieSubtitles,
    createVideoAsset,
    uploadVideo,
    deleteVideoAsset,
    createSubtitle,
    deleteSubtitle
};