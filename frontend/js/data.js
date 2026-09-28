/* =========================================================
   STREAMX — DATA & API
   ========================================================= */

const STREAMX_API_BASE =
    window.STREAMX_API_BASE ||
    "http://localhost:5000/api";


/* =========================================================
   MOVIE CATALOGUE
   ========================================================= */

let movies = [];

let continueWatching = [];

let featuredMovie = null;


/* =========================================================
   FALLBACK ARTWORK
   ========================================================= */

const STREAMX_FALLBACK_POSTER =
    "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=700&q=80";

const STREAMX_FALLBACK_BACKDROP =
    "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1800&q=85";


/* =========================================================
   AUTHENTICATION
   ========================================================= */

function getAuthToken() {

    const directToken =
        localStorage.getItem("streamx_token");

    if (directToken) {
        return directToken;
    }


    const token =
        localStorage.getItem("token");

    if (token) {
        return token;
    }


    try {

        const auth =
            JSON.parse(
                localStorage.getItem(
                    "streamx_auth"
                ) || "null"
            );

        return auth?.token || null;

    } catch (error) {

        return null;
    }
}


/* =========================================================
   MOVIE NORMALIZATION
   ========================================================= */

function normalizeMovie(movie) {

    if (!movie) {
        return null;
    }


    const genres =
        Array.isArray(movie.genres)
            ? movie.genres
                .map(genre => {

                    if (
                        typeof genre ===
                        "string"
                    ) {
                        return genre;
                    }

                    return genre?.name || "";
                })
                .filter(Boolean)
            : [];


    const primaryGenre =
        genres[0] ||
        "Movie";


    return {

        /*
         * IMPORTANT:
         * Keep the backend UUID as a string.
         */
        id:
            String(movie.id),

        title:
            movie.title || "Untitled Movie",

        year:
            movie.release_year ??
            movie.year ??
            "",

        duration:
            movie.duration_seconds
                ? formatDuration(
                    movie.duration_seconds
                )
                : movie.duration || "",

        duration_seconds:
            movie.duration_seconds ?? 0,

        rating:
            movie.rating ?? 0,

        genre:
            primaryGenre,

        genres,

        description:
            movie.description || "",

        poster:
            movie.poster_url ||
            movie.poster ||
            STREAMX_FALLBACK_POSTER,

        backdrop:
            movie.backdrop_url ||
            movie.backdrop ||
            STREAMX_FALLBACK_BACKDROP,

        video_status:
            movie.video_status ||
            null
    };
}


/* =========================================================
   MOVIE CATALOGUE API
   ========================================================= */

async function loadMovies() {

    const response =
        await fetch(
            `${STREAMX_API_BASE}/movies`,
            {
                method: "GET",

                headers: {
                    Accept:
                        "application/json"
                }
            }
        );


    let payload = null;


    try {

        payload =
            await response.json();

    } catch (error) {

        payload = null;
    }


    if (
        !response.ok ||
        !payload?.success
    ) {

        const error =
            new Error(
                payload?.message ||
                "Failed to load movies."
            );

        error.code =
            "MOVIES_LOAD_FAILED";

        error.status =
            response.status;

        throw error;
    }


    const apiMovies =
        Array.isArray(payload.data)
            ? payload.data
            : [];


    movies =
        apiMovies
            .map(normalizeMovie)
            .filter(Boolean);


    featuredMovie =
        movies[0] || null;


    continueWatching =
        movies
            .filter(
                movie =>
                    getWatchProgress(
                        movie.id
                    ) > 0
            )
            .slice(0, 5)
            .map(movie => ({
                movie
            }));


    return movies;
}


/* =========================================================
   PLAYBACK API
   ========================================================= */

