// centers you want
const centers = [-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5];
// NEW: symbol values (peaks) to apply at each center
const symbols = [-1, -1, 1, -1, 1, 1, -1, -1, 1, -1, 1];

// time vector (in symbol periods)
const tMin = -6, tMax = 6, N = 1000;
const t = Array.from({length: N+1}, (_, i) => tMin + (i/N) * (tMax - tMin));

// initial plot
const betaEl = document.getElementById('rrc-pulse-beta');
const initBeta = parseFloat(betaEl.value);

// Initial plot
Plotly.newPlot('rrc-pulse-plot', makeTraces(initBeta), {
  title: `Symbols = [${symbols.join(', ')}] · Ts = 1 · β=${initBeta.toFixed(2)}`,
  xaxis: { title: 't / Ts', zeroline: true, range: [tMin, tMax] },
  yaxis: { title: 'h(t)', zeroline: true, range: [-2, 2] },
}, {responsive: true});

// Update plot
function update() {
  const beta = parseFloat(betaEl.value);
  Plotly.react('rrc-pulse-plot', makeTraces(beta), {
    title: `Symbols = [${symbols.join(', ')}] · Ts = 1 · β=${beta.toFixed(2)}`, // use current β
    xaxis: { title: 't / Ts', range: [tMin, tMax] },
    yaxis: { title: 'h(t)', range: [-2, 2] },
  });
}

// make shifted traces for a given beta (plus the summed signal)
function makeTraces(beta) {
  // per-pulse traces with sign from `symbols`
  const traces = centers.map((c, i) => ({
    x: t,
    y: t.map(tt => symbols[i] * h_rc(tt - c, beta)), // sign/peak applied here
    mode: 'lines',
    name: `t₀=${c}, a=${symbols[i]}`
  }));

  // summed signal across all pulses
  const ySum = t.map(tt =>
    centers.reduce((acc, c, i) => acc + symbols[i] * h_rc(tt - c, beta), 0)
  );

  traces.push({
    x: t,
    y: ySum,
    mode: 'lines',
    name: 'sum',
    line: { width: 3, dash: 'dot' }
  });

  return traces;
}

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

betaEl.addEventListener('input', update);
