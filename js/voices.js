/* ==========================================================
   VoiceForge AI
   voices.js
   Voice Manager
========================================================== */

(() => {
    "use strict";

let availableVoices = [];
let favoriteVoices = JSON.parse(localStorage.getItem("vf-favorites")) || [];

const voiceDropdown = document.getElementById("voiceSelect");
const languageDropdown = document.getElementById("languageSelect");

/* ----------------------------------------------------------
   Language Map
---------------------------------------------------------- */

const languageMap = {
    "English": "en",
    "Hindi": "hi",
    "French": "fr",
    "German": "de",
    "Japanese": "ja"
};

/* ----------------------------------------------------------
   Load Voices
---------------------------------------------------------- */

function loadVoices() {

    availableVoices = speechSynthesis.getVoices();

    if (!availableVoices.length) return;

    populateVoiceDropdown();

}

speechSynthesis.onvoiceschanged = loadVoices;

/* ----------------------------------------------------------
   Populate Dropdown
---------------------------------------------------------- */

function populateVoiceDropdown(filter = "") {

    voiceDropdown.innerHTML = "";

    let voices = [...availableVoices];

    if (filter) {

        voices = voices.filter(v =>
            v.lang.toLowerCase().startsWith(filter.toLowerCase())
        );

    }

    voices.sort((a, b) => {

        const favA = favoriteVoices.includes(a.name);
        const favB = favoriteVoices.includes(b.name);

        if (favA && !favB) return -1;
        if (!favA && favB) return 1;

        return a.name.localeCompare(b.name);

    });

    voices.forEach(voice => {

        const option = document.createElement("option");

        option.value = voice.name;

        option.textContent =
            `${favoriteVoices.includes(voice.name) ? "⭐ " : ""}${voice.name} (${voice.lang})`;

        voiceDropdown.appendChild(option);

    });

    restoreSelection();

}

/* ----------------------------------------------------------
   Restore Previous Voice
---------------------------------------------------------- */

function restoreSelection() {

    const savedVoice = localStorage.getItem("vf-selected-voice");

    if (!savedVoice) return;

    const option = [...voiceDropdown.options]
        .find(opt => opt.value === savedVoice);

    if (option) {

        voiceDropdown.value = savedVoice;

    }

}

/* ----------------------------------------------------------
   Save Voice
---------------------------------------------------------- */

function saveSelectedVoice() {

    localStorage.setItem(
        "vf-selected-voice",
        voiceDropdown.value
    );

}

voiceDropdown.addEventListener(
    "change",
    saveSelectedVoice
);

/* ----------------------------------------------------------
   Filter By Language
---------------------------------------------------------- */

languageDropdown.addEventListener("change", () => {

    const lang = languageMap[languageDropdown.value];

    populateVoiceDropdown(lang);

});

/* ----------------------------------------------------------
   Favorite Voice
---------------------------------------------------------- */

function toggleFavoriteVoice() {

    const selected = voiceDropdown.value;

    if (!selected) return;

    if (favoriteVoices.includes(selected)) {

        favoriteVoices =
            favoriteVoices.filter(v => v !== selected);

    } else {

        favoriteVoices.push(selected);

    }

    localStorage.setItem(
        "vf-favorites",
        JSON.stringify(favoriteVoices)
    );

    populateVoiceDropdown(
        languageMap[languageDropdown.value] || ""
    );

    voiceDropdown.value = selected;

    if (window.showToast) {

        showToast("Favorite voices updated.", "success");

    }

}

/* ----------------------------------------------------------
   Voice Preview
---------------------------------------------------------- */

function previewVoice() {

    if (!voiceDropdown.value) return;

    const sample = new SpeechSynthesisUtterance(
        "Hello! Welcome to Voice Forge AI."
    );

    const voice = availableVoices.find(
        v => v.name === voiceDropdown.value
    );

    if (voice) {

        sample.voice = voice;
        sample.lang = voice.lang;

    }

    sample.rate = 1;
    sample.pitch = 1;
    sample.volume = 1;

    speechSynthesis.cancel();
    speechSynthesis.speak(sample);

}

/* ----------------------------------------------------------
   Search Voices
---------------------------------------------------------- */

function searchVoices(query) {

    query = query.toLowerCase();

    voiceDropdown.innerHTML = "";

    availableVoices
        .filter(v =>
            v.name.toLowerCase().includes(query) ||
            v.lang.toLowerCase().includes(query)
        )
        .forEach(voice => {

            const option = document.createElement("option");

            option.value = voice.name;

            option.textContent =
                `${voice.name} (${voice.lang})`;

            voiceDropdown.appendChild(option);

        });

}

/* ----------------------------------------------------------
   Get Voice
---------------------------------------------------------- */

function getSelectedVoice() {

    return availableVoices.find(
        v => v.name === voiceDropdown.value
    );

}

/* ----------------------------------------------------------
   Public API
---------------------------------------------------------- */

window.voiceManager = {

    loadVoices,

    previewVoice,

    toggleFavoriteVoice,

    searchVoices,

    getSelectedVoice

};

/* ----------------------------------------------------------
   Initialize
---------------------------------------------------------- */

document.addEventListener("DOMContentLoaded", () => {

    loadVoices();

});

})();