async function getPlaybackData(movieId) {

    const token =
        getAuthToken();


    if (!token) {

        const error =
            new Error(
                "AUTH_REQUIRED"
            );

        error.code =
            "AUTH_REQUIRED";

        throw error;
    }


    const response =
        await fetch(
            `${STREAMX_API_BASE}/playback/movies/${encodeURIComponent(movieId)}`,
            {
                method: "GET",

                headers: {
                    Authorization:
                        `Bearer ${token}`,

                    Accept:
                        "application/json"
                }
            }
        );


    let payload = null;


    try {

        payload =
            await response.json();

    } catch (error) {

        payload = null;
    }


    if (response.status === 401) {

        const error =
            new Error(
                "AUTH_EXPIRED"
            );

        error.code =
            "AUTH_EXPIRED";

        throw error;
    }


    if (
        !response.ok ||
        !payload?.success
    ) {

        const error =
            new Error(
                payload?.message ||
                "Failed to load playback data."
            );

        error.code =
            "PLAYBACK_FAILED";

        error.status =
            response.status;

        throw error;
    }


    return payload.data;
}


/* =========================================================
   MOVIE HELPERS
   ========================================================= */

function getMovieById(id) {

    if (
        id === null ||
        id === undefined
    ) {
        return null;
    }


    const targetId =
        String(id);


    return movies.find(
        movie =>
            String(movie.id) ===
            targetId
    ) || null;
}


/* =========================================================
   MY LIST
   ========================================================= */

function getMyListIds() {

    try {

        const ids =
            JSON.parse(
                localStorage.getItem(
                    "streamx_my_list"
                ) || "[]"
            );


        return Array.isArray(ids)
            ? ids.map(String)
            : [];

    } catch (error) {

        return [];
    }
}


function saveMyListIds(ids) {

    localStorage.setItem(
        "streamx_my_list",
        JSON.stringify(
            ids.map(String)
        )
    );
}


function isInMyList(movieId) {

    const id =
        String(movieId);


    return getMyListIds()
        .includes(id);
}


function toggleMyList(movieId) {

    const id =
        String(movieId);


    let ids =
        getMyListIds();


    if (ids.includes(id)) {

        ids =
            ids.filter(
                savedId =>
                    savedId !== id
            );

    } else {

        ids.push(id);
    }


    saveMyListIds(ids);


    return ids.includes(id);
}


function getMyListMovies() {

    return getMyListIds()
        .map(
            id =>
                getMovieById(id)
        )
        .filter(Boolean);
}


/* =========================================================
   DOWNLOADS
   ========================================================= */

function getDownloadIds() {

    try {

        const ids =
            JSON.parse(
                localStorage.getItem(
                    "streamx_downloads"
                ) || "[]"
            );


        return Array.isArray(ids)
            ? ids.map(String)
            : [];

    } catch (error) {

        return [];
    }
}


function saveDownloadIds(ids) {

    localStorage.setItem(
        "streamx_downloads",
        JSON.stringify(
            ids.map(String)
        )
    );
}


function isDownloaded(movieId) {

    const id =
        String(movieId);


    return getDownloadIds()
        .includes(id);
}


function toggleDownload(movieId) {

    const id =
        String(movieId);


    let ids =
        getDownloadIds();


    if (ids.includes(id)) {

        ids =
            ids.filter(
                downloadId =>
                    downloadId !== id
            );

    } else {

        ids.push(id);
    }


    saveDownloadIds(ids);


    return ids.includes(id);
}


function getDownloadedMovies() {

    return getDownloadIds()
        .map(
            id =>
                getMovieById(id)
        )
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


function saveWatchProgress(
    movieId,
    seconds
) {

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


/* =========================================================
   DURATION
   ========================================================= */

function formatDuration(seconds) {

    const totalSeconds =
        Math.max(
            0,
            Math.floor(
                Number(seconds) || 0
            )
        );


    const hours =
        Math.floor(
            totalSeconds / 3600
        );


    const minutes =
        Math.floor(
            (totalSeconds % 3600) / 60
        );


    if (hours > 0) {

        return `${hours}h ${minutes}m`;
    }


    return `${minutes}m`;
}