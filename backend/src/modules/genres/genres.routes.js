const express = require("express");

const controller = require("./genres.controller");

const router = express.Router();

router.get("/", controller.getGenres);

router.post("/", controller.createGenre);

router.delete("/:id", controller.deleteGenre);

module.exports = router;