/* =========================================================
   STREAMX — NAVIGATION
   ========================================================= */

function setupNavigation() {

    const currentPage =
        window.location.pathname
            .split("/")
            .pop() || "index.html";


    /* -----------------------------------------------------
       ACTIVE NAVIGATION
       ----------------------------------------------------- */

    document
        .querySelectorAll(".nav-links a")
        .forEach(link => {

            const href =
                link.getAttribute("href");

            link.classList.remove("active");

            if (
                href === currentPage ||
                (
                    currentPage === "" &&
                    href === "index.html"
                )
            ) {
                link.classList.add("active");
            }

        });


    /* -----------------------------------------------------
       MOBILE MENU
       ----------------------------------------------------- */

    const menuButton =
        document.getElementById(
            "mobile-menu-button"
        );

    if (menuButton) {

        menuButton.addEventListener(
            "click",
            () => {

                document.body.classList.toggle(
                    "mobile-menu-open"
                );

            }
        );

    }


    /* -----------------------------------------------------
       MOVIE CARDS
       ----------------------------------------------------- */

    document.addEventListener(
        "click",
        event => {

            const card =
                event.target.closest(".movie-card");

            if (!card) {
                return;
            }

            if (
                event.target.closest("button")
            ) {
                return;
            }

            const movieId =
                card.dataset.movieId;

            if (movieId) {

                window.location.href =
                    `movie.html?id=${movieId}`;

            }

        }
    );


    /* -----------------------------------------------------
       CARD PLAY
       ----------------------------------------------------- */

    document.addEventListener(
        "click",
        event => {

            const button =
                event.target.closest(".card-play");

            if (!button) {
                return;
            }

            const card =
                button.closest(".movie-card");

            if (!card) {
                return;
            }

            window.location.href =
                `watch.html?id=${card.dataset.movieId}`;

        }
    );


    /* -----------------------------------------------------
       WATCH BUTTONS
       ----------------------------------------------------- */

    document.addEventListener(
        "click",
        event => {

            const button =
                event.target.closest(
                    "[data-watch-movie]"
                );

            if (!button) {
                return;
            }

            window.location.href =
                `watch.html?id=${button.dataset.watchMovie}`;

        }
    );


    /* -----------------------------------------------------
       SEARCH BUTTON
       ----------------------------------------------------- */

    document.addEventListener(
        "click",
        event => {

            const search =
                event.target.closest(
                    ".search-trigger"
                );

            if (!search) {
                return;
            }

            event.preventDefault();

            window.location.href =
                "search.html";

        }
    );

}