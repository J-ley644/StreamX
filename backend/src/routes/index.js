const express = require("express");

const moviesRoutes = require(
    "../modules/movies/movies.routes"
);

const router = express.Router();

const genresRoutes = require(
    "../modules/genres/genres.routes"
);


router.get("/health", (req, res) => {
    res.json({
        success: true,
        service: "StreamX API",
        status: "online"
    });
});


router.use("/movies", moviesRoutes);

router.use("/genres", genresRoutes);


module.exports = router;