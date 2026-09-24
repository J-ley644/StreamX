const express = require("express");

const moviesRoutes = require(
    "../modules/movies/movies.routes"
);

const genresRoutes = require(
    "../modules/genres/genres.routes"
);

const mediaRoutes = require(
    "../modules/media/media.routes"
);

const authRoutes = require(
    "../modules/auth/auth.routes"
);
const userActivityRoutes = require(
    "../modules/users/userActivity.routes"
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

router.use("/genres", genresRoutes);

router.use("/", mediaRoutes);

router.use("/auth", authRoutes);

router.use("/users", userActivityRoutes);

module.exports = router;
