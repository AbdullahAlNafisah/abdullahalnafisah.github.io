
  // --- math: raised-cosine impulse response h(t) with Ts = 1 ---
  function h_rc(t, beta) {
    const pi = Math.PI;
    const eps = 1e-10;

    // β = 0 -> sinc
    if (beta < 1e-12) {
      if (Math.abs(t) < eps) return 1;
      return Math.sin(pi * t) / (pi * t);
    }

    // t = 0
    if (Math.abs(t) < 1e-10) {
      return 1 * (1 + beta * (4 / pi - 1)); // 1/Ts * ( ... ), Ts=1
    }

    // t = ± 1/(4β)
    const tEdge = 1 / (4 * beta);
    if (Math.abs(Math.abs(t) - tEdge) < 1e-8) {
      const term = (1 + 2 / pi) * Math.sin(pi / (4 * beta))
                 + (1 - 2 / pi) * Math.cos(pi / (4 * beta));
      return (beta / Math.SQRT2) * term;
    }

    // general
    const num = Math.sin(pi * t * (1 - beta)) + 4 * beta * t * Math.cos(pi * t * (1 + beta));
    const den = (pi * t) * (1 - Math.pow(4 * beta * t, 2));
    return num / den;
  }

  // time vector (in symbol periods)
  const tMin = -6, tMax = 6, N = 2400;
  const t = Array.from({length: N+1}, (_, i) => tMin + (i/N) * (tMax - tMin));

  // compute y for a given beta
  function y_rc(beta) { return t.map(tt => h_rc(tt, beta)); }

  // initial plot
  const betaEl = document.getElementById('beta');
  const betaOut = document.getElementById('betaOut');
  const initBeta = parseFloat(betaEl.value);

  Plotly.newPlot('plot', [{
    x: t, y: y_rc(initBeta), mode: 'lines', name: `β=${initBeta.toFixed(2)}`
  }], {
    title: `Raised-cosine impulse response h(t) · Ts = 1 · β=${initBeta.toFixed(2)}`,
    xaxis: { title: 't / Ts', zeroline: true, range: [tMin, tMax] },
    yaxis: { title: 'h(t)', zeroline: true, range: [-1.5, 1.5] },
    margin: { l: 60, r: 20, t: 50, b: 45 },
  }, {responsive: true});

  // live update when client changes β
  function update() {
    const beta = parseFloat(betaEl.value);
    betaOut.value = beta.toFixed(2);
    const y = y_rc(beta);
    Plotly.react('plot',
      [{ x: t, y, mode: 'lines', name: `β=${beta.toFixed(2)}` }],
      {
        title: `Raised-cosine impulse response h(t) · Ts = 1 · β=${beta.toFixed(2)}`,
        xaxis: { title: 't / Ts', range: [tMin, tMax] },
        yaxis: { title: 'h(t)', range: [-1.5, 1.5] },
        margin: { l: 60, r: 20, t: 50, b: 45 },
      }
    );
  }

  betaEl.addEventListener('input', update);