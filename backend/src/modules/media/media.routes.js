const express = require("express");

const controller = require("./media.controller");

const router = express.Router();


/*
    Movie media overview
    GET /api/movies/:movieId/media
*/
router.get(
    "/movies/:movieId/media",
    controller.getMovieMedia
);


/*
    Movie video assets
    GET /api/movies/:movieId/video-assets
*/
router.get(
    "/movies/:movieId/video-assets",
    controller.getMovieVideoAssets
);


/*
    Movie subtitles
    GET /api/movies/:movieId/subtitles
*/
router.get(
    "/movies/:movieId/subtitles",
    controller.getMovieSubtitles
);


/*
    Create video asset
    POST /api/movies/:movieId/video-assets
*/
router.post(
    "/movies/:movieId/video-assets",
    controller.createVideoAsset
);


/*
    Delete video asset
    DELETE /api/media/video-assets/:assetId
*/
router.delete(
    "/media/video-assets/:assetId",
    controller.deleteVideoAsset
);


/*
    Create subtitle
    POST /api/movies/:movieId/subtitles
*/
router.post(
    "/movies/:movieId/subtitles",
    controller.createSubtitle
);


/*
    Delete subtitle
    DELETE /api/media/subtitles/:subtitleId
*/
router.delete(
    "/media/subtitles/:subtitleId",
    controller.deleteSubtitle
);


module.exports = router;