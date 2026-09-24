const moviesService = require("./movies.service");


async function getMovies(req, res) {
    try {
        const {
            search,
            genre,
            year,
            limit = 20,
            offset = 0
        } = req.query;

        const movies = await moviesService.getMovies({
            search,
            genre,
            year,
            limit,
            offset
        });

        res.json({
            success: true,
            data: movies
        });

    } catch (error) {
        console.error("Get movies error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch movies"
        });
    }
}


async function getMovieById(req, res) {
    try {
        const movie = await moviesService.getMovieById(
            req.params.id
        );

        if (!movie) {
            return res.status(404).json({
                success: false,
                message: "Movie not found"
            });
        }

        res.json({
            success: true,
            data: movie
        });

    } catch (error) {
        console.error("Get movie error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch movie"
        });
    }
}


async function createMovie(req, res) {
    try {
        const movie = await moviesService.createMovie(
            req.body
        );

        res.status(201).json({
            success: true,
            data: movie
        });

    } catch (error) {
        console.error("Create movie error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to create movie"
        });
    }
}


async function deleteMovie(req, res) {
    try {
        const movie = await moviesService.deleteMovie(
            req.params.id
        );

        if (!movie) {
            return res.status(404).json({
                success: false,
                message: "Movie not found"
            });
        }

        res.json({
            success: true,
            message: "Movie deleted successfully"
        });

    } catch (error) {
        console.error("Delete movie error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to delete movie"
        });
    }
}


module.exports = {
    getMovies,
    getMovieById,
    createMovie,
    deleteMovie
};