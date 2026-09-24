const express = require("express");

const controller = require("./movies.controller");

const router = express.Router();

router.get("/", controller.getMovies);

router.get("/:id", controller.getMovieById);

router.post("/", controller.createMovie);

router.delete("/:id", controller.deleteMovie);

module.exports = router;