// transmitter_response.js
(function () {
  // Create a global namespace once (used by all three files)
  const FTN = (window.FTN = window.FTN || {});

  // ---- Math helpers (shared) ----
  const PI = Math.PI;
  const SQRT2 = Math.SQRT2;

  function sinc(x) { return Math.abs(x) < 1e-12 ? 1 : Math.sin(PI * x) / (PI * x); }
  FTN.sinc = sinc;

  // Root-raised-cosine impulse response
  FTN.hRRC = function hRRC(t, Ts, beta) {
    if (Math.abs(t) < 1e-8) {
      return (1 / Ts) * (1 + beta * (4 / PI - 1));
    }
    if (beta > 0 && Math.abs(Math.abs(t) - Ts / (4 * beta)) < 1e-6 * Ts) {
      const s = Math.sin(PI / (4 * beta));
      const c = Math.cos(PI / (4 * beta));
      return (beta / (Ts * SQRT2)) * ((1 + 2 / PI) * s + (1 - 2 / PI) * c);
    }
    const num =
      Math.sin(PI * t / Ts * (1 - beta)) +
      4 * beta * (t / Ts) * Math.cos(PI * t / Ts * (1 + beta));
    const den = (PI * t / Ts) * (1 - Math.pow(4 * beta * t / Ts, 2));
    return (1 / Ts) * (num / den);
  };

  // Convolution (small N)
  FTN.convolve = function convolve(a, b) {
    const y = new Array(a.length + b.length - 1).fill(0);
    for (let i = 0; i < a.length; i++) {
      const ai = a[i];
      for (let j = 0; j < b.length; j++) y[i + j] += ai * b[j];
    }
    return y;
  };

  // Naive DFT magnitude + fftshift
  FTN.spectrumMag = function spectrumMag(x, fs, Nfft = 1024) {
    const N = Nfft;
    const xx = new Array(N).fill(0);
    const M = Math.min(N, x.length);
    for (let i = 0; i < M; i++) xx[i] = x[i];

    const mag = new Array(N).fill(0);
    const TWO_PI = 2 * Math.PI;
    for (let k = 0; k < N; k++) {
      let re = 0, im = 0;
      for (let n = 0; n < N; n++) {
        const ang = (TWO_PI * k * n) / N;
        re += xx[n] * Math.cos(ang);
        im -= xx[n] * Math.sin(ang);
      }
      mag[k] = Math.hypot(re, im) / N;
    }
    const df = fs / N;
    const freq = new Array(N);
    for (let k = 0; k < N; k++) freq[k] = k * df;

    const half = N >> 1;
    const magS = mag.slice(half).concat(mag.slice(0, half));
    const freqS = freq.slice(half).map(f => f - fs / 2).concat(freq.slice(0, half));
    return { freq: freqS, mag: magS };
  };

  // Time axis helper
  FTN.makeTimeAxis = function makeTimeAxis(Ts, os, winSyms) {
    const dt = Ts / os;
    const N = Math.floor(winSyms * os);
    const t = new Array(2 * N + 1);
    for (let i = -N; i <= N; i++) t[i + N] = i * dt;
    return { t, dt, fs: 1 / dt };
  };

  // Plot helpers (shared)
  FTN.drawAxes = function drawAxes(ctx, x, y, w, h, xLabel, yLabel) {
    ctx.strokeStyle = "#333";
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 40, y + 10, w - 50, h - 30);
    ctx.fillStyle = "#aaa";
    ctx.font = "12px system-ui, sans-serif";
    ctx.fillText(xLabel, x + w - 42, y + h - 8);
    ctx.save();
    ctx.translate(x + 6, y + 18);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText(yLabel, 0, 0);
    ctx.restore();
  };

  FTN.plotLine = function plotLine(ctx, x, y, w, h, xs, ys, xMin, xMax, yMin, yMax, color = "#fff", thick = 1.5) {
    const px = x + 40, py = y + 10, pw = w - 50, ph = h - 30;
    const sx = v => px + ((v - xMin) / (xMax - xMin)) * pw;
    const sy = v => py + ph - ((v - yMin) / (yMax - yMin)) * ph;
    ctx.beginPath();
    for (let i = 0; i < xs.length; i++) {
      const X = sx(xs[i]), Y = sy(ys[i]);
      if (i === 0) ctx.moveTo(X, Y); else ctx.lineTo(X, Y);
    }
    ctx.strokeStyle = color; ctx.lineWidth = thick; ctx.stroke();
  };

  FTN.yRange = function yRange(arr) {
    let lo = +Infinity, hi = -Infinity;
    for (const v of arr) { if (v < lo) lo = v; if (v > hi) hi = v; }
    if (Math.abs(hi - lo) < 1e-12) { lo -= 1; hi += 1; }
    const pad = 0.05 * (hi - lo);
    return [lo - pad, hi + pad];
  };

  // Expose frequently used DOM elements
FTN.el = {
    canvasTx: document.getElementById("scope-tx"),
    canvasCh: document.getElementById("scope-ch"),
    canvasRx: document.getElementById("scope-rx"),
    Rs: document.getElementById("Rs"),
    betaTx: document.getElementById("betaTx"),
    betaRx: document.getElementById("betaRx"),
    BW: document.getElementById("BW"),
    win: document.getElementById("win"),
    os: document.getElementById("os")
};

if (!FTN.el.canvasTx || !FTN.el.canvasCh || !FTN.el.canvasRx) {
  console.error("One or more canvases not found. Check IDs: scope-tx, scope-ch, scope-rx.");
}
["Rs","betaTx","betaRx","BW","win","os"].forEach(id=>{
  if(!FTN.el[id]) console.error("Missing input element #"+id);
});

})();

