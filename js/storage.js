/* ==========================================================
   VoiceForge AI
   storage.js
   Local Storage Manager
========================================================== */

(() => {
    "use strict";

const STORAGE_KEYS = {
    TEXT: "vf-text",
    HISTORY: "vf-history",
    SETTINGS: "vf-settings",
    SUMMARY: "vf-summary"
};

const MAX_HISTORY = 20;

/* ----------------------------------------------------------
   Helpers
---------------------------------------------------------- */

function save(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

function load(key, fallback = null) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : fallback;
    } catch {
        return fallback;
    }
}

function remove(key) {
    localStorage.removeItem(key);
}

/* ----------------------------------------------------------
   Auto Save Text
---------------------------------------------------------- */

function saveCurrentText() {

    const textArea = document.getElementById("textInput");

    if (!textArea) return;

    save(STORAGE_KEYS.TEXT, textArea.value);

}

function restoreCurrentText() {

    const textArea = document.getElementById("textInput");

    if (!textArea) return;

    const text = load(STORAGE_KEYS.TEXT, "");

    textArea.value = text;

    if (window.summarizer) {
        window.summarizer.update();
    }

}

/* ----------------------------------------------------------
   History
---------------------------------------------------------- */

function getHistory() {

    return load(STORAGE_KEYS.HISTORY, []);

}

function addHistory(text) {

    if (!text.trim()) return;

    let history = getHistory();

    history = history.filter(item => item.text !== text);

    history.unshift({
        text,
        date: new Date().toLocaleString()
    });

    if (history.length > MAX_HISTORY) {

        history.length = MAX_HISTORY;

    }

    save(STORAGE_KEYS.HISTORY, history);

}

function clearHistory() {

    save(STORAGE_KEYS.HISTORY, []);

}

/* ----------------------------------------------------------
   Summary
---------------------------------------------------------- */

function saveSummary(summary) {

    save(STORAGE_KEYS.SUMMARY, summary);

}

function getSummary() {

    return load(STORAGE_KEYS.SUMMARY, "");

}

/* ----------------------------------------------------------
   Settings
---------------------------------------------------------- */

function saveSettings(settings) {

    const existing = load(
        STORAGE_KEYS.SETTINGS,
        {}
    );

    save(
        STORAGE_KEYS.SETTINGS,
        {
            ...existing,
            ...settings
        }
    );

}

function getSettings() {

    return load(
        STORAGE_KEYS.SETTINGS,
        {}
    );

}

/* ----------------------------------------------------------
   Export Backup
---------------------------------------------------------- */

function exportData() {

    const data = {

        text: load(STORAGE_KEYS.TEXT, ""),

        history: getHistory(),

        settings: getSettings(),

        summary: getSummary(),

        exportedAt: new Date().toISOString()

    };

    const blob = new Blob(

        [
            JSON.stringify(
                data,
                null,
                2
            )
        ],

        {
            type: "application/json"
        }

    );

    const url =
        URL.createObjectURL(blob);

    const a =
        document.createElement("a");

    a.href = url;

    a.download =
        "voiceforge-backup.json";

    a.click();

    URL.revokeObjectURL(url);

}

/* ----------------------------------------------------------
   Import Backup
---------------------------------------------------------- */

function importData(file) {

    const reader = new FileReader();

    reader.onload = e => {

        try {

            const data =
                JSON.parse(
                    e.target.result
                );

            if (data.text)
                save(
                    STORAGE_KEYS.TEXT,
                    data.text
                );

            if (data.history)
                save(
                    STORAGE_KEYS.HISTORY,
                    data.history
                );

            if (data.settings)
                save(
                    STORAGE_KEYS.SETTINGS,
                    data.settings
                );

            if (data.summary)
                save(
                    STORAGE_KEYS.SUMMARY,
                    data.summary
                );

            restoreCurrentText();

            if (window.showToast) {

                showToast(
                    "Backup imported.",
                    "success"
                );

            }

        } catch {

            if (window.showToast) {

                showToast(
                    "Invalid backup file.",
                    "error"
                );

            }

        }

    };

    reader.readAsText(file);

}

/* ----------------------------------------------------------
   Auto Save
---------------------------------------------------------- */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        restoreCurrentText();

        const textArea =
            document.getElementById(
                "textInput"
            );

        if (!textArea) return;

        textArea.addEventListener(
            "input",
            saveCurrentText
        );

    }
);

/* ----------------------------------------------------------
   Public API
---------------------------------------------------------- */

window.storage = {

    save,

    load,

    remove,

    addHistory,

    getHistory,

    clearHistory,

    saveSummary,

    getSummary,

    saveSettings,

    getSettings,

    exportData,

    importData,

    restoreCurrentText,

    saveCurrentText

};

})();