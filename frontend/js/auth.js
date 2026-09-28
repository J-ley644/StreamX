const STREAMX_AUTH_API =
window.STREAMX_API_BASE ||
"http://localhost:5000/api";

/* =========================================================
ELEMENTS
========================================================= */

const landingView =
document.getElementById("landingView");

const registerView =
document.getElementById("registerView");

const loginView =
document.getElementById("loginView");

const showRegisterButton =
document.getElementById("showRegisterButton");

const showLoginButton =
document.getElementById("showLoginButton");

const switchToLogin =
document.getElementById("switchToLogin");

const switchToRegister =
document.getElementById("switchToRegister");

const registerForm =
document.getElementById("registerForm");

const loginForm =
document.getElementById("loginForm");

const registerMessage =
document.getElementById("registerMessage");

const loginMessage =
document.getElementById("loginMessage");

const registerSubmit =
document.getElementById("registerSubmit");

const loginSubmit =
document.getElementById("loginSubmit");

const resendVerification =
document.getElementById("resendVerification");

const resendVerificationButton =
document.getElementById(
"resendVerificationButton"
);

/* =========================================================
VIEW SWITCHING
========================================================= */

function showView(view) {


landingView.classList.add("hidden");
registerView.classList.add("hidden");
loginView.classList.add("hidden");

view.classList.remove("hidden");

window.scrollTo({
    top: 0,
    behavior: "smooth"
});


}

function showLanding() {
showView(landingView);
}

function showRegister() {
clearMessages();
showView(registerView);


setTimeout(() => {
    document
        .getElementById("registerDisplayName")
        ?.focus();
}, 100);


}

function showLogin() {
clearMessages();
showView(loginView);


setTimeout(() => {
    document
        .getElementById("loginEmail")
        ?.focus();
}, 100);


}

/* =========================================================
MESSAGE HELPERS
========================================================= */

function showMessage(
element,
message,
type = "error"
) {
element.textContent = message;
element.className =
`form-message show ${type}`;
}

function hideMessage(element) {
element.textContent = "";
element.className = "form-message";
}

function clearMessages() {
hideMessage(registerMessage);
hideMessage(loginMessage);


resendVerification.classList.add("hidden");


}

/* =========================================================
API
========================================================= */

async function authRequest(
endpoint,
options = {}
) {
const response = await fetch(
`${STREAMX_AUTH_API}${endpoint}`,
{
...options,


        headers: {
            "Content-Type":
                "application/json",

            ...(options.headers || {})
        }
    }
);

let data = {};

try {
    data = await response.json();
} catch (error) {
    data = {};
}

if (!response.ok) {
    const error =
        new Error(
            data.message ||
            "Something went wrong."
        );

    error.status = response.status;
    error.code = data.code;

    throw error;
}

return data;


}

/* =========================================================
REGISTER
========================================================= */

registerForm.addEventListener(
"submit",
async (event) => {


    event.preventDefault();

    hideMessage(registerMessage);

    const displayName =
        document
            .getElementById(
                "registerDisplayName"
            )
            .value
            .trim();

    const email =
        document
            .getElementById(
                "registerEmail"
            )
            .value
            .trim()
            .toLowerCase();

    const password =
        document
            .getElementById(
                "registerPassword"
            )
            .value;

    if (displayName.length < 2) {
        showMessage(
            registerMessage,
            "Display name must be at least 2 characters."
        );
        return;
    }

    if (password.length < 8) {
        showMessage(
            registerMessage,
            "Password must be at least 8 characters."
        );
        return;
    }

    registerSubmit.disabled = true;
    registerSubmit.textContent =
        "Creating account...";

    try {

        const data =
            await authRequest(
                "/auth/register",
                {
                    method: "POST",

                    body: JSON.stringify({
                        email,
                        password,
                        displayName
                    })
                }
            );

        showMessage(
            registerMessage,
            data.message ||
                "Account created. Please check your email to verify your account.",
            "success"
        );

        registerForm.reset();

        /*
         * Give the user a clear next step without
         * automatically logging them in.
         */
        setTimeout(() => {
            showLogin();

            showMessage(
                loginMessage,
                "Your account was created. Please verify your email first, then sign in.",
                "success"
            );

            document
                .getElementById(
                    "loginEmail"
                )
                .value = email;

        }, 2200);

    } catch (error) {

        showMessage(
            registerMessage,
            error.message ||
                "Unable to create your account."
        );

    } finally {

        registerSubmit.disabled = false;
        registerSubmit.textContent =
            "Create Account";
    }
}


);

