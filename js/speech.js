/* ==========================================================
   VoiceForge AI
   speech.js
   Text To Speech Engine
========================================================== */

(() => {
    "use strict";

let utterance = null;
let isPaused = false;
let isSpeaking = false;

/* ----------------------------------------------------------
   DOM Elements
---------------------------------------------------------- */

const textInput = document.getElementById("textInput");

const speakBtn = document.getElementById("speakBtn");
const pauseBtn = document.getElementById("pauseBtn");
const resumeBtn = document.getElementById("resumeBtn");
const stopBtn = document.getElementById("stopBtn");

const voiceSelect = document.getElementById("voiceSelect");
const languageSelect = document.getElementById("languageSelect");

const rateSlider = document.getElementById("rate");
const pitchSlider = document.getElementById("pitch");
const volumeSlider = document.getElementById("volume");

const visualizer = document.getElementById("visualizer");

/* ----------------------------------------------------------
   Helpers
---------------------------------------------------------- */

function showToast(message, type = "info") {

    const toast = document.getElementById("toast");

    if (!toast) return;

    toast.textContent = message;

    toast.className = "";

    toast.classList.add(type === "success"
        ? "toast-success"
        : type === "error"
            ? "toast-error"
            : "toast-info");

    toast.classList.add("show");

    setTimeout(() => {

        toast.classList.remove("show");

    }, 2500);

}

function setSpeakingState(active) {

    isSpeaking = active;

    if (visualizer) {

        visualizer.classList.toggle("active", active);

    }

    if (speakBtn) {

        speakBtn.classList.toggle("speaking", active);

    }

}

/* ----------------------------------------------------------
   Create Utterance
---------------------------------------------------------- */

function createUtterance() {

    const text = textInput.value.trim();

    if (!text) {

        showToast("Please enter some text.", "error");
        return null;

    }

    const speech = new SpeechSynthesisUtterance(text);

    speech.rate = parseFloat(rateSlider.value);
    speech.pitch = parseFloat(pitchSlider.value);
    speech.volume = parseFloat(volumeSlider.value);

    const selectedVoice = speechSynthesis
        .getVoices()
        .find(v => v.name === voiceSelect.value);

    if (selectedVoice) {

        speech.voice = selectedVoice;
        speech.lang = selectedVoice.lang;

    } else {

        speech.lang = languageSelect.value;

    }

    speech.onstart = () => {

        setSpeakingState(true);

        if (window.startVisualizer) {

            window.startVisualizer();

        }

    };

    speech.onend = () => {

        setSpeakingState(false);

        isPaused = false;

        if (window.stopVisualizer) {

            window.stopVisualizer();

        }

        showToast("Speech completed.", "success");

    };

    speech.onerror = () => {

        setSpeakingState(false);

        isPaused = false;

        if (window.stopVisualizer) {

            window.stopVisualizer();

        }

        showToast("Speech synthesis failed.", "error");

    };

    return speech;

}

/* ----------------------------------------------------------
   Speak
---------------------------------------------------------- */

function speakText() {

    if (speechSynthesis.speaking) {

        speechSynthesis.cancel();

    }

    utterance = createUtterance();

    if (!utterance) return;

    speechSynthesis.speak(utterance);

}

/* ----------------------------------------------------------
   Pause
---------------------------------------------------------- */

function pauseSpeech() {

    if (!speechSynthesis.speaking) return;

    speechSynthesis.pause();

    isPaused = true;

    showToast("Speech paused.");

}

/* ----------------------------------------------------------
   Resume
---------------------------------------------------------- */

function resumeSpeech() {

    if (!isPaused) return;

    speechSynthesis.resume();

    isPaused = false;

    showToast("Speech resumed.", "success");

}

/* ----------------------------------------------------------
   Stop
---------------------------------------------------------- */

function stopSpeech() {

    if (!speechSynthesis.speaking) return;

    speechSynthesis.cancel();

    isPaused = false;

    setSpeakingState(false);

    if (window.stopVisualizer) {

        window.stopVisualizer();

    }

    showToast("Speech stopped.");

}

/* ----------------------------------------------------------
   Keyboard Shortcuts
---------------------------------------------------------- */

document.addEventListener("keydown", (event) => {

    if (event.ctrlKey && event.key === "Enter") {

        event.preventDefault();

        speakText();

    }

    if (event.ctrlKey && event.key.toLowerCase() === "p") {

        event.preventDefault();

        pauseSpeech();

    }

    if (event.ctrlKey && event.key.toLowerCase() === "r") {

        event.preventDefault();

        resumeSpeech();

    }

    if (event.ctrlKey && event.key.toLowerCase() === "s") {

        event.preventDefault();

        stopSpeech();

    }

});

/* ----------------------------------------------------------
   Button Events
---------------------------------------------------------- */

speakBtn.addEventListener("click", speakText);

pauseBtn.addEventListener("click", pauseSpeech);

resumeBtn.addEventListener("click", resumeSpeech);

stopBtn.addEventListener("click", stopSpeech);

/* ----------------------------------------------------------
   Stop speech before leaving page
---------------------------------------------------------- */

window.addEventListener("beforeunload", () => {

    speechSynthesis.cancel();

});

/* ----------------------------------------------------------
   Public API
---------------------------------------------------------- */

window.speechController = {

    speak: speakText,

    pause: pauseSpeech,

    resume: resumeSpeech,

    stop: stopSpeech,

    isSpeaking: () => isSpeaking,

    isPaused: () => isPaused

};

})();