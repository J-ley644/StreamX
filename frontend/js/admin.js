const API_BASE_URL = "http://localhost:5000/api";

const token =
    localStorage.getItem("streamx_token");

const storedUser =
    localStorage.getItem("streamx_user");

let currentUser = null;
let movies = [];
let editingMovieId = null;


/* =========================
   AUTH
========================= */

try {
    currentUser = storedUser
        ? JSON.parse(storedUser)
        : null;
} catch {
    currentUser = null;
}

function redirectToLogin() {

    sessionStorage.setItem(
        "streamx_redirect_after_auth",
        "admin.html"
    );

    window.location.href = "auth.html";
}

if (
    !token ||
    !currentUser ||
    currentUser.role !== "admin"
) {
    redirectToLogin();
}


/* =========================
   DOM
========================= */

const navItems =
    document.querySelectorAll(".admin-nav-item[data-section]");

const sections = {
    dashboard:
        document.getElementById("dashboardSection"),

    movies:
        document.getElementById("moviesSection"),

    videos:
        document.getElementById("videosSection"),

    users:
        document.getElementById("usersSection"),

    administrators:
        document.getElementById("administratorsSection")
};

const pageTitle =
    document.getElementById("pageTitle");

const pageSubtitle =
    document.getElementById("pageSubtitle");

const adminName =
    document.getElementById("adminName");

const adminEmail =
    document.getElementById("adminEmail");

const statMovies =
    document.getElementById("statMovies");

const statUsers =
    document.getElementById("statUsers");

const statReadyVideos =
    document.getElementById("statReadyVideos");

const statPendingVideos =
    document.getElementById("statPendingVideos");

const movieSearch =
    document.getElementById("movieSearch");

const moviesTableBody =
    document.getElementById("moviesTableBody");

const movieModal =
    document.getElementById("movieModal");

const movieModalTitle =
    document.getElementById("movieModalTitle");

const movieModalSubtitle =
    document.getElementById("movieModalSubtitle");

const movieForm =
    document.getElementById("movieForm");

const movieFormError =
    document.getElementById("movieFormError");


/* =========================
   ACCOUNT
========================= */

function loadAccount() {

    if (!currentUser) {
        return;
    }

    adminName.textContent =
        currentUser.displayName ||
        "Administrator";

    adminEmail.textContent =
        currentUser.email || "";

    const avatar =
        document.querySelector(".admin-avatar");

    if (avatar) {
        avatar.textContent =
            (
                currentUser.displayName ||
                currentUser.email ||
                "A"
            )
                .charAt(0)
                .toUpperCase();
    }
}


/* =========================
   API HELPER
========================= */

async function apiRequest(
    endpoint,
    options = {}
) {

    const response =
        await fetch(
            `${API_BASE_URL}${endpoint}`,
            {
                ...options,

                headers: {
                    "Content-Type":
                        "application/json",

                    Authorization:
                        `Bearer ${token}`,

                    ...(options.headers || {})
                }
            }
        );

    let data = null;

    try {
        data = await response.json();
    } catch {
        data = null;
    }

    if (response.status === 401) {
        redirectToLogin();
        throw new Error(
            "Authentication expired."
        );
    }

    if (response.status === 403) {
        throw new Error(
            "Administrator access required."
        );
    }

    if (!response.ok) {

        throw new Error(
            data?.message ||
            "Request failed."
        );
    }

    return data;
}


/* =========================
   NAVIGATION
========================= */