/* =========================================================
LOGIN
========================================================= */

loginForm.addEventListener(
"submit",
async (event) => {


    event.preventDefault();

    hideMessage(loginMessage);

    resendVerification
        .classList
        .add("hidden");

    const email =
        document
            .getElementById(
                "loginEmail"
            )
            .value
            .trim()
            .toLowerCase();

    const password =
        document
            .getElementById(
                "loginPassword"
            )
            .value;

    loginSubmit.disabled = true;
    loginSubmit.textContent =
        "Signing in...";

    try {

        const data =
            await authRequest(
                "/auth/login",
                {
                    method: "POST",

                    body: JSON.stringify({
                        email,
                        password
                    })
                }
            );

        if (!data.token) {
            throw new Error(
                "Login succeeded but no authentication token was returned."
            );
        }

        /*
         * This is the key used by the existing
         * playback integration in data.js.
         */
        localStorage.setItem(
            "streamx_token",
            data.token
        );

        if (data.user) {
            localStorage.setItem(
                "streamx_user",
                JSON.stringify(data.user)
            );
        }

        showMessage(
            loginMessage,
            "Login successful. Welcome back!",
            "success"
        );

        setTimeout(() => {

            const redirect =
                sessionStorage.getItem(
                    "streamx_redirect_after_auth"
                );

            sessionStorage.removeItem(
                "streamx_redirect_after_auth"
            );

            window.location.href =
                redirect || "index.html";

        }, 700);

    } catch (error) {

        showMessage(
            loginMessage,
            error.message ||
                "Unable to sign in."
        );

        if (
            error.code ===
            "EMAIL_NOT_VERIFIED"
        ) {
            resendVerification
                .classList
                .remove("hidden");
        }

    } finally {

        loginSubmit.disabled = false;
        loginSubmit.textContent =
            "Sign In";
    }
}


);

/* =========================================================
RESEND VERIFICATION
========================================================= */

resendVerificationButton.addEventListener(
"click",
async () => {


    const email =
        document
            .getElementById(
                "loginEmail"
            )
            .value
            .trim()
            .toLowerCase();

    if (!email) {
        showMessage(
            loginMessage,
            "Enter your email address first."
        );
        return;
    }

    resendVerificationButton.disabled = true;
    resendVerificationButton.textContent =
        "Sending...";

    try {

        const data =
            await authRequest(
                "/auth/resend-verification",
                {
                    method: "POST",

                    body: JSON.stringify({
                        email
                    })
                }
            );

        showMessage(
            loginMessage,
            data.message ||
                "If an account exists with this email, a verification email has been sent.",
            "success"
        );

    } catch (error) {

        showMessage(
            loginMessage,
            error.message ||
                "Unable to resend the verification email."
        );

    } finally {

        resendVerificationButton.disabled =
            false;

        resendVerificationButton.textContent =
            "Resend verification email";
    }
}


);

/* =========================================================
BUTTON EVENTS
========================================================= */

showRegisterButton.addEventListener(
"click",
showRegister
);

showLoginButton.addEventListener(
"click",
showLogin
);

switchToLogin.addEventListener(
"click",
showLogin
);

switchToRegister.addEventListener(
"click",
showRegister
);

document
.querySelectorAll("[data-show-landing]")
.forEach((button) => {
button.addEventListener(
"click",
showLanding
);
});

/* =========================================================
INITIAL STATE
========================================================= */

showLanding();
