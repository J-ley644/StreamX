
(() => {
    "use strict";

    const API_BASE_URL =
        window.STREAMX_API_BASE_URL ||
        "http://localhost:5000/api";

    const videoSection =
        document.getElementById("videosSection");

    const token =
        localStorage.getItem("streamx_token");

    if (!videoSection) return;

    let selectedMovieId = "";
    let movies = [];
    let assets = [];
    let uploading = false;

    const escapeHtml = value =>
        String(value ?? "").replace(/[&<>"']/g, char => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        })[char]);

    const formatSize = bytes => {
        if (bytes == null || !Number.isFinite(Number(bytes))) {
            return "—";
        }

        const size = Number(bytes);

        if (size < 1024) return `${size} B`;
        if (size < 1024 ** 2) {
            return `${(size / 1024).toFixed(1)} KB`;
        }
        if (size < 1024 ** 3) {
            return `${(size / 1024 ** 2).toFixed(1)} MB`;
        }

        return `${(size / 1024 ** 3).toFixed(2)} GB`;
    };

    async function apiRequest(path, options = {}) {
        const headers = {
            Authorization: `Bearer ${token}`,
            ...(options.headers || {})
        };

        // Let the browser set the multipart boundary.
        if (
            options.body !== undefined &&
            !(options.body instanceof FormData)
        ) {
            headers["Content-Type"] = "application/json";
        }

        const response = await fetch(
            `${API_BASE_URL}${path}`,
            { ...options, headers }
        );

        let result = {};

        try {
            result = await response.json();
        } catch {
            // The API may return an empty response.
        }

        if (response.status === 401) {
            sessionStorage.setItem(
                "streamx_redirect_after_auth",
                "admin.html"
            );
            window.location.href = "auth.html";
            throw new Error("Please sign in again.");
        }

        if (!response.ok) {
            throw new Error(
                result.message || `Request failed (${response.status}).`
            );
        }

        return result;
    }

    function renderInterface() {
        videoSection.innerHTML = `
            <div class="sx-video-manager">
                <section class="admin-panel sx-video-panel">
                    <h2>Upload Movie Video</h2>
                    <p class="sx-video-muted">
                        Select an existing movie and upload its MP4 file.
                        Maximum file size: 2 GB.
                    </p>

                    <form id="sxUploadForm">
                        <label for="sxMovieSelect">Movie</label>
                        <select id="sxMovieSelect" required>
                            <option value="">Loading movies...</option>
                        </select>

                        <label for="sxQuality">Quality label</label>
                        <select id="sxQuality" required>
                            <option value="1080p">1080p</option>
                            <option value="720p">720p</option>
                            <option value="480p">480p</option>
                            <option value="360p">360p</option>
                        </select>

                        <label for="sxVideoFile">MP4 video file</label>
                        <input
                            id="sxVideoFile"
                            type="file"
                            accept=".mp4,video/mp4"
                            required
                        >

                        <p class="sx-video-muted">
                            Quality is currently a manual label.
                            Automatic video transcoding is not included.
                        </p>

                        <button
                            id="sxUploadButton"
                            class="primary-button"
                            type="submit"
                        >Upload Video</button>

                        <button
                            id="sxRefreshButton"
                            class="secondary-button"
                            type="button"
                        >Refresh</button>

                        <p id="sxMessage" role="status"
                           aria-live="polite"></p>
                    </form>
                </section>

                <section class="admin-panel sx-video-panel">
                    <h2>Video Assets</h2>
                    <div class="table-wrapper">
                        <table class="movie-table">
                            <thead>
                                <tr>
                                    <th>Quality</th>
                                    <th>Status</th>
                                    <th>Size</th>
                                    <th>Video</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody id="sxAssetsBody">
                                <tr>
                                    <td colspan="5" class="table-message">
                                        Select a movie to view its videos.
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>
        `;

        const style = document.createElement("style");
        style.textContent = `
            .sx-video-manager {
                display: grid;
                gap: 20px;
            }

            .sx-video-panel {
                padding: 22px;
                margin-bottom: 0;
            }

            .sx-video-panel h2 {
                margin-top: 0;
            }

            .sx-video-panel label {
                display: block;
                margin: 14px 0 6px;
            }

            .sx-video-panel input,
            .sx-video-panel select {
                display: block;
                width: 100%;
                max-width: 600px;
                box-sizing: border-box;
                margin-bottom: 12px;
                padding: 11px;
            }

            .sx-video-muted {
                color: #9297a5;
                font-size: 13px;
                line-height: 1.6;
            }

            #sxMessage {
                white-space: pre-wrap;
                overflow-wrap: anywhere;
            }

            #sxAssetsBody a {
                color: #b7c6ff;
                overflow-wrap: anywhere;
            }

            #sxAssetsBody button {
                cursor: pointer;
            }
        `;

        document.getElementById("sxVideoManagerStyle")?.remove();
        style.id = "sxVideoManagerStyle";
        document.head.appendChild(style);

        document.getElementById("sxMovieSelect")
            .addEventListener("change", async event => {
                selectedMovieId = event.target.value;
                await loadAssets();
            });

        document.getElementById("sxUploadForm")
            .addEventListener("submit", uploadVideo);

        document.getElementById("sxRefreshButton")
            .addEventListener("click", async () => {
                await loadMovies();
                await loadAssets();
            });

        document.getElementById("sxAssetsBody")
            .addEventListener("click", deleteAsset);
    }

    function message(text, type = "info") {
        const node = document.getElementById("sxMessage");
        if (!node) return;

        node.textContent = text;
        node.style.color =
            type === "error" ? "#ff777e" :
            type === "success" ? "#65d98e" :
            "inherit";
    }

    async function loadMovies() {
        const select = document.getElementById("sxMovieSelect");
        if (!select) return;

        const previousId = selectedMovieId;

        try {
            const result = await apiRequest("/movies");

            movies = Array.isArray(result.data)
                ? result.data
                : Array.isArray(result.movies)
                    ? result.movies
                    : Array.isArray(result)
                        ? result
                        : [];

            if (!movies.length) {
                select.innerHTML =
                    '<option value="">Add a movie first</option>';

                selectedMovieId = "";
                renderAssets();
                return;
            }

            select.innerHTML = movies.map(movie => `
                <option value="${escapeHtml(movie.id)}">
                    ${escapeHtml(movie.title || "Untitled movie")}
                </option>
            `).join("");

            selectedMovieId = movies.some(
                movie => String(movie.id) === String(previousId)
            ) ? String(previousId) : String(movies[0].id);

            select.value = selectedMovieId;
        } catch (error) {
            select.innerHTML =
                '<option value="">Could not load movies</option>';
            message(error.message, "error");
        }
    }

    async function loadAssets() {
        const body = document.getElementById("sxAssetsBody");
        if (!body) return;

        if (!selectedMovieId) {
            assets = [];
            renderAssets();
            return;
        }

        body.innerHTML = `
            <tr><td colspan="5" class="table-message">
                Loading videos...
            </td></tr>
        `;

        try {
            const result = await apiRequest(
                `/movies/${encodeURIComponent(selectedMovieId)}/video-assets`
            );

            assets = Array.isArray(result.data) ? result.data : [];
            renderAssets();
        } catch (error) {
            body.innerHTML = `
                <tr><td colspan="5" class="table-message">
                    ${escapeHtml(error.message)}
                </td></tr>
            `;
        }
    }

    function renderAssets() {
        const body = document.getElementById("sxAssetsBody");
        if (!body) return;

        if (!assets.length) {
            body.innerHTML = `
                <tr><td colspan="5" class="table-message">
                    ${selectedMovieId
                        ? "No video assets uploaded for this movie yet."
                        : "Select a movie to view its videos."}
                </td></tr>
            `;
            return;
        }

        body.innerHTML = assets.map(asset => {
            const url = asset.stream_url || "";

            return `
                <tr>
                    <td>${escapeHtml(asset.quality || "—")}</td>
                    <td>${escapeHtml(asset.status || "pending")}</td>
                    <td>${escapeHtml(formatSize(asset.file_size_bytes))}</td>
                    <td>
                        ${url ? `
                            <a href="${escapeHtml(url)}"
                               target="_blank"
                               rel="noopener noreferrer">Open video</a>
                        ` : "—"}
                    </td>
                    <td>
                        <button type="button"
                            data-delete-asset="${escapeHtml(asset.id)}">
                            Delete
                        </button>
                    </td>
                </tr>
            `;
        }).join("");
    }

    async function uploadVideo(event) {
        event.preventDefault();
        if (uploading) return;

        const fileInput = document.getElementById("sxVideoFile");
        const file = fileInput.files?.[0];
        const quality = document.getElementById("sxQuality").value;
        const button = document.getElementById("sxUploadButton");

        if (!selectedMovieId) {
            message("Please select a movie.", "error");
            return;
        }

        if (!file || !/\.mp4$/i.test(file.name)) {
            message("Choose an MP4 file.", "error");
            return;
        }

        if (file.size > 2 * 1024 ** 3) {
            message("The file exceeds the 2 GB upload limit.", "error");
            return;
        }

        uploading = true;
        button.disabled = true;
        button.textContent = "Uploading...";
        message(`Uploading ${file.name}. Keep this page open.`, "info");

        try {
            const form = new FormData();
            form.append("video", file);
            form.append("quality", quality);

            const result = await apiRequest(
                `/movies/${encodeURIComponent(selectedMovieId)}/video-assets/upload`,
                { method: "POST", body: form }
            );

            fileInput.value = "";
            message(result.message || "Video uploaded successfully.", "success");

            await loadAssets();
        } catch (error) {
            message(error.message || "Upload failed.", "error");
        } finally {
            uploading = false;
            button.disabled = false;
            button.textContent = "Upload Video";
        }
    }

    async function deleteAsset(event) {
        const button = event.target.closest("[data-delete-asset]");
        if (!button) return;

        const assetId = button.dataset.deleteAsset;

        if (!confirm("Delete this video asset? This cannot be undone.")) {
            return;
        }

        button.disabled = true;

        try {
            const result = await apiRequest(
                `/media/video-assets/${encodeURIComponent(assetId)}`,
                { method: "DELETE" }
            );

            message(result.message || "Video deleted.", "success");
            await loadAssets();
        } catch (error) {
            message(error.message || "Could not delete video.", "error");
            button.disabled = false;
        }
    }

    let initialized = false;

    async function openVideoManager() {
        if (!initialized) {
            renderInterface();
            initialized = true;
            await loadMovies();
        }

        await loadAssets();
    }

    // Sidebar Videos button
    document.querySelectorAll(
        '.admin-nav-item[data-section="videos"]'
    ).forEach(button => {
        button.addEventListener("click", openVideoManager);
    });

    // Dashboard quick action: Manage Videos
    document.querySelectorAll(
        '[data-section-target="videos"]'
    ).forEach(button => {
        button.addEventListener("click", openVideoManager);
    });
})();