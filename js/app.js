(() => {
    "use strict";

    const VERSION = "1.0.0";

    const App = {
        initialized: false,
        modules: {},

        async init() {
            if (this.initialized) return;

            try {
                this.cacheModules();
                this.validateModules();

                await this.initializeTheme();
                await this.initializeStorage();
                await this.restoreSavedText();
                await this.initializeVoices();
                await this.initializeSummarizer();
                await this.initializeVisualizer();
                await this.initializeHistory();
                await this.initializeSpeech();
                await this.initializeUI();

                this.registerGlobalHandlers();

                this.initialized = true;

                this.printBanner();

                document.dispatchEvent(
                    new CustomEvent("app:ready")
                );
            } catch (error) {
                console.error(error);
                this.handleFatal(error);
            }
        },

        async restart() {
            await this.destroy();
            await this.init();
        },

        async destroy() {
            try {
                window.speechController?.stop?.();
            } catch (_) {}

            try {
                window.stopVisualizer?.();
            } catch (_) {}

            this.initialized = false;

            document.dispatchEvent(
                new CustomEvent("app:destroyed")
            );
        },

        cacheModules() {
            this.modules = {
                speech: window.speechController,
                voices: window.voiceManager,
                summarizer: window.summarizer,
                visualizer: window.visualizer,
                fileHandler: window.fileHandler,
                theme: window.themeManager,
                storage: window.storage,
                ui: window.uiManager
            };
        },

        validateModules() {
            const required = [
                "speech",
                "voices",
                "summarizer",
                "visualizer",
                "fileHandler",
                "theme",
                "storage",
                "ui"
            ];

            required.forEach((name) => {
                if (!this.modules[name]) {
                    throw new Error(
                        `${name} module not found.`
                    );
                }
            });
        },

        async initializeTheme() {
            const theme = this.modules.theme;

            theme?.init?.();
            theme?.restore?.();
            theme?.load?.();
            theme?.applySavedTheme?.();
        },

        async initializeStorage() {
            const storage = this.modules.storage;

            storage?.init?.();
            storage?.restore?.();
            storage?.enableAutoSave?.();
        },

        async restoreSavedText() {
            const editor =
                document.querySelector("#textInput") ||
                document.querySelector("#editor") ||
                document.querySelector("#text") ||
                document.querySelector("textarea");

            if (!editor) return;

            const storage = this.modules.storage;

            let text = "";

            if (storage?.restoreText) {
                text = storage.restoreText();
            } else if (storage?.getSavedText) {
                text = storage.getSavedText();
            }

            if (typeof text === "string" && text.length) {
                editor.value = text;
                editor.dispatchEvent(new Event("input"));
            }
        },

        async initializeVoices() {
            const voices = this.modules.voices;

            voices?.init?.();
            voices?.loadVoices?.();
            voices?.restoreSelection?.();
        },

        async initializeSummarizer() {
            const summarizer = this.modules.summarizer;

            summarizer?.init?.();

            document.dispatchEvent(
                new CustomEvent("summary:updated")
            );
        },

        async initializeVisualizer() {
            const visualizer = this.modules.visualizer;

            visualizer?.init?.();
            window.stopVisualizer?.();
        },

        async initializeHistory() {
            const storage = this.modules.storage;

            storage?.loadHistory?.();

            document.dispatchEvent(
                new CustomEvent("storage:updated")
            );
        },

        async initializeSpeech() {
            const speech = this.modules.speech;

            speech?.init?.();

            this.connectSpeechEvents();
        },

        async initializeUI() {
            const ui = this.modules.ui;

            ui?.init?.();
        },

        connectSpeechEvents() {
            const speech = this.modules.speech;

            if (!speech) return;

            const wrap = (fnName, eventName) => {
                if (
                    typeof speech[fnName] !== "function" ||
                    speech[`__wrapped_${fnName}`]
                )
                    return;

                const original = speech[fnName].bind(speech);

                speech[fnName] = (...args) => {
                    document.dispatchEvent(
                        new CustomEvent(eventName)
                    );

                    return original(...args);
                };

                speech[`__wrapped_${fnName}`] = true;
            };

            wrap("speak", "speech:start");
            wrap("pause", "speech:pause");
            wrap("resume", "speech:resume");

            if (
                typeof speech.stop === "function" &&
                !speech.__wrapped_stop
            ) {
                const stop = speech.stop.bind(speech);

                speech.stop = (...args) => {
                    const result = stop(...args);

                    document.dispatchEvent(
                        new CustomEvent("speech:end")
                    );

                    return result;
                };

                speech.__wrapped_stop = true;
            }
        },

        registerGlobalHandlers() {
            if (this.__registered) return;

            this.__registered = true;

            window.addEventListener("error", (event) => {
                console.error(
                    "[VoiceForge AI]",
                    event.error || event.message
                );

                document.dispatchEvent(
                    new CustomEvent("toast", {
                        detail: {
                            type: "error",
                            message:
                                event.message ||
                                "Unexpected error"
                        }
                    })
                );
            });

            window.addEventListener(
                "unhandledrejection",
                (event) => {
                    console.error(
                        "[VoiceForge AI]",
                        event.reason
                    );

                    document.dispatchEvent(
                        new CustomEvent("toast", {
                            detail: {
                                type: "error",
                                message:
                                    "Unhandled promise rejection"
                            }
                        })
                    );
                }
            );
        },

        handleFatal(error) {
            console.error(
                "[VoiceForge AI] Startup Failed",
                error
            );

            document.dispatchEvent(
                new CustomEvent("toast", {
                    detail: {
                        type: "error",
                        message:
                            "Application failed to start."
                    }
                })
            );
        },

        printBanner() {
            console.log(`
%cVoiceForge AI
%cVersion ${VERSION}
%cReady
`,
                "color:#4f8cff;font-size:22px;font-weight:bold;",
                "color:#888;font-size:14px;",
                "color:#00c853;font-size:14px;font-weight:bold;"
            );
        }
    };

    window.app = App;

    document.addEventListener("DOMContentLoaded", () => {
        window.app.init();
    });
})();