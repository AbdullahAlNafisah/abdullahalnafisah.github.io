(function () {
  const FTN = window.FTN;
  const {
    hRRC, channelIR, convolve, spectrumMag, makeTimeAxis,
    drawAxes, plotLine, yRange, el
  } = FTN;

  function params() {
    const Rs = Math.max(10, +el.Rs.value || 1000);
    const Ts = 1 / Rs;
    return {
      Ts,
      betaTx: Math.min(1, Math.max(0, +el.betaTx.value || 0.25)),
      betaRx: Math.min(1, Math.max(0, +el.betaRx.value || 0.25)),
      BW: Math.max(1, +el.BW.value || 1500),
      winSyms: Math.max(3, Math.min(30, +el.win.value || 8)),
      os: Math.max(8, Math.min(128, +el.os.value || 32))
    };
  }

  function render() {
    const p = params();
    const { t, dt, fs } = makeTimeAxis(p.Ts, p.os, p.winSyms);

    // TX
    const htx = t.map(tt => hRRC(tt, p.Ts, p.betaTx));
    const txSpec = spectrumMag(htx, fs, 1024);

    // Channel
    const hch = t.map(tt => channelIR(tt, p.BW));
    const chSpec = spectrumMag(hch, fs, 1024);

    // RX
    const hrx = t.map(tt => hRRC(tt, p.Ts, p.betaRx));
    const htx_ch = convolve(htx, hch);
    const htot = convolve(htx_ch, hrx);
    const tTot = new Array(htot.length);
    const t0 = -((htot.length - 1) / 2) * dt;
    for (let i = 0; i < htot.length; i++) tTot[i] = t0 + i * dt;
    const rxSpec = spectrumMag(htot, fs, 1024);

    // ===== Canvas 1: TX =====
    {
      const ctx = el.canvasTx.getContext("2d");
      ctx.clearRect(0, 0, el.canvasTx.width, el.canvasTx.height);
      const halfW = el.canvasTx.width / 2;
      const fullH = el.canvasTx.height;

      // Left: TX time
      drawAxes(ctx, 0, 0, halfW, fullH, "t (s)", "amp");
      const [y0t, y1t] = yRange(htx);
      plotLine(ctx, 0, 0, halfW, fullH, t, htx, t[0], t[t.length - 1], y0t, y1t, "#fff", 1.5);

      // Right: TX freq
      drawAxes(ctx, halfW, 0, halfW, fullH, "f (Hz)", "|H|");
      const [y0f, y1f] = yRange(txSpec.mag);
      plotLine(ctx, halfW, 0, halfW, fullH, txSpec.freq, txSpec.mag,
               txSpec.freq[0], txSpec.freq[txSpec.freq.length - 1], y0f, y1f, "#fff", 1.5);
    }

    // ===== Canvas 2: CH =====
    {
      const ctx = el.canvasCh.getContext("2d");
      ctx.clearRect(0, 0, el.canvasCh.width, el.canvasCh.height);
      const halfW = el.canvasCh.width / 2;
      const fullH = el.canvasCh.height;

      // Left: CH time
      drawAxes(ctx, 0, 0, halfW, fullH, "t (s)", "amp");
      const [y0t, y1t] = yRange(hch);
      plotLine(ctx, 0, 0, halfW, fullH, t, hch, t[0], t[t.length - 1], y0t, y1t, "#fff", 1.5);

      // Right: CH freq + overlay TX
      drawAxes(ctx, halfW, 0, halfW, fullH, "f (Hz)", "|H|");
      const [y0f, y1f] = yRange(chSpec.mag.concat(txSpec.mag));
      plotLine(ctx, halfW, 0, halfW, fullH, chSpec.freq, chSpec.mag,
               chSpec.freq[0], chSpec.freq[chSpec.freq.length - 1], y0f, y1f, "#fff", 1.5);
      plotLine(ctx, halfW, 0, halfW, fullH, txSpec.freq, txSpec.mag,
               txSpec.freq[0], txSpec.freq[txSpec.freq.length - 1], y0f, y1f, "#0ff", 1.0);
    }

    // ===== Canvas 3: RX =====
    {
      const ctx = el.canvasRx.getContext("2d");
      ctx.clearRect(0, 0, el.canvasRx.width, el.canvasRx.height);
      const halfW = el.canvasRx.width / 2;
      const fullH = el.canvasRx.height;

      // Left: RX time
      drawAxes(ctx, 0, 0, halfW, fullH, "t (s)", "amp");
      const [y0t, y1t] = yRange(htot);
      plotLine(ctx, 0, 0, halfW, fullH, tTot, htot, tTot[0], tTot[tTot.length - 1], y0t, y1t, "#fff", 1.5);

      // Right: RX freq
      drawAxes(ctx, halfW, 0, halfW, fullH, "f (Hz)", "|H|");
      const [y0f, y1f] = yRange(rxSpec.mag);
      plotLine(ctx, halfW, 0, halfW, fullH, rxSpec.freq, rxSpec.mag,
               rxSpec.freq[0], rxSpec.freq[rxSpec.freq.length - 1], y0f, y1f, "#fff", 1.5);
    }
  }

  // Hook up events to render all three canvases
  [el.Rs, el.betaTx, el.betaRx, el.BW, el.win, el.os].forEach(elm => {
    elm.addEventListener("input", render);
    elm.addEventListener("change", render);
  });

  render();
})();
