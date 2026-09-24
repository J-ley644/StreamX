const express = require("express");

const moviesRoutes = require(
    "../modules/movies/movies.routes"
);

const router = express.Router();


router.get("/health", (req, res) => {
    res.json({
        success: true,
        service: "StreamX API",
        status: "online"
    });
});


router.use("/movies", moviesRoutes);


module.exports = router;