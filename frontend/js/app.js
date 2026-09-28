/* =========================================================
   STREAMX APPLICATION
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        /* -------------------------------------------------
           GLOBAL NAVIGATION
           ------------------------------------------------- */

        const navbar =
            document.getElementById("navbar");


        if (navbar) {

            navbar.innerHTML =
                Navbar();
        }


        /* -------------------------------------------------
           FOOTER
           ------------------------------------------------- */

        const footer =
            document.getElementById("footer");


        if (footer) {

            footer.innerHTML =
                Footer();
        }


        /* -------------------------------------------------
           LOAD MOVIE CATALOGUE
           ------------------------------------------------- */

        try {

            await loadMovies();

        } catch (error) {

            console.error(
                "StreamX movie catalogue error:",
                error
            );


            renderCatalogueError();

            return;
        }


        /* -------------------------------------------------
           HOME
           ------------------------------------------------- */

        const hero =
            document.getElementById("hero");


        if (hero) {

            if (featuredMovie) {

                hero.innerHTML =
                    HeroBanner(
                        featuredMovie
                    );

            } else {

                hero.innerHTML =
                    renderEmptyCatalogue(
                        "No movies available"
                    );
            }
        }


        const continueSection =
            document.getElementById(
                "continue-watching"
            );


        if (continueSection) {

            const continueMovies =
                continueWatching.map(
                    item =>
                        item.movie
                );


            if (continueMovies.length) {

                continueSection.innerHTML =
                    MovieRow(
                        "Continue Watching",
                        continueMovies,
                        {
                            continueWatching:
                                true
                        }
                    );

            } else {

                continueSection.innerHTML =
                    "";
            }
        }


        const popularSection =
            document.getElementById(
                "popular-movies"
            );


        if (popularSection) {

            popularSection.innerHTML =
                MovieRow(
                    "Popular Movies",
                    movies
                );
        }


        const trendingSection =
            document.getElementById(
                "trending"
            );


        if (trendingSection) {

            trendingSection.innerHTML =
                MovieRow(
                    "Trending Now",
                    movies
                );
        }


        const newReleasesSection =
            document.getElementById(
                "new-releases"
            );


        if (newReleasesSection) {

            newReleasesSection.innerHTML =
                MovieRow(
                    "New Releases",
                    movies
                );
        }


        /* -------------------------------------------------
           NAVIGATION
           ------------------------------------------------- */

        if (
            typeof setupNavigation ===
            "function"
        ) {

            setupNavigation();
        }


        /* -------------------------------------------------
           MOVIE DETAILS
           ------------------------------------------------- */

        const details =
            document.getElementById(
                "movie-details"
            );


        if (details) {

            const movie =
                getMovieFromURL();


            if (!movie) {

                details.innerHTML =
                    renderEmptyCatalogue(
                        "Movie not found"
                    );

            } else {

                details.innerHTML =
                    MovieDetails(movie);


                setupMovieDetails(
                    movie
                );
            }
        }


        /* -------------------------------------------------
           WATCH PAGE
           ------------------------------------------------- */

        const watchContent =
            document.getElementById(
                "watch-content"
            );


        if (watchContent) {

            loadWatchPage(
                watchContent
            );
        }


        /* -------------------------------------------------
           MY LIST
           ------------------------------------------------- */

        const myList =
            document.getElementById(
                "my-list-content"
            );


        if (myList) {

            myList.innerHTML =
                MyListPage();


            setupNavigation();
        }


        /* -------------------------------------------------
           DOWNLOADS
           ------------------------------------------------- */

        const downloads =
            document.getElementById(
                "downloads-content"
            );


        if (downloads) {

            downloads.innerHTML =
                DownloadsPage();


            setupNavigation();
        }

    }
);


/* =========================================================
   CATALOGUE ERROR
   ========================================================= */

function renderCatalogueError() {

    const containers = [

        document.getElementById("hero"),

        document.getElementById(
            "popular-movies"
        ),

        document.getElementById(
            "trending"
        ),

        document.getElementById(
            "new-releases"
        ),

        document.getElementById(
            "continue-watching"
        ),

        document.getElementById(
            "movie-details"
        )
    ];


    containers
        .filter(Boolean)
        .forEach(
            container => {

                container.innerHTML =
                    renderEmptyCatalogue(
                        "Unable to load StreamX catalogue"
                    );
            }
        );
}


