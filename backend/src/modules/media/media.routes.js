const express = require("express");

const controller = require("./media.controller");
const upload = require(
    "../uploads/upload.middleware"
);

const {
    requireAuth,
    requireAdmin
} = require(
    "../../middleware/auth.middleware"
);

const router = express.Router();

/*
 * Public media routes
 */
router.get(
    "/movies/:movieId/media",
    controller.getMovieMedia
);

router.get(
    "/movies/:movieId/video-assets",
    controller.getMovieVideoAssets
);

router.get(
    "/movies/:movieId/subtitles",
    controller.getMovieSubtitles
);

/*
 * Admin video upload
 */
router.post(
    "/movies/:movieId/video-assets/upload",
    requireAuth,
    requireAdmin,
    upload.single("video"),
    controller.uploadVideo
);

/*
 * Admin media management
 */
router.post(
    "/movies/:movieId/video-assets",
    requireAuth,
    requireAdmin,
    controller.createVideoAsset
);

router.delete(
    "/media/video-assets/:assetId",
    requireAuth,
    requireAdmin,
    controller.deleteVideoAsset
);

router.post(
    "/movies/:movieId/subtitles",
    requireAuth,
    requireAdmin,
    controller.createSubtitle
);

router.delete(
    "/media/subtitles/:subtitleId",
    requireAuth,
    requireAdmin,
    controller.deleteSubtitle
);

module.exports = router;