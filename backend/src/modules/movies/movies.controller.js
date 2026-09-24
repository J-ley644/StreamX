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

async function getMovieGenres(req, res) {
    try {
        const genres = await moviesService.getMovieGenres(
            req.params.id
        );

        res.json({
            success: true,
            data: genres
        });

    } catch (error) {
        console.error("Get movie genres error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch movie genres"
        });
    }
}

async function addMovieGenre(req, res) {
    try {
        const { id, genreId } = req.params;

        const relationship = await moviesService.addMovieGenre(
            id,
            genreId
        );

        if (!relationship) {
            return res.status(409).json({
                success: false,
                message: "Movie genre relationship already exists"
            });
        }

        res.status(201).json({
            success: true,
            data: relationship
        });

    } catch (error) {
        console.error("Add movie genre error:", error);

        if (error.code === "23503") {
            return res.status(404).json({
                success: false,
                message: "Movie or genre not found"
            });
        }

        res.status(500).json({
            success: false,
            message: "Failed to add movie genre"
        });
    }
}

async function removeMovieGenre(req, res) {
    try {
        const { id, genreId } = req.params;

        const relationship = await moviesService.removeMovieGenre(
            id,
            genreId
        );

        if (!relationship) {
            return res.status(404).json({
                success: false,
                message: "Movie genre relationship not found"
            });
        }

        res.json({
            success: true,
            message: "Movie genre removed successfully"
        });

    } catch (error) {
        console.error("Remove movie genre error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to remove movie genre"
        });
    }
}


module.exports = {
    getMovies,
    getMovieById,
    createMovie,
    deleteMovie,
    getMovieGenres,
    addMovieGenre,
    removeMovieGenre
};