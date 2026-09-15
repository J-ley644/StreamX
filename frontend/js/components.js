/* =========================================================
   STREAMX UI COMPONENTS
   ========================================================= */


/* =========================================================
   NAVBAR
   ========================================================= */

function Navbar() {

    return `
        <nav class="navbar">

            <div class="navbar-left">

                <button
                    class="mobile-menu-button"
                    id="mobile-menu-button"
                >
                    ☰
                </button>

                <a
                    href="index.html"
                    class="logo"
                >
                    STREAM<span>X</span>
                </a>

                <div class="nav-links">

                    <a href="index.html">
                        Home
                    </a>

                    <a href="movies.html">
                        Movies
                    </a>

                    <a href="#">
                        Series
                    </a>

                    <a href="#">
                        Categories
                    </a>

                </div>

            </div>


            <div class="navbar-right">

                <a
                    href="search.html"
                    class="nav-icon search-trigger"
                    aria-label="Search"
                >
                    ⌕
                </a>

                <a
                    href="downloads.html"
                    class="download-link"
                >
                    Downloads
                </a>

                <a
                    href="my-list.html"
                    class="profile-button"
                >
                    <span class="profile-avatar">
                        J
                    </span>

                    <span class="profile-name">
                        My List
                    </span>
                </a>

            </div>

        </nav>
    `;
}


/* =========================================================
   HERO
   ========================================================= */

function HeroBanner(movie) {

    return `
        <section
            class="hero"
            style="
                background-image:
                linear-gradient(
                    90deg,
                    rgba(8,9,13,1) 0%,
                    rgba(8,9,13,.88) 30%,
                    rgba(8,9,13,.35) 65%,
                    rgba(8,9,13,.8) 100%
                ),
                linear-gradient(
                    0deg,
                    #08090d 0%,
                    transparent 35%
                ),
                url('${movie.backdrop}');
            "
        >

            <div class="hero-content">

                <div class="hero-badge">
                    FEATURED
                </div>

                <h1>
                    ${movie.title}
                </h1>

                <div class="hero-meta">

                    <span class="rating">
                        ★ ${movie.rating}
                    </span>

                    <span>${movie.year}</span>

                    <span>${movie.duration}</span>

                    <span>${movie.genre}</span>

                </div>

                <p class="hero-description">
                    ${movie.description}
                </p>

                <div class="hero-actions">

                    <button
                        class="btn btn-primary"
                        data-watch-movie="${movie.id}"
                    >
                        ▶ Watch Now
                    </button>

                    <button
                        class="btn btn-secondary"
                        data-details-movie="${movie.id}"
                    >
                        ＋ My List
                    </button>

                </div>

            </div>

        </section>
    `;
}


/* =========================================================
   MOVIE CARD
   ========================================================= */

function MovieCard(movie, options = {}) {

    const progress =
        options.progress !== undefined
            ? options.progress
            : null;

    return `
        <article
            class="movie-card"
            data-movie-id="${movie.id}"
        >

            <div class="movie-poster">

                <img
                    src="${movie.poster}"
                    alt="${movie.title}"
                    loading="lazy"
                >

                <div class="movie-overlay">

                    <button
                        class="card-play"
                        aria-label="Play ${movie.title}"
                    >
                        ▶
                    </button>

                </div>


                ${
                    progress !== null &&
                    progress > 0
                        ? `
                            <div class="progress-container">

                                <div
                                    class="progress-bar"
                                    style="width:${progress}%"
                                ></div>

                            </div>
                        `
                        : ""
                }

            </div>


            <div class="movie-info">

                <h3>
                    ${movie.title}
                </h3>

                <div class="movie-meta">

                    <span>
                        ★ ${movie.rating}
                    </span>

                    <span>
                        ${movie.year}
                    </span>

                    <span>
                        ${movie.genre}
                    </span>

                </div>

            </div>

        </article>
    `;
}


/* =========================================================
   MOVIE ROW
   ========================================================= */

function MovieRow(
    title,
    movieList,
    options = {}
) {

    if (!movieList.length) {

        return `
            <div class="empty-state">

                <div class="empty-icon">
                    ○
                </div>

                <h2>
                    Nothing here yet
                </h2>

                <p>
                    Start exploring StreamX
                    to build your library.
                </p>

            </div>
        `;
    }


    const cards =
        movieList
            .map(movie => {

                let progress = null;

                if (options.continueWatching) {

                    const seconds =
                        getWatchProgress(movie.id);

                    /*
                     * Demo percentage.
                     * The real duration will come
                     * from the video metadata later.
                     */

                    progress =
                        seconds > 0
                            ? Math.min(
                                95,
                                Math.max(
                                    5,
                                    seconds / 10
                                )
                            )
                            : 0;
                }

                return MovieCard(
                    movie,
                    {
                        progress
                    }
                );

            })
            .join("");


    return `
        <section class="content-section">

            <div class="section-header">

                <h2>
                    ${title}
                </h2>

                <button class="see-all">
                    See all
                    <span>→</span>
                </button>

            </div>

            <div class="movie-row">
                ${cards}
            </div>

        </section>
    `;
}


/* =========================================================
   FOOTER
   ========================================================= */

function Footer() {

    return `
        <footer class="footer">

            <div class="footer-brand">
                STREAM<span>X</span>
            </div>

            <p>
                Your entertainment. Anywhere.
            </p>

            <div class="footer-links">

                <a href="#">
                    About
                </a>

                <a href="#">
                    Privacy
                </a>

                <a href="#">
                    Terms
                </a>

                <a href="#">
                    Help
                </a>

            </div>

            <p class="copyright">
                © 2026 StreamX.
                All rights reserved.
            </p>

        </footer>
    `;
}