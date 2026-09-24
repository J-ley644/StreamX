const genresService = require("./genres.service");

async function getGenres(req, res) {
    try {
        const genres = await genresService.getGenres();

        res.json({
            success: true,
            data: genres
        });

    } catch (error) {
        console.error("Get genres error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch genres"
        });
    }
}

async function createGenre(req, res) {
    try {
        const { name } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({
                success: false,
                message: "Genre name is required"
            });
        }

        const genre = await genresService.createGenre(name);

        res.status(201).json({
            success: true,
            data: genre
        });

    } catch (error) {
        console.error("Create genre error:", error);

        if (error.code === "23505") {
            return res.status(409).json({
                success: false,
                message: "Genre already exists"
            });
        }

        res.status(500).json({
            success: false,
            message: "Failed to create genre"
        });
    }
}

async function deleteGenre(req, res) {
    try {
        const genre = await genresService.deleteGenre(
            req.params.id
        );

        if (!genre) {
            return res.status(404).json({
                success: false,
                message: "Genre not found"
            });
        }

        res.json({
            success: true,
            message: "Genre deleted successfully"
        });

    } catch (error) {
        console.error("Delete genre error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to delete genre"
        });
    }
}

module.exports = {
    getGenres,
    createGenre,
    deleteGenre
};