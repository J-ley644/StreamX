/* =========================================================
   STREAMX — PAGE COMPONENTS
   ========================================================= */


/* =========================================================
   URL MOVIE
   ========================================================= */

function getMovieFromURL() {

    const params =
        new URLSearchParams(
            window.location.search
        );

    const id =
        Number(params.get("id"));

    return getMovieById(id)
        || movies[0];
}


/* =========================================================
   MOVIE DETAILS
   ========================================================= */

function MovieDetails(movie) {

    const inList =
        isInMyList(movie.id);

    const downloaded =
        isDownloaded(movie.id);


    return `
        <section
            class="movie-details"
            style="
                background-image:
                linear-gradient(
                    90deg,
                    #08090d 0%,
                    rgba(8,9,13,.94) 35%,
                    rgba(8,9,13,.55) 70%,
                    rgba(8,9,13,.8) 100%
                ),
                url('${movie.backdrop}');
            "
        >

            <div class="details-container">

                <div class="details-poster">

                    <img
                        src="${movie.poster}"
                        alt="${movie.title}"
                    >

                </div>


                <div class="details-content">

                    <div class="hero-badge">
                        MOVIE
                    </div>

                    <h1>
                        ${movie.title}
                    </h1>

                    <div class="details-meta">

                        <span class="rating">
                            ★ ${movie.rating}
                        </span>

                        <span>
                            ${movie.year}
                        </span>

                        <span>
                            ${movie.duration}
                        </span>

                        <span>
                            ${movie.genre}
                        </span>

                    </div>


                    <p class="details-description">
                        ${movie.description}
                    </p>


                    <div class="genre-list">

                        ${movie.genres
                            .map(
                                genre =>
                                    `<span>${genre}</span>`
                            )
                            .join("")
                        }

                    </div>


                    <div class="details-actions">

                        <button
                            class="btn btn-primary"
                            data-watch-movie="${movie.id}"
                        >
                            ▶ Watch Now
                        </button>


                        <button
                            class="btn btn-secondary"
                            id="list-button"
                        >
                            ${inList
                                ? "✓ In My List"
                                : "＋ My List"
                            }
                        </button>


                        <button
                            class="download-button"
                            id="download-button"
                        >
                            ${downloaded
                                ? "✓ Downloaded"
                                : "↓ Download"
                            }
                        </button>

                    </div>

                </div>

            </div>

        </section>
    `;
}


/* =========================================================
   SEARCH
   ========================================================= */

function SearchResults(query) {

    const normalized =
        query.trim().toLowerCase();


    if (!normalized) {

        return MovieRow(
            "Popular Movies",
            movies
        );

    }


    const results =
        movies.filter(movie => {

            const searchable = [

                movie.title,

                movie.genre,

                ...movie.genres,

                movie.description

            ]
                .join(" ")
                .toLowerCase();


            return searchable.includes(
                normalized
            );

        });


    if (!results.length) {

        return `
            <div class="empty-state">

                <div class="empty-icon">
                    ⌕
                </div>

                <h2>
                    No results found
                </h2>

                <p>
                    Nothing matched
                    "${query}".
                </p>

            </div>
        `;
    }


    return MovieRow(
        `Results for "${query}"`,
        results
    );
}


/* =========================================================
   WATCH PLAYER
   ========================================================= */

function WatchPlayer(movie) {

    return `
        <section class="watch-page">

            <div class="video-container">

                <video
                    id="stream-player"
                    controls
                    playsinline
                    poster="${movie.backdrop}"
                    preload="metadata"
                >

                    <source
                        src="${demoVideoUrl}"
                        type="video/mp4"
                    >

                    Your browser does not support
                    HTML5 video.

                </video>

            </div>


            <div class="watch-info">

                <h1>
                    ${movie.title}
                </h1>

                <div class="details-meta">

                    <span class="rating">
                        ★ ${movie.rating}
                    </span>

                    <span>
                        ${movie.year}
                    </span>

                    <span>
                        ${movie.duration}
                    </span>

                    <span>
                        ${movie.genre}
                    </span>

                </div>

                <p>
                    ${movie.description}
                </p>

            </div>

        </section>
    `;
}


/* =========================================================
   MY LIST
   ========================================================= */

function MyListPage() {

    const savedMovies =
        getMyListMovies();


    return `
        <section class="page-container">

            <div class="page-heading">

                <span class="hero-badge">
                    LIBRARY
                </span>

                <h1>
                    My List
                </h1>

                <p>
                    Movies and shows you've saved.
                </p>

            </div>

            ${MovieRow(
                "Saved Movies",
                savedMovies
            )}

        </section>
    `;
}


/* =========================================================
   DOWNLOADS
   ========================================================= */

function DownloadsPage() {

    const downloadedMovies =
        getDownloadedMovies();


    if (!downloadedMovies.length) {

        return `
            <section class="page-container">

                <div class="page-heading">

                    <span class="hero-badge">
                        OFFLINE
                    </span>

                    <h1>
                        Downloads
                    </h1>

                    <p>
                        Your offline library.
                    </p>

                </div>


                <div class="download-empty">

                    <div class="download-empty-icon">
                        ↓
                    </div>

                    <h2>
                        No downloads yet
                    </h2>

                    <p>
                        Download movies from their
                        details page to save them here.
                    </p>

                    <a
                        href="movies.html"
                        class="btn btn-primary"
                    >
                        Browse Movies
                    </a>

                </div>

            </section>
        `;
    }


    return `
        <section class="page-container">

            <div class="page-heading">

                <span class="hero-badge">
                    OFFLINE
                </span>

                <h1>
                    Downloads
                </h1>

                <p>
                    Your saved offline movies.
                </p>

            </div>

            ${MovieRow(
                "Downloaded Movies",
                downloadedMovies
            )}

        </section>
    `;
}