/* ==========================================================
   VoiceForge AI
   visualizer.js
   Speech Visualization Engine
========================================================== */

(() => {
    "use strict";

const canvas = document.getElementById("visualizer");
const ctx = canvas ? canvas.getContext("2d") : null;

let animationId = null;
let isVisualizerRunning = false;
let phase = 0;

/* ----------------------------------------------------------
   Resize Canvas
---------------------------------------------------------- */

function resizeCanvas() {

    if (!canvas) return;

    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;

}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();

/* ----------------------------------------------------------
   Clear Canvas
---------------------------------------------------------- */

function clearCanvas() {

    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

}

/* ----------------------------------------------------------
   Draw Background
---------------------------------------------------------- */

function drawBackground() {

    ctx.fillStyle = "rgba(255,255,255,0.04)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

}

/* ----------------------------------------------------------
   Generate Wave
---------------------------------------------------------- */

function drawWave() {

    const width = canvas.width;
    const height = canvas.height;

    const center = height / 2;

    ctx.beginPath();

    for (let x = 0; x <= width; x++) {

        const y =
            center +
            Math.sin((x + phase) * 0.04) *
            (18 + Math.sin(phase * 0.03) * 12);

        if (x === 0)
            ctx.moveTo(x, y);
        else
            ctx.lineTo(x, y);

    }

    ctx.lineWidth = 3;
    ctx.strokeStyle = "#6C63FF";
    ctx.stroke();

}

/* ----------------------------------------------------------
   Draw Bars
---------------------------------------------------------- */

function drawBars() {

    const bars = 40;

    const gap = 8;

    const width = 10;

    const base = canvas.height / 2;

    for (let i = 0; i < bars; i++) {

        const x = i * (width + gap) + 10;

        const h =
            20 +
            Math.abs(
                Math.sin(
                    phase * 0.05 +
                    i * 0.45
                )
            ) * 90;

        ctx.fillStyle =
            `rgba(108,99,255,${0.4 + h / 120})`;

        ctx.fillRect(
            x,
            base - h / 2,
            width,
            h
        );

    }

}

/* ----------------------------------------------------------
   Draw Circle Pulse
---------------------------------------------------------- */

function drawCircle() {

    const x = canvas.width / 2;
    const y = canvas.height / 2;

    const radius =
        45 +
        Math.sin(phase * 0.05) * 12;

    ctx.beginPath();

    ctx.arc(
        x,
        y,
        radius,
        0,
        Math.PI * 2
    );

    ctx.lineWidth = 4;

    ctx.strokeStyle =
        "rgba(108,99,255,.8)";

    ctx.stroke();

}

/* ----------------------------------------------------------
   Draw Glow
---------------------------------------------------------- */

function drawGlow() {

    const gradient =
        ctx.createRadialGradient(

            canvas.width / 2,
            canvas.height / 2,
            20,

            canvas.width / 2,
            canvas.height / 2,
            canvas.height

        );

    gradient.addColorStop(
        0,
        "rgba(108,99,255,.15)"
    );

    gradient.addColorStop(
        1,
        "transparent"
    );

    ctx.fillStyle = gradient;

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

}

/* ----------------------------------------------------------
   Animation Loop
---------------------------------------------------------- */

function animate() {

    if (!isVisualizerRunning)
        return;

    clearCanvas();

    drawBackground();

    drawGlow();

    drawBars();

    drawWave();

    drawCircle();

    phase += 2;

    animationId =
        requestAnimationFrame(
            animate
        );

}

/* ----------------------------------------------------------
   Start
---------------------------------------------------------- */

function startVisualizer() {

    if (isVisualizerRunning)
        return;

    isVisualizerRunning = true;

    animate();

}

/* ----------------------------------------------------------
   Stop
---------------------------------------------------------- */

function stopVisualizer() {

    isVisualizerRunning = false;

    cancelAnimationFrame(
        animationId
    );

    clearCanvas();

}

/* ----------------------------------------------------------
   Toggle
---------------------------------------------------------- */

function toggleVisualizer() {

    if (isVisualizerRunning)
        stopVisualizer();
    else
        startVisualizer();

}

/* ----------------------------------------------------------
   Demo Mode
---------------------------------------------------------- */

function demoVisualizer(seconds = 4) {

    startVisualizer();

    setTimeout(() => {

        stopVisualizer();

    }, seconds * 1000);

}

/* ----------------------------------------------------------
   Public API
---------------------------------------------------------- */

window.startVisualizer =
    startVisualizer;

window.stopVisualizer =
    stopVisualizer;

window.visualizer = {

    start: startVisualizer,

    stop: stopVisualizer,

    toggle: toggleVisualizer,

    demo: demoVisualizer,

    isRunning: () =>
        isVisualizerRunning

};

})();