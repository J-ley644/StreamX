const express = require("express");

const controller = require("./movies.controller");

const {
    requireAuth,
    requireAdmin
} = require("../../middleware/auth.middleware");

const router = express.Router();


/*
 * PUBLIC MOVIE ROUTES
 */

router.get(
    "/",
    controller.getMovies
);

router.get(
    "/:id",
    controller.getMovieById
);


/*
 * ADMIN MOVIE MANAGEMENT
 */

router.post(
    "/",
    requireAuth,
    requireAdmin,
    controller.createMovie
);

router.patch(
    "/:id",
    requireAuth,
    requireAdmin,
    controller.updateMovie
);

router.delete(
    "/:id",
    requireAuth,
    requireAdmin,
    controller.deleteMovie
);


/*
 * MOVIE GENRES
 */

router.get(
    "/:id/genres",
    controller.getMovieGenres
);

router.post(
    "/:id/genres/:genreId",
    requireAuth,
    requireAdmin,
    controller.addMovieGenre
);

router.delete(
    "/:id/genres/:genreId",
    requireAuth,
    requireAdmin,
    controller.removeMovieGenre
);


module.exports = router;