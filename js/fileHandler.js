/* ==========================================================
   VoiceForge AI
   fileHandler.js
   File Upload • Clipboard • Export
========================================================== */

(() => {
    "use strict";

const fileInput = document.getElementById("fileInput");
const textInput = document.getElementById("textInput");

const uploadBtn = document.getElementById("uploadBtn");
const copyBtn = document.getElementById("copyBtn");
const clearBtn = document.getElementById("clearBtn");

/* ----------------------------------------------------------
   Toast Helper
---------------------------------------------------------- */

function notify(message, type = "success") {

    if (window.showToast) {
        showToast(message, type);
    } else {
        console.log(message);
    }

}

/* ----------------------------------------------------------
   Open File Picker
---------------------------------------------------------- */

function openFilePicker() {

    if (fileInput) {

        fileInput.click();

    }

}

/* ----------------------------------------------------------
   Read Text File
---------------------------------------------------------- */

function readTextFile(file) {

    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".txt")) {

        notify("Only .txt files are supported.", "error");
        return;

    }

    const reader = new FileReader();

    reader.onload = (e) => {

        textInput.value = e.target.result;

        if (window.summarizer) {

            window.summarizer.update();

        }

        notify("File loaded successfully.");

    };

    reader.onerror = () => {

        notify("Unable to read file.", "error");

    };

    reader.readAsText(file);

}

/* ----------------------------------------------------------
   File Input Event
---------------------------------------------------------- */

if (fileInput) {

    fileInput.addEventListener("change", (e) => {

        if (e.target.files.length) {

            readTextFile(e.target.files[0]);

        }

    });

}

/* ----------------------------------------------------------
   Copy Text
---------------------------------------------------------- */

async function copyText() {

    const text = textInput.value.trim();

    if (!text) {

        notify("Nothing to copy.", "error");
        return;

    }

    try {

        await navigator.clipboard.writeText(text);

        notify("Copied to clipboard.");

    } catch {

        notify("Clipboard access denied.", "error");

    }

}

/* ----------------------------------------------------------
   Clear Text
---------------------------------------------------------- */

function clearText() {

    textInput.value = "";

    if (window.summarizer) {

        window.summarizer.update();

    }

    notify("Editor cleared.");

}

/* ----------------------------------------------------------
   Download Text
---------------------------------------------------------- */

function downloadText(filename = "voiceforge.txt") {

    const text = textInput.value;

    if (!text.trim()) {

        notify("Nothing to download.", "error");
        return;

    }

    const blob = new Blob([text], {

        type: "text/plain"

    });

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");

    a.href = url;

    a.download = filename;

    document.body.appendChild(a);

    a.click();

    a.remove();

    URL.revokeObjectURL(url);

    notify("Download started.");

}

/* ----------------------------------------------------------
   Drag & Drop
---------------------------------------------------------- */

function preventDefaults(e) {

    e.preventDefault();

    e.stopPropagation();

}

["dragenter", "dragover", "dragleave", "drop"]
.forEach(event => {

    document.addEventListener(
        event,
        preventDefaults,
        false
    );

});

document.addEventListener("dragover", () => {

    document.body.classList.add("dragging");

});

document.addEventListener("dragleave", () => {

    document.body.classList.remove("dragging");

});

document.addEventListener("drop", (e) => {

    document.body.classList.remove("dragging");

    if (!e.dataTransfer.files.length)
        return;

    readTextFile(e.dataTransfer.files[0]);

});

/* ----------------------------------------------------------
   Paste Support
---------------------------------------------------------- */

textInput.addEventListener("paste", () => {

    setTimeout(() => {

        if (window.summarizer) {

            window.summarizer.update();

        }

    }, 10);

});

/* ----------------------------------------------------------
   Button Events
---------------------------------------------------------- */

uploadBtn?.addEventListener(
    "click",
    openFilePicker
);

copyBtn?.addEventListener(
    "click",
    copyText
);

clearBtn?.addEventListener(
    "click",
    clearText
);

/* ----------------------------------------------------------
   Public API
---------------------------------------------------------- */

window.fileHandler = {

    open: openFilePicker,

    read: readTextFile,

    copy: copyText,

    clear: clearText,

    download: downloadText

};

})();