/* =========================================================
   STREAMX — DATA & LOCAL STORAGE
   ========================================================= */

const movies = [
    {
        id: 1,
        title: "The Last Frontier",
        year: 2026,
        duration: "2h 14m",
        rating: 8.7,
        genre: "Sci-Fi",
        genres: ["Sci-Fi", "Adventure", "Drama"],
        description:
            "Humanity's final mission begins beyond the edge of known space.",
        poster:
            "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=700&q=80",
        backdrop:
            "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=1800&q=85"
    },

    {
        id: 2,
        title: "Shadow Protocol",
        year: 2026,
        duration: "1h 58m",
        rating: 8.4,
        genre: "Action",
        genres: ["Action", "Thriller"],
        description:
            "A former intelligence agent is pulled into one final dangerous operation.",
        poster:
            "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=700&q=80",
        backdrop:
            "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=1800&q=85"
    },

    {
        id: 3,
        title: "After Midnight",
        year: 2025,
        duration: "1h 47m",
        rating: 8.1,
        genre: "Thriller",
        genres: ["Thriller", "Mystery"],
        description:
            "When the city goes silent, a detective discovers something nobody was meant to see.",
        poster:
            "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=700&q=80",
        backdrop:
            "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1800&q=85"
    },

    {
        id: 4,
        title: "Lost Kingdom",
        year: 2025,
        duration: "2h 06m",
        rating: 8.5,
        genre: "Adventure",
        genres: ["Adventure", "Fantasy"],
        description:
            "An ancient kingdom awakens and a young explorer must uncover its forgotten secret.",
        poster:
            "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=700&q=80",
        backdrop:
            "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1800&q=85"
    },

    {
        id: 5,
        title: "The Silent Ocean",
        year: 2026,
        duration: "1h 52m",
        rating: 8.2,
        genre: "Drama",
        genres: ["Drama", "Mystery"],
        description:
            "A mysterious signal from beneath the ocean changes everything.",
        poster:
            "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=700&q=80",
        backdrop:
            "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1800&q=85"
    },

    {
        id: 6,
        title: "Neon City",
        year: 2026,
        duration: "2h 02m",
        rating: 8.0,
        genre: "Crime",
        genres: ["Crime", "Action"],
        description:
            "In a city ruled by technology and money, one detective refuses to play by the rules.",
        poster:
            "https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=700&q=80",
        backdrop:
            "https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=1800&q=85"
    }
];


/* =========================================================
   DEMO VIDEO
   ========================================================= */

const demoVideoUrl =
    "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4";


/* =========================================================
   MOVIE HELPERS
   ========================================================= */

function getMovieById(id) {

    return movies.find(
        movie => movie.id === Number(id)
    );
}


/* =========================================================
   MY LIST
   ========================================================= */

function getMyListIds() {

    return JSON.parse(
        localStorage.getItem("streamx_my_list") || "[]"
    );
}


function saveMyListIds(ids) {

    localStorage.setItem(
        "streamx_my_list",
        JSON.stringify(ids)
    );
}


function isInMyList(movieId) {

    return getMyListIds()
        .includes(Number(movieId));
}


function toggleMyList(movieId) {

    const id = Number(movieId);

    let ids = getMyListIds();

    if (ids.includes(id)) {

        ids = ids.filter(
            savedId => savedId !== id
        );

    } else {

        ids.push(id);
    }

    saveMyListIds(ids);

    return ids.includes(id);
}


function getMyListMovies() {

    return getMyListIds()
        .map(id => getMovieById(id))
        .filter(Boolean);
}


/* =========================================================
   DOWNLOADS
   ========================================================= */

function getDownloadIds() {

    return JSON.parse(
        localStorage.getItem("streamx_downloads") || "[]"
    );
}


function saveDownloadIds(ids) {

    localStorage.setItem(
        "streamx_downloads",
        JSON.stringify(ids)
    );
}


function isDownloaded(movieId) {

    return getDownloadIds()
        .includes(Number(movieId));
}


function toggleDownload(movieId) {

    const id = Number(movieId);

    let ids = getDownloadIds();

    if (ids.includes(id)) {

        ids = ids.filter(
            downloadId => downloadId !== id
        );

    } else {

        ids.push(id);
    }

    saveDownloadIds(ids);

    return ids.includes(id);
}


function getDownloadedMovies() {

    return getDownloadIds()
        .map(id => getMovieById(id))
        .filter(Boolean);
}


/* =========================================================
   WATCH PROGRESS
   ========================================================= */

function getWatchProgress(movieId) {

    return Number(
        localStorage.getItem(
            `streamx_progress_${movieId}`
        ) || 0
    );
}


function saveWatchProgress(movieId, seconds) {

    localStorage.setItem(
        `streamx_progress_${movieId}`,
        String(seconds)
    );
}


function clearWatchProgress(movieId) {

    localStorage.removeItem(
        `streamx_progress_${movieId}`
    );
}

const continueWatching = [
    {
        movie: movies[0]
    },
    {
        movie: movies[2]
    },
    {
        movie: movies[4]
    }
];


const featuredMovie = movies[0];