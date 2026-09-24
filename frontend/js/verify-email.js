const API_BASE_URL =
    "http://localhost:5000/api";

const card =
    document.getElementById(
        "verificationCard"
    );

const icon =
    document.getElementById(
        "verificationIcon"
    );

const title =
    document.getElementById(
        "verificationTitle"
    );

const message =
    document.getElementById(
        "verificationMessage"
    );

const status =
    document.getElementById(
        "verificationStatus"
    );

const button =
    document.getElementById(
        "verificationButton"
    );

function showSuccess() {
    card.classList.remove("error");
    card.classList.add("success");

    icon.textContent = "?";

    title.textContent =
        "Email verified!";

    message.textContent =
        "Your StreamX account is now active. You can sign in and start watching.";

    status.textContent =
        "Your email address has been successfully verified.";

    button.href = "index.html";
    button.textContent =
        "Continue to StreamX";
    button.style.display = "inline-flex";
}

function showError(messageText) {
    card.classList.remove("success");
    card.classList.add("error");

    icon.textContent = "!";

    title.textContent =
        "Verification failed";

    message.textContent =
        messageText ||
        "We couldn't verify your email address.";

    status.textContent =
        "The verification link may be invalid or expired.";

    button.href =
        "index.html";
    button.textContent =
        "Return to StreamX";
    button.style.display =
        "inline-flex";
}

async function verifyEmail() {
    const params =
        new URLSearchParams(
            window.location.search
        );

    const token =
        params.get("token");

    if (!token) {
        showError(
            "No verification token was found in this link."
        );

        return;
    }

    try {
        const response =
            await fetch(
                `${API_BASE_URL}/auth/verify-email?token=${encodeURIComponent(token)}`
            );

        const data =
            await response.json();

        if (!response.ok || !data.success) {
            throw new Error(
                data.message ||
                "Email verification failed."
            );
        }

        showSuccess();

    } catch (error) {
        console.error(
            "Email verification error:",
            error
        );

        showError(
            error.message ||
            "Unable to connect to the StreamX server."
        );
    }
}

verifyEmail();