function showSection(sectionName) {

    Object.values(sections).forEach(
        section => {
            section.classList.remove("active");
        }
    );

    navItems.forEach(item => {
        item.classList.remove("active");
    });

    if (!sections[sectionName]) {
        return;
    }

    sections[sectionName]
        .classList.add("active");

    const activeNav =
        document.querySelector(
            `[data-section="${sectionName}"]`
        );

    if (activeNav) {
        activeNav.classList.add("active");
    }

    const titles = {
        dashboard: [
            "Dashboard",
            "Manage your StreamX platform."
        ],

        movies: [
            "Movies",
            "Add, edit and manage StreamX movies."
        ],

        videos: [
            "Videos",
            "Manage movie video assets."
        ],

        users: [
            "Users",
            "Manage StreamX user accounts."
        ],

        administrators: [
            "Administrators",
            "Manage platform administrators."
        ]
    };

    const titleData =
        titles[sectionName] ||
        titles.dashboard;

    pageTitle.textContent =
        titleData[0];

    pageSubtitle.textContent =
        titleData[1];

    if (sectionName === "movies") {
        loadMovies();
    }
}


/* =========================
   NAV CLICK
========================= */

navItems.forEach(item => {

    item.addEventListener(
        "click",
        () => {

            showSection(
                item.dataset.section
            );

        }
    );

});


/* =========================
   QUICK ACTIONS
========================= */

document
    .querySelectorAll(
        "[data-section-target]"
    )
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                showSection(
                    button.dataset.sectionTarget
                );

            }
        );

    });


/* =========================
   DASHBOARD
========================= */

async function loadDashboard() {

    try {

        const result =
            await apiRequest(
                "/admin/dashboard"
            );

        const data =
            result.data || {};

        statMovies.textContent =
            data.movies ?? 0;

        statUsers.textContent =
            data.users ?? 0;

        statReadyVideos.textContent =
            data.readyVideos ?? 0;

        statPendingVideos.textContent =
            data.pendingVideos ?? 0;

    } catch (error) {

        console.error(
            "Dashboard error:",
            error
        );

    }
}


/* =========================
   MOVIES
========================= */

async function loadMovies() {

    moviesTableBody.innerHTML = `
        <tr>
            <td colspan="5" class="table-message">
                Loading movies...
            </td>
        </tr>
    `;

    try {

        const result =
            await fetch(
                `${API_BASE_URL}/movies`
            );

        const data =
            await result.json();

        if (!result.ok) {
            throw new Error(
                data?.message ||
                "Failed to load movies."
            );
        }

        movies =
            Array.isArray(data)
                ? data
                : data.data ||
                  data.movies ||
                  [];

        renderMovies();

    } catch (error) {

        console.error(
            "Movies error:",
            error
        );

        moviesTableBody.innerHTML = `
            <tr>
                <td colspan="5" class="table-message">
                    Failed to load movies.
                </td>
            </tr>
        `;
    }
}


/* =========================
   RENDER MOVIES
========================= */

function renderMovies() {

    const search =
        movieSearch.value
            .trim()
            .toLowerCase();

    const filteredMovies =
        movies.filter(movie => {

            const title =
                String(
                    movie.title || ""
                ).toLowerCase();

            return title.includes(search);
        });

    if (!filteredMovies.length) {

        moviesTableBody.innerHTML = `
            <tr>
                <td colspan="5" class="table-message">
                    ${
                        search
                            ? "No movies match your search."
                            : "No movies have been added yet."
                    }
                </td>
            </tr>
        `;

        return;
    }


    moviesTableBody.innerHTML =
        filteredMovies
            .map(movie =>
                createMovieRow(movie)
            )
            .join("");
}


/* =========================
   MOVIE ROW
========================= */

