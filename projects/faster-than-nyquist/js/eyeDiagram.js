// ====== DOM ======
const canvas = document.getElementById("eyeDiagram_canvas");
const ctx     = canvas.getContext("2d");
const btn     = document.getElementById("eyeDiagram_btn");
const noiseSlider = document.getElementById("noiseSlider");

// ====== CONFIG (tweak here) ======
const FPS          = 60;     // redraws per second
const TIME_WINDOW  = 10;     // seconds across x-axis
const SIGNAL_FREQ  = 1;      // Hz
const AMPLITUDE    = 1;    // fraction of plot height (peak)

const PAD = { left: 50, right: 50, top: 50, bottom: 50 };

// ====== STATE ======
let running = false;
let timer   = null;
let noiseLevel = 0.02; // starting noise level


// ====== GEOMETRY HELPERS ======
function getPlotRect() {
  const w = canvas.width, h = canvas.height;
  const x = PAD.left, y = PAD.top;
  const pw = w - PAD.left - PAD.right;
  const ph = h - PAD.top - PAD.bottom;
  return { w, h, x, y, pw, ph, midY: y + ph / 2 };
}

// ====== DRAW HELPERS ======
function clearAndBackground(w, h) {
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, w, h);

  // subtle outer frame
  ctx.strokeStyle = "#666";
  ctx.lineWidth = 1;
  ctx.strokeRect(0.5, 0.5, w - 1, h - 1);
}

function drawAxes(plot) {
  ctx.strokeStyle = "#888";
  ctx.lineWidth = 1;

  // x-axis (0 amplitude)
  ctx.beginPath();
  ctx.moveTo(plot.x, plot.midY);
  ctx.lineTo(plot.x + plot.pw, plot.midY);
  ctx.stroke();

  // y-axis (left edge)
  ctx.beginPath();
  ctx.moveTo(plot.x, plot.y);
  ctx.lineTo(plot.x, plot.y + plot.ph);
  ctx.stroke();
}

function drawLabels(plot, canvasH) {
  ctx.fillStyle = "#bbb";
  ctx.font = "12px sans-serif";

  // x label
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  ctx.fillText("Time (s)", plot.x + plot.pw / 2, canvasH - 8);

  // y label (vertical)
  ctx.save();
  ctx.translate(14, plot.y + plot.ph / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("Signal (a.u.)", 0, 0);
  ctx.restore();
}

function drawTrace(plot, nowSec) {
  // clip to plot area so the trace stays inside
  ctx.save();
  ctx.beginPath();
  ctx.rect(plot.x, plot.y, plot.pw, plot.ph);
  ctx.clip();

  // scope-like glow
  ctx.strokeStyle = "#00ff55";
  ctx.lineWidth = 2;
  ctx.shadowColor = "#00ff55";
  ctx.shadowBlur = 6;

  const ampPx   = AMPLITUDE * plot.ph;
  const noisePx = noiseLevel * plot.ph;


  ctx.beginPath();
  for (let i = 0; i < plot.pw; i++) {
    const xPix = plot.x + i;
    // map column to time; right edge = now
    const t = nowSec - (plot.pw - 1 - i) * (TIME_WINDOW / plot.pw);

    // sine + tiny noise
    const signal =
      Math.sin(2 * Math.PI * SIGNAL_FREQ * t) +
      (Math.random() * 2 - 1) * (noisePx / ampPx);

    const yPix = plot.midY - signal * ampPx;
    if (i === 0) ctx.moveTo(xPix, yPix); else ctx.lineTo(xPix, yPix);
  }
  ctx.stroke();
  ctx.restore();
}

// ====== MAIN DRAW ======
function drawFrame() {
  const nowSec = performance.now() / 1000;
  const plot = getPlotRect();

  clearAndBackground(plot.w, plot.h);
  drawAxes(plot);
  drawLabels(plot, plot.h);
  drawTrace(plot, nowSec);
}

// ====== RUN/STOP ======
function setRunning(v) {
  running = v;
  btn.setAttribute("aria-pressed", String(v));
  btn.textContent = v ? "Turn Off" : "Turn On";
  btn.style.backgroundColor = v ? "red" : "green";
  btn.style.color = "white";

  if (timer) clearInterval(timer);
  timer = v ? setInterval(drawFrame, 1000 / FPS) : null;
  if (!v) drawFrame(); // show one static frame on stop
}

// ====== UI ======
btn.addEventListener("click", () => setRunning(!running));
noiseSlider.addEventListener("input", e => {
  noiseLevel = parseFloat(e.target.value);
});

// initial frame
drawFrame();