/* =========================================================
   EMPTY CATALOGUE
   ========================================================= */

function renderEmptyCatalogue(
    title
) {

    return `
        <div class="empty-state">

            <div class="empty-icon">
                ◯
            </div>

            <h2>
                ${title}
            </h2>

            <p>
                Please try again later.
            </p>

        </div>
    `;
}


/* =========================================================
   MOVIE DETAILS ACTIONS
   ========================================================= */

function setupMovieDetails(movie) {

    const listButton =
        document.getElementById(
            "list-button"
        );


    if (listButton) {

        listButton.addEventListener(
            "click",
            () => {

                const saved =
                    toggleMyList(
                        movie.id
                    );


                listButton.textContent =
                    saved
                        ? "✓ In My List"
                        : "+ My List";
            }
        );
    }


    const downloadButton =
        document.getElementById(
            "download-button"
        );


    if (downloadButton) {

        downloadButton.addEventListener(
            "click",
            () => {

                const downloaded =
                    toggleDownload(
                        movie.id
                    );


                downloadButton.textContent =
                    downloaded
                        ? "✓ Downloaded"
                        : "↓ Download";
            }
        );
    }

}


/* =========================================================
   WATCH PAGE LOADER
   ========================================================= */

async function loadWatchPage(
    container
) {

    const params =
        new URLSearchParams(
            window.location.search
        );


    const movieId =
        params.get("id");


    if (!movieId) {

        container.innerHTML =
            `
                <div class="empty-state">

                    <h2>
                        Movie not found
                    </h2>

                    <p>
                        No movie ID was provided.
                    </p>

                </div>
            `;

        return;
    }


    container.innerHTML =
        `
            <div class="empty-state">

                <div class="empty-icon">
                    ▶
                </div>

                <h2>
                    Loading movie...
                </h2>

                <p>
                    Preparing your secure
                    playback session.
                </p>

            </div>
        `;


    try {

        const playbackData =
            await getPlaybackData(
                movieId
            );


        container.innerHTML =
            WatchPlayer(
                playbackData.movie,
                playbackData
            );


        setupVideoPlayer(
            playbackData.movie,
            playbackData.progress
        );

    } catch (error) {

        console.error(
            "Watch page error:",
            error
        );


        if (
            error.code ===
                "AUTH_REQUIRED" ||
            error.code ===
                "AUTH_EXPIRED"
        ) {

            container.innerHTML =
                `
                    <div class="empty-state">

                        <div class="empty-icon">
                            🔒
                        </div>

                        <h2>
                            Sign in to watch
                        </h2>

                        <p>
                            Your StreamX account is
                            required to access
                            secure playback.
                        </p>

                    </div>
                `;

            return;
        }


        container.innerHTML =
            `
                <div class="empty-state">

                    <div class="empty-icon">
                        ⚠
                    </div>

                    <h2>
                        Unable to load movie
                    </h2>

                    <p>
                        ${
                            error.message ||
                            "Please try again later."
                        }
                    </p>

                </div>
            `;
    }
}


/* =========================================================
   VIDEO PLAYER
   ========================================================= */

function setupVideoPlayer(
    movie,
    serverProgress = null
) {

    const video =
        document.getElementById(
            "stream-player"
        );


    if (!video) {
        return;
    }


    const serverTime =
        Number(
            serverProgress
                ?.progress_seconds || 0
        );


    const localTime =
        getWatchProgress(
            movie.id
        );


    const savedTime =
        serverTime > 0
            ? serverTime
            : localTime;


    /* -----------------------------------------------------
       RESTORE POSITION
       ----------------------------------------------------- */

    video.addEventListener(
        "loadedmetadata",
        () => {

            if (
                savedTime > 0 &&
                savedTime < video.duration
            ) {

                video.currentTime =
                    savedTime;
            }
        }
    );


    /* -----------------------------------------------------
       SAVE POSITION LOCALLY
       ----------------------------------------------------- */

    video.addEventListener(
        "timeupdate",
        () => {

            if (
                video.currentTime > 0
            ) {

                saveWatchProgress(
                    movie.id,
                    video.currentTime
                );
            }
        }
    );


    /* -----------------------------------------------------
       COMPLETED
       ----------------------------------------------------- */

    video.addEventListener(
        "ended",
        () => {

            clearWatchProgress(
                movie.id
            );
        }
    );

}