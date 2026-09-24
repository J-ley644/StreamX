const express = require("express");

const controller = require("./movies.controller");

const router = express.Router();

router.get("/", controller.getMovies);

router.get("/:id", controller.getMovieById);

router.post("/", controller.createMovie);

router.delete("/:id", controller.deleteMovie);

router.get("/:id/genres", controller.getMovieGenres);

router.post("/:id/genres/:genreId", controller.addMovieGenre);

router.delete("/:id/genres/:genreId", controller.removeMovieGenre);

module.exports = router;