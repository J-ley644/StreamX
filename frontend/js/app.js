/* =========================================================
   STREAMX APPLICATION
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

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
           HOME
           ------------------------------------------------- */

        const hero =
            document.getElementById("hero");

        if (hero) {

            hero.innerHTML =
                HeroBanner(featuredMovie);

        }


        const continueSection =
            document.getElementById(
                "continue-watching"
            );

        if (continueSection) {

            const continueMovies =
                continueWatching.map(
                    item => item.movie
                );

            continueSection.innerHTML =
                MovieRow(
                    "Continue Watching",
                    continueMovies,
                    {
                        continueWatching: true
                    }
                );

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
                    [
                        movies[3],
                        movies[1],
                        movies[5],
                        movies[0],
                        movies[4]
                    ]
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
                    [
                        movies[0],
                        movies[1],
                        movies[4],
                        movies[2],
                        movies[3]
                    ]
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

            details.innerHTML =
                MovieDetails(movie);

            setupMovieDetails(movie);

        }


        /* -------------------------------------------------
           WATCH PAGE
           ------------------------------------------------- */

        const watchContent =
            document.getElementById(
                "watch-content"
            );

        if (watchContent) {

            const movie =
                getMovieFromURL();

            watchContent.innerHTML =
                WatchPlayer(movie);

            setupVideoPlayer(movie);

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
                    toggleMyList(movie.id);

                listButton.textContent =
                    saved
                        ? "✓ In My List"
                        : "＋ My List";

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
                    toggleDownload(movie.id);

                downloadButton.textContent =
                    downloaded
                        ? "✓ Downloaded"
                        : "↓ Download";

            }
        );

    }

}


/* =========================================================
   VIDEO PLAYER
   ========================================================= */

function setupVideoPlayer(movie) {

    const video =
        document.getElementById(
            "stream-player"
        );

    if (!video) {
        return;
    }


    /* -----------------------------------------------------
       RESTORE POSITION
       ----------------------------------------------------- */

    const savedTime =
        getWatchProgress(movie.id);


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
       SAVE POSITION
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