function createMovieRow(movie) {

    const id =
        movie.id;

    const title =
        escapeHtml(
            movie.title || "Untitled"
        );

    const year =
        movie.release_year ||
        "—";

    const rating =
        escapeHtml(
            movie.rating || "—"
        );

    const status =
        movie.video_status ||
        "pending";

    const poster =
        movie.poster_url;

    const posterHtml =
        poster
            ? `
                <img
                    class="movie-poster"
                    src="${escapeAttribute(poster)}"
                    alt="${title}"
                    onerror="this.outerHTML='<div class=&quot;movie-poster-placeholder&quot;>🎬</div>'"
                >
            `
            : `
                <div class="movie-poster-placeholder">
                    🎬
                </div>
            `;

    return `
        <tr>

            <td>

                <div class="movie-cell">

                    ${posterHtml}

                    <div>

                        <div class="movie-title">
                            ${title}
                        </div>

                        <div class="movie-id">
                            ${escapeHtml(String(id))}
                        </div>

                    </div>

                </div>

            </td>


            <td>
                ${year}
            </td>


            <td>
                ${rating}
            </td>


            <td>

                <span
                    class="video-status ${escapeAttribute(status)}"
                >
                    ${escapeHtml(status)}
                </span>

            </td>


            <td>

                <div class="table-actions">

                    <button
                        class="table-action"
                        type="button"
                        data-edit-movie="${escapeAttribute(String(id))}"
                    >
                        Edit
                    </button>

                    <button
                        class="table-action delete"
                        type="button"
                        data-delete-movie="${escapeAttribute(String(id))}"
                    >
                        Delete
                    </button>

                </div>

            </td>

        </tr>
    `;
}


/* =========================
   MOVIE TABLE ACTIONS
========================= */

moviesTableBody.addEventListener(
    "click",
    event => {

        const editButton =
            event.target.closest(
                "[data-edit-movie]"
            );

        const deleteButton =
            event.target.closest(
                "[data-delete-movie]"
            );


        if (editButton) {

            const movie =
                movies.find(
                    item =>
                        String(item.id) ===
                        String(
                            editButton.dataset.editMovie
                        )
                );

            if (movie) {
                openEditMovie(movie);
            }

            return;
        }


        if (deleteButton) {

            const id =
                deleteButton.dataset.deleteMovie;

            deleteMovie(id);
        }

    }
);


/* =========================
   SEARCH
========================= */

movieSearch.addEventListener(
    "input",
    renderMovies
);


/* =========================
   MODAL
========================= */

function openMovieModal() {

    editingMovieId = null;

    movieForm.reset();

    document.getElementById(
        "movieId"
    ).value = "";

    movieModalTitle.textContent =
        "Add Movie";

    movieModalSubtitle.textContent =
        "Add a new movie to StreamX.";

    movieFormError.textContent = "";

    movieFormError.classList.remove(
        "active"
    );

    movieModal.classList.add("active");
}


function openEditMovie(movie) {

    editingMovieId =
        movie.id;

    document.getElementById(
        "movieId"
    ).value =
        movie.id || "";

    document.getElementById(
        "movieTitle"
    ).value =
        movie.title || "";

    document.getElementById(
        "movieDescription"
    ).value =
        movie.description || "";

    document.getElementById(
        "movieReleaseYear"
    ).value =
        movie.release_year || "";

    document.getElementById(
        "movieDuration"
    ).value =
        movie.duration_seconds || "";

    document.getElementById(
        "movieRating"
    ).value =
        movie.rating || "";

    document.getElementById(
        "moviePoster"
    ).value =
        movie.poster_url || "";

    document.getElementById(
        "movieBackdrop"
    ).value =
        movie.backdrop_url || "";

    document.getElementById(
        "movieStatus"
    ).value =
        movie.video_status || "pending";

    movieModalTitle.textContent =
        "Edit Movie";

    movieModalSubtitle.textContent =
        "Update movie information.";

    movieFormError.textContent = "";

    movieFormError.classList.remove(
        "active"
    );

    movieModal.classList.add("active");
}


function closeMovieModal() {

    movieModal.classList.remove(
        "active"
    );

    editingMovieId = null;
}


/* =========================
   MODAL EVENTS
========================= */

document
    .getElementById("addMovieButton")
    .addEventListener(
        "click",
        openMovieModal
    );

document
    .getElementById("closeMovieModal")
    .addEventListener(
        "click",
        closeMovieModal
    );

document
    .getElementById("cancelMovieButton")
    .addEventListener(
        "click",
        closeMovieModal
    );

movieModal.addEventListener(
    "click",
    event => {

        if (
            event.target ===
            movieModal
        ) {
            closeMovieModal();
        }

    }
);


/* =========================
   SAVE MOVIE
========================= */

