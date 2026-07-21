/* ==========================================================
   VoiceForge AI
   theme.js
   Theme Manager
========================================================== */

(() => {
    "use strict";

const THEME_KEY = "vf-theme";
const ACCENT_KEY = "vf-accent";

const root = document.documentElement;

const themeToggle =
    document.getElementById("themeToggle");

const accentButtons =
    document.querySelectorAll("[data-accent]");

/* ----------------------------------------------------------
   Available Themes
---------------------------------------------------------- */

const THEMES = {

    dark: "dark",

    light: "light"

};

const ACCENTS = [

    "purple",
    "blue",
    "green",
    "orange",
    "rose",
    "cyan"

];

/* ----------------------------------------------------------
   Apply Theme
---------------------------------------------------------- */

function applyTheme(theme) {

    if (!Object.values(THEMES).includes(theme)) {

        theme = "dark";

    }

    root.setAttribute(
        "data-theme",
        theme
    );

    localStorage.setItem(
        THEME_KEY,
        theme
    );

    updateThemeButton();

}

/* ----------------------------------------------------------
   Apply Accent
---------------------------------------------------------- */

function applyAccent(accent) {

    if (!ACCENTS.includes(accent)) {

        accent = "purple";

    }

    root.setAttribute(
        "data-accent",
        accent
    );

    localStorage.setItem(
        ACCENT_KEY,
        accent
    );

    highlightAccent();

}

/* ----------------------------------------------------------
   Toggle Theme
---------------------------------------------------------- */

function toggleTheme() {

    const current =
        root.getAttribute("data-theme") ||
        "dark";

    applyTheme(

        current === "dark"
            ? "light"
            : "dark"

    );

}

/* ----------------------------------------------------------
   Theme Button
---------------------------------------------------------- */

function updateThemeButton() {

    if (!themeToggle) return;

    const dark =
        root.getAttribute("data-theme") ===
        "dark";

    themeToggle.textContent =
        dark ? "☀️" : "🌙";

}

/* ----------------------------------------------------------
   Accent Active State
---------------------------------------------------------- */

function highlightAccent() {

    const current =
        root.getAttribute("data-accent");

    accentButtons.forEach(btn => {

        btn.classList.toggle(

            "active",

            btn.dataset.accent === current

        );

    });

}

/* ----------------------------------------------------------
   Load Saved Settings
---------------------------------------------------------- */

function loadSavedTheme() {

    const savedTheme =
        localStorage.getItem(THEME_KEY);

    const savedAccent =
        localStorage.getItem(ACCENT_KEY);

    if (savedTheme) {

        applyTheme(savedTheme);

    } else {

        detectSystemTheme();

    }

    if (savedAccent) {

        applyAccent(savedAccent);

    } else {

        applyAccent("purple");

    }

}

/* ----------------------------------------------------------
   Detect System Theme
---------------------------------------------------------- */

function detectSystemTheme() {

    const prefersDark =

        window.matchMedia(

            "(prefers-color-scheme: dark)"

        ).matches;

    applyTheme(

        prefersDark
            ? "dark"
            : "light"

    );

}

/* ----------------------------------------------------------
   Listen for System Changes
---------------------------------------------------------- */

window.matchMedia(

    "(prefers-color-scheme: dark)"

).addEventListener(

    "change",

    e => {

        if (

            !localStorage.getItem(THEME_KEY)

        ) {

            applyTheme(

                e.matches
                    ? "dark"
                    : "light"

            );

        }

    }

);

/* ----------------------------------------------------------
   Accent Events
---------------------------------------------------------- */

accentButtons.forEach(button => {

    button.addEventListener(

        "click",

        () => {

            applyAccent(

                button.dataset.accent

            );

        }

    );

});

/* ----------------------------------------------------------
   Theme Button Event
---------------------------------------------------------- */

themeToggle?.addEventListener(

    "click",

    toggleTheme

);

/* ----------------------------------------------------------
   Keyboard Shortcut
---------------------------------------------------------- */

document.addEventListener(

    "keydown",

    e => {

        if (

            e.altKey &&

            e.key.toLowerCase() === "t"

        ) {

            e.preventDefault();

            toggleTheme();

        }

    }

);

/* ----------------------------------------------------------
   Public API
---------------------------------------------------------- */

window.themeManager = {

    applyTheme,

    applyAccent,

    toggleTheme,

    currentTheme() {

        return root.getAttribute(
            "data-theme"
        );

    },

    currentAccent() {

        return root.getAttribute(
            "data-accent"
        );

    }

};

/* ----------------------------------------------------------
   Initialize
---------------------------------------------------------- */

document.addEventListener(

    "DOMContentLoaded",

    loadSavedTheme

);

})();