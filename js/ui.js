(() => {
  "use strict";

  const UI = {
    els: {},
    state: {
      speaking: false,
      loading: false,
    },

    init() {
      this.cacheDOM();
      this.bindEvents();
      this.restoreInitialState();
      this.refreshHistory();
      this.updateStats();
      this.updateButtonStates();
      this.updateEmptyState();
      this.listenToModuleEvents();
    },

    cacheDOM() {
      const $ = (s) => document.querySelector(s);

      this.els = {
        body: document.body,

        editor:
          $("#textInput") ||
          $("#editor") ||
          $("#text") ||
          $("textarea"),

        history:
          $("#historyList") ||
          $("#history"),

        historyClear:
          $("#clearHistory"),

        wordCount:
          $("#wordCount"),

        charCount:
          $("#charCount"),

        readingTime:
          $("#readingTime"),

        keywordCount:
          $("#keywordCount"),

        speak:
          $("#speakBtn"),

        pause:
          $("#pauseBtn"),

        resume:
          $("#resumeBtn"),

        stop:
          $("#stopBtn"),

        copy:
          $("#copyBtn"),

        clear:
          $("#clearBtn"),

        download:
          $("#downloadBtn"),

        upload:
          $("#uploadBtn"),

        summarize:
          $("#summarizeBtn"),

        loading:
          $("#loading"),

        toastContainer:
          $("#toastContainer"),

        speakingIndicator:
          $("#speakingIndicator"),

        emptyState:
          $("#emptyState"),

        app:
          $("#app"),
      };
    },

    bindEvents() {
      const e = this.els.editor;

      if (e) {
        e.addEventListener("input", () => {
          this.updateStats();
          this.updateButtonStates();
          this.updateEmptyState();
        });
      }

      this.els.copy?.addEventListener("click", () => this.copyAnimation());

      this.els.historyClear?.addEventListener("click", () => {
        this.clearHistory();
      });

      document.addEventListener("keydown", (ev) => this.shortcuts(ev));
    },

    shortcuts(e) {
      const ctrl = e.ctrlKey || e.metaKey;

      if (!ctrl) return;

      switch (e.key.toLowerCase()) {
        case "enter":
          e.preventDefault();
          window.speechController?.speak?.();
          break;

        case "k":
          e.preventDefault();
          window.speechController?.stop?.();
          break;

        case "l":
          e.preventDefault();
          window.speechController?.pause?.();
          break;

        case "j":
          e.preventDefault();
          window.speechController?.resume?.();
          break;

        case "d":
          e.preventDefault();
          window.fileHandler?.download?.();
          break;

        case "b":
          e.preventDefault();
          window.fileHandler?.copy?.();
          this.copyAnimation();
          break;
      }
    },

    restoreInitialState() {
      this.updateSpeaking(false);
      this.hideLoading();
    },

    updateStats() {
      if (!window.summarizer || !this.els.editor) return;

      try {
        const text = this.els.editor.value;

        let stats = {};

        if (typeof window.summarizer.getStats === "function") {
          stats = window.summarizer.getStats(text);
        } else {
          stats.wordCount =
            text.trim().length === 0
              ? 0
              : text.trim().split(/\s+/).length;

          stats.characterCount = text.length;
          stats.readingTime = Math.max(
            0,
            Math.ceil(stats.wordCount / 200)
          );

          if (window.summarizer.extractKeywords) {
            stats.keywords =
              window.summarizer.extractKeywords(text) || [];
          }
        }

        if (this.els.wordCount)
          this.els.wordCount.textContent =
            stats.wordCount ?? 0;

        if (this.els.charCount)
          this.els.charCount.textContent =
            stats.characterCount ??
            stats.characters ??
            text.length;

        if (this.els.readingTime)
          this.els.readingTime.textContent =
            stats.readingTime ??
            stats.readTime ??
            0;

        if (this.els.keywordCount)
          this.els.keywordCount.textContent =
            stats.keywords?.length ??
            stats.keywordCount ??
            0;
      } catch (err) {
        console.error(err);
      }
    },

    updateButtonStates() {
      const hasText =
        this.els.editor &&
        this.els.editor.value.trim().length > 0;

      [
        this.els.speak,
        this.els.copy,
        this.els.clear,
        this.els.download,
        this.els.summarize,
      ].forEach((b) => {
        if (b) b.disabled = !hasText;
      });

      if (this.els.pause)
        this.els.pause.disabled = !this.state.speaking;

      if (this.els.stop)
        this.els.stop.disabled = !this.state.speaking;

      if (this.els.resume)
        this.els.resume.disabled = !this.state.speaking;
    },

    updateEmptyState() {
      if (!this.els.emptyState || !this.els.editor) return;

      this.els.emptyState.classList.toggle(
        "hidden",
        this.els.editor.value.trim().length !== 0
      );
    },

    showLoading() {
      this.state.loading = true;

      this.els.loading?.classList.remove("hidden");

      this.els.app?.classList.add("loading");
    },

    hideLoading() {
      this.state.loading = false;

      this.els.loading?.classList.add("hidden");

      this.els.app?.classList.remove("loading");
    },

    copyAnimation() {
      if (!this.els.copy) return;

      this.els.copy.classList.add("copied");

      setTimeout(() => {
        this.els.copy?.classList.remove("copied");
      }, 700);
    },

    updateSpeaking(active) {
      this.state.speaking = active;

      this.els.body.classList.toggle(
        "speaking",
        active
      );

      this.els.speakingIndicator?.classList.toggle(
        "active",
        active
      );

      if (active) {
        window.startVisualizer?.();
      } else {
        window.stopVisualizer?.();
      }

      this.updateButtonStates();
    },

    refreshHistory() {
      if (!this.els.history || !window.storage) return;

      this.els.history.innerHTML = "";

      let history = [];

      try {
        if (typeof window.storage.getHistory === "function") {
          history = window.storage.getHistory() || [];
        } else if (Array.isArray(window.storage.history)) {
          history = window.storage.history;
        }
      } catch (e) {}

      if (!history.length) {
        const li = document.createElement("li");
        li.className = "history-empty";
        li.textContent = "No history";
        this.els.history.appendChild(li);
        return;
      }

      history.forEach((item) => {
        const li = document.createElement("li");
        li.className = "history-item";

        li.textContent =
          typeof item === "string"
            ? item.slice(0, 70)
            : (item.text || "").slice(0, 70);

        li.title =
          typeof item === "string"
            ? item
            : item.text || "";

        li.addEventListener("click", () => {
          const text =
            typeof item === "string"
              ? item
              : item.text || "";

          if (this.els.editor) {
            this.els.editor.value = text;

            this.updateStats();
            this.updateButtonStates();
            this.updateEmptyState();
          }

          this.toast("History restored", "success");
        });

        this.els.history.appendChild(li);
      });
    },

    clearHistory() {
      try {
        if (window.storage?.clearHistory) {
          window.storage.clearHistory();
        }

        this.refreshHistory();

        this.toast("History cleared", "success");
      } catch (err) {
        this.toast("Unable to clear history", "error");
      }
    },

    toast(message, type = "info") {
      if (!this.els.toastContainer) {
        console.log(message);
        return;
      }

      const toast = document.createElement("div");

      toast.className = `toast ${type}`;

      toast.textContent = message;

      this.els.toastContainer.appendChild(toast);

      requestAnimationFrame(() =>
        toast.classList.add("show")
      );

      setTimeout(() => {
        toast.classList.remove("show");

        setTimeout(() => toast.remove(), 300);
      }, 3000);
    },

    listenToModuleEvents() {
      document.addEventListener("speech:start", () => {
        this.updateSpeaking(true);
      });

      document.addEventListener("speech:end", () => {
        this.updateSpeaking(false);
      });

      document.addEventListener("speech:pause", () => {
        this.toast("Paused", "info");
      });

      document.addEventListener("speech:resume", () => {
        this.toast("Resumed", "success");
      });

      document.addEventListener("speech:error", (e) => {
        this.updateSpeaking(false);

        this.toast(
          e.detail?.message || "Speech error",
          "error"
        );
      });

      document.addEventListener("storage:updated", () => {
        this.refreshHistory();
      });

      document.addEventListener("storage:historyChanged", () => {
        this.refreshHistory();
      });

      document.addEventListener("summary:updated", () => {
        this.updateStats();
      });

      document.addEventListener("theme:changed", () => {
        this.els.body.classList.add("theme-transition");

        setTimeout(() => {
          this.els.body.classList.remove(
            "theme-transition"
          );
        }, 500);
      });

      document.addEventListener("toast", (e) => {
        this.toast(
          e.detail?.message || "",
          e.detail?.type || "info"
        );
      });

      document.addEventListener("loading:start", () => {
        this.showLoading();
      });

      document.addEventListener("loading:end", () => {
        this.hideLoading();
      });

      window.addEventListener("error", (e) => {
        this.toast(
          e.message || "Unexpected error",
          "error"
        );
      });

      window.addEventListener("unhandledrejection", () => {
        this.toast(
          "Unexpected error occurred",
          "error"
        );
      });
    },
  };

  window.uiManager = UI;

})();