movieForm.addEventListener(
    "submit",
    async event => {

        event.preventDefault();

        movieFormError.textContent = "";

        movieFormError.classList.remove(
            "active"
        );


        const saveButton =
            document.getElementById(
                "saveMovieButton"
            );

        const payload = {
            title:
                document
                    .getElementById("movieTitle")
                    .value
                    .trim(),

            description:
                document
                    .getElementById("movieDescription")
                    .value
                    .trim(),

            release_year:
                toNumberOrNull(
                    document
                        .getElementById(
                            "movieReleaseYear"
                        )
                        .value
                ),

            duration_seconds:
                toNumberOrNull(
                    document
                        .getElementById(
                            "movieDuration"
                        )
                        .value
                ),

            rating:
    toNumberOrNull(
        document
            .getElementById("movieRating")
            .value
    ),

            poster_url:
                document
                    .getElementById("moviePoster")
                    .value
                    .trim(),

            backdrop_url:
                document
                    .getElementById("movieBackdrop")
                    .value
                    .trim(),

            video_status:
                document
                    .getElementById("movieStatus")
                    .value
        };


        if (!payload.title) {

            showMovieError(
                "Movie title is required."
            );

            return;
        }


        saveButton.disabled = true;
        saveButton.textContent =
            "Saving...";


        try {

            let result;

            if (editingMovieId) {

                result =
                    await apiRequest(
                        `/movies/${editingMovieId}`,
                        {
                            method: "PATCH",
                            body:
                                JSON.stringify(
                                    payload
                                )
                        }
                    );

            } else {

                result =
                    await apiRequest(
                        "/movies",
                        {
                            method: "POST",
                            body:
                                JSON.stringify(
                                    payload
                                )
                        }
                    );

            }

            console.log(
                "Movie saved:",
                result
            );

            closeMovieModal();

            await loadMovies();

            await loadDashboard();

        } catch (error) {

            console.error(
                "Save movie error:",
                error
            );

            showMovieError(
                error.message ||
                "Failed to save movie."
            );

        } finally {

            saveButton.disabled = false;

            saveButton.textContent =
                "Save Movie";
        }

    }
);


/* =========================
   DELETE MOVIE
========================= */

async function deleteMovie(id) {

    const movie =
        movies.find(
            item =>
                String(item.id) ===
                String(id)
        );

    const title =
        movie?.title ||
        "this movie";

    const confirmed =
        window.confirm(
            `Delete "${title}"?\n\nThis action cannot be undone.`
        );

    if (!confirmed) {
        return;
    }


    try {

        await apiRequest(
            `/movies/${id}`,
            {
                method: "DELETE"
            }
        );

        await loadMovies();

        await loadDashboard();

    } catch (error) {

        console.error(
            "Delete movie error:",
            error
        );

        window.alert(
            error.message ||
            "Failed to delete movie."
        );
    }
}


/* =========================
   HELPERS
========================= */

function showMovieError(message) {

    movieFormError.textContent =
        message;

    movieFormError.classList.add(
        "active"
    );
}


function toNumberOrNull(value) {

    if (
        value === "" ||
        value === null ||
        value === undefined
    ) {
        return null;
    }

    const number =
        Number(value);

    return Number.isFinite(number)
        ? number
        : null;
}


function escapeHtml(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


function escapeAttribute(value) {

    return escapeHtml(value);
}


/* =========================
   OTHER BUTTONS
========================= */

document
    .getElementById("backToStreamX")
    .addEventListener(
        "click",
        () => {
            window.location.href =
                "index.html";
        }
    );


document
    .getElementById("adminLogout")
    .addEventListener(
        "click",
        () => {

            localStorage.removeItem(
                "streamx_token"
            );

            localStorage.removeItem(
                "streamx_user"
            );

            sessionStorage.removeItem(
                "streamx_redirect_after_auth"
            );

            window.location.href =
                "auth.html";
        }
    );


/* =========================
   START
========================= */

loadAccount();

loadDashboard();