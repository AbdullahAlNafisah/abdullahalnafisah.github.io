<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Interactive Sync Pulse Demo</title>
  <style>
    :root{
      --bg:#0b0e13; --panel:#121723; --ink:#e8eefc; --muted:#9bb0d3; --accent:#6bc9ff;
      --grid:#1a2233; --grid-strong:#223049; --high:#7eff9f; --low:#3f88ff; --trace:#e8eefc;
    }
    *{box-sizing:border-box}
    html,body{height:100%}
    body{margin:0; font:14px/1.4 system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, "Helvetica Neue", Arial, "Apple Color Emoji", "Segoe UI Emoji"; background:var(--bg); color:var(--ink)}
    .wrap{max-width:1100px; margin:24px auto; padding:0 16px}
    h1{font-size:clamp(20px, 3.5vw, 34px); margin:0 0 12px; letter-spacing:0.2px}
    .sub{color:var(--muted); margin-bottom:18px}
    .layout{display:grid; grid-template-columns: 1.2fr 1fr; gap:16px}
    @media (max-width: 950px){.layout{grid-template-columns:1fr;}}

    .scope{background:var(--panel); border-radius:16px; padding:16px; box-shadow:0 10px 30px rgba(0,0,0,.35)}
    canvas{width:100%; height:420px; display:block; background:linear-gradient(180deg, #0f1624 0%, #0f1420 100%); border-radius:12px}
    .ruler{display:flex; justify-content:space-between; color:var(--muted); font-size:12px; margin-top:6px}

    .controls{background:var(--panel); border-radius:16px; padding:16px; box-shadow:0 10px 30px rgba(0,0,0,.35)}
    .grid{display:grid; grid-template-columns: 1fr 1fr; gap:12px}
    @media (max-width:520px){.grid{grid-template-columns:1fr}}
    .ctrl{display:flex; align-items:center; gap:10px; background:#0f1522; padding:10px 12px; border-radius:12px; border:1px solid #1e2940}
    .ctrl label{flex:0 0 140px; color:var(--muted)}
    .ctrl input[type="number"], .ctrl input[type="range"], .ctrl select{
      width:100%; accent-color:var(--accent); color:var(--ink); background:#0c1220; border:1px solid #21304a; border-radius:10px; padding:8px 10px;
    }
    .ctrl input[type="range"]{padding:0; height:30px}
    .row{display:flex; gap:10px}
    .row > *{flex:1}
    .hint{font-size:12px; color:var(--muted)}

    .actions{display:flex; gap:10px; margin-top:12px; flex-wrap:wrap}
    button{appearance:none; border:0; border-radius:12px; padding:10px 14px; font-weight:600; cursor:pointer; color:#0b1220}
    .primary{background:var(--accent)}
    .ghost{background:transparent; color:var(--ink); border:1px solid #2a3a58}
    .badge{font-variant-numeric:tabular-nums; font-size:12px; color:var(--muted)}
    .kpi{display:flex; gap:18px; margin-top:8px}
    .kpi div{background:#0f1522; border:1px solid #1e2940; padding:8px 12px; border-radius:10px}
  </style>
</head>
<body>
  <div class="wrap">
    <h1>Sync Pulse Generator</h1>
    <div class="sub">Visualize and tweak a time‑domain sync pulse (square/TTL‑style) in real time. Adjust frequency, duty cycle, amplitude, phase, rise/fall time, jitter, and timespan.</div>

    <div class="layout">
      <section class="scope">
        <canvas id="scope" width="1100" height="420" aria-label="Oscilloscope waveform"></canvas>
        <div class="ruler"><span id="leftScale">0 ms</span><span id="rightScale">—</span></div>
        <div class="kpi">
          <div>Period: <span class="badge" id="periodOut">—</span></div>
          <div>Pulse Width: <span class="badge" id="pwOut">—</span></div>
          <div>V<sub>high</sub>: <span class="badge" id="vhOut">—</span></div>
          <div>V<sub>low</sub>: <span class="badge" id="vlOut">—</span></div>
        </div>
      </section>

      <section class="controls" aria-label="controls">
        <div class="grid">
          <div class="ctrl"><label for="freq">Frequency (Hz)</label><input id="freq" type="number" min="0.01" step="0.01" value="50"></div>
          <div class="ctrl"><label for="timespan">Time Span (ms)</label><input id="timespan" type="number" min="1" step="1" value="20"></div>

          <div class="ctrl"><label for="duty">Duty Cycle (%)</label><input id="duty" type="range" min="1" max="99" step="0.1" value="10"></div>
          <div class="ctrl"><label for="amp">Amplitude (V)</label><input id="amp" type="number" min="0" step="0.1" value="5"></div>

          <div class="ctrl"><label for="offset">Offset (V)</label><input id="offset" type="number" step="0.1" value="0"></div>
          <div class="ctrl"><label for="phase">Phase (°)</label><input id="phase" type="range" min="0" max="360" step="1" value="0"></div>

          <div class="ctrl"><label for="rise">Rise Time (ms)</label><input id="rise" type="number" min="0" step="0.01" value="0.05"></div>
          <div class="ctrl"><label for="fall">Fall Time (ms)</label><input id="fall" type="number" min="0" step="0.01" value="0.05"></div>

          <div class="ctrl"><label for="jitter">Jitter (±%)</label><input id="jitter" type="range" min="0" max="10" step="0.1" value="0"></div>
          <div class="ctrl"><label for="mode">Waveform</label>
            <select id="mode">
              <option value="square" selected>Square (sync)</option>
              <option value="tri">Triangle</option>
              <option value="sine">Sine</option>
            </select>
          </div>
        </div>
        <div class="actions">
          <button class="primary" id="reset">Reset</button>
          <button class="ghost" id="exportPng">Export PNG</button>
          <button class="ghost" id="pause">Pause</button>
        </div>
        <div class="hint">Tip: Increase Time Span to see multiple periods, or add a little jitter and press Pause to freeze a frame.</div>
      </section>
    </div>
  </div>

<script>
(function(){
  const $ = (id) => document.getElementById(id);
  const canvas = $("scope");
  const ctx = canvas.getContext("2d");

  const controls = {
    freq: $("freq"), duty: $("duty"), amp: $("amp"), offset: $("offset"),
    phase: $("phase"), rise: $("rise"), fall: $("fall"), jitter: $("jitter"),
    timespan: $("timespan"), mode: $("mode"),
  };

  const periodOut = $("periodOut"), pwOut = $("pwOut"), vhOut = $("vhOut"), vlOut=$("vlOut");
  const leftScale = $("leftScale"), rightScale = $("rightScale");

  const buttons = { reset: $("reset"), exportPng: $("exportPng"), pause: $("pause") };

  let running = true;

  function clamp(v, lo, hi){ return Math.max(lo, Math.min(hi, v)); }
  function smoothstep(edge0, edge1, x){ // 0..1
    const t = clamp((x - edge0) / Math.max(1e-9, (edge1 - edge0)), 0, 1);
    return t * t * (3 - 2 * t);
  }

  function params(){
    const f = Math.max(0.01, parseFloat(controls.freq.value) || 0.01);
    const T = 1 / f; // seconds
    const spanMs = Math.max(1, parseFloat(controls.timespan.value) || 20);
    const span = spanMs / 1000; // seconds
    const duty = clamp(parseFloat(controls.duty.value) || 10, 0.1, 99.9) / 100; // 0..1
    const amp = parseFloat(controls.amp.value) || 5;
    const offset = parseFloat(controls.offset.value) || 0;
    const phaseDeg = parseFloat(controls.phase.value) || 0;
    const phase = (phaseDeg / 360) * T; // seconds shift
    const rise = Math.max(0, parseFloat(controls.rise.value) || 0) / 1000; // to seconds
    const fall = Math.max(0, parseFloat(controls.fall.value) || 0) / 1000;
    const jitterPct = Math.max(0, parseFloat(controls.jitter.value) || 0) / 100;
    const mode = controls.mode.value;
    return { f, T, span, spanMs, duty, amp, offset, phase, rise, fall, jitterPct, mode };
  }

  function updateKPIs(p){
    periodOut.textContent = (p.T*1000).toFixed(3) + " ms";
    pwOut.textContent = (p.T * p.duty * 1000).toFixed(3) + " ms";
    vhOut.textContent = (p.offset + p.amp).toFixed(3) + " V";
    vlOut.textContent = (p.offset).toFixed(3) + " V";
    rightScale.textContent = p.spanMs.toFixed(0) + " ms";
  }

  function drawGrid(p){
    const w = canvas.width, h = canvas.height;
    ctx.clearRect(0,0,w,h);
    ctx.save();
    ctx.lineWidth = 1;

    // background gradient already via CSS; draw grid
    ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--grid');
    ctx.beginPath();
    const cols = 10, rows = 8;
    for(let i=1;i<cols;i++){
      const x = (i/cols)*w; ctx.moveTo(x,0); ctx.lineTo(x,h);
    }
    for(let j=1;j<rows;j++){
      const y = (j/rows)*h; ctx.moveTo(0,y); ctx.lineTo(w,y);
    }
    ctx.stroke();

    // strong axes (0 V and mid)
    ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--grid-strong');
    ctx.beginPath();
    const y0 = valueToY(p, p.offset); // baseline at offset
    ctx.moveTo(0,y0); ctx.lineTo(w,y0);
    ctx.stroke();

    ctx.restore();
  }

  function valueToY(p, v){
    // Map voltage to canvas Y. Show from offset - amp*0.2 to offset + amp*1.2 for headroom
    const w = canvas.width, h = canvas.height;
    const vMin = p.offset - p.amp*0.2;
    const vMax = p.offset + p.amp*1.2;
    const t = (v - vMin) / (vMax - vMin);
    return h - t * h;
  }

  function timeToX(p, t){
    return (t / p.span) * canvas.width;
  }

  function sample(p, t, periodJitter=0){
    // Generate waveform value at time t with jittered period (for animation)
    const Tj = p.T * (1 + periodJitter);
    const dutyWidth = p.duty * Tj;
    let x = (t + p.phase) % Tj;

    if(p.mode === 'sine'){
      return p.offset + (p.amp/2) * (1 + Math.sin(2*Math.PI*(t + p.phase)/Tj));
    }
    if(p.mode === 'tri'){
      const tri = x < Tj/2 ? (2*x/Tj) : (2 - 2*x/Tj); // 0..1..0
      return p.offset + p.amp * tri;
    }

    // square with finite rise/fall using smoothstep
    const tr = Math.max(1e-9, p.rise);
    const tf = Math.max(1e-9, p.fall);

    // rising edge around 0, falling edge around dutyWidth
    const up = smoothstep(0, tr, x);
    const down = 1 - smoothstep(dutyWidth - tf, dutyWidth, x);
    const level = clamp(Math.min(up, down), 0, 1); // 0..1

    return p.offset + p.amp * level;
  }

  function drawTrace(p){
    const w = canvas.width, h = canvas.height;
    ctx.save();
    ctx.lineWidth = 2;
    ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--trace');
    ctx.beginPath();

    const samples = w; // per pixel
    const jitter = p.jitterPct;
    let jitterNow = (jitter>0? (Math.random()*2-1)*jitter : 0);

    for(let i=0;i<=samples;i++){
      const t = (i/samples) * p.span;
      if(i % 40 === 0 && jitter>0){ // vary occasionally for a realistic look
        jitterNow = (Math.random()*2-1)*jitter;
      }
      const v = sample(p, t, jitterNow);
      const x = (i/samples) * w;
      const y = valueToY(p, v);
      if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
    }
    ctx.stroke();

    // draw high/low markers on the left
    ctx.fillStyle = '#9bb0d3';
    ctx.font = '12px system-ui, -apple-system, Segoe UI, Roboto';
    ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.fillText((p.offset + p.amp).toFixed(2) + ' V', 8, valueToY(p, p.offset + p.amp));
    ctx.fillText((p.offset).toFixed(2) + ' V', 8, valueToY(p, p.offset));

    ctx.restore();
  }

  function render(){
    const p = params();
    updateKPIs(p);
    drawGrid(p);
    drawTrace(p);
    leftScale.textContent = '0 ms';
    rightScale.textContent = p.spanMs.toFixed(0) + ' ms';
  }

  // Events
  Object.values(controls).forEach(el => el.addEventListener('input', render));
  buttons.reset.addEventListener('click', () => {
    controls.freq.value = 50;
    controls.timespan.value = 20;
    controls.duty.value = 10;
    controls.amp.value = 5;
    controls.offset.value = 0;
    controls.phase.value = 0;
    controls.rise.value = 0.05;
    controls.fall.value = 0.05;
    controls.jitter.value = 0;
    controls.mode.value = 'square';
    render();
  });
  buttons.exportPng.addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = 'sync-pulse.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  });
  buttons.pause.addEventListener('click', () => {
    running = !running;
    buttons.pause.textContent = running ? 'Pause' : 'Resume';
  });

  // Animation loop (only used when jitter > 0 to make it feel live)
  function tick(){
    if(running){ render(); }
    requestAnimationFrame(tick);
  }

  // Initial paint
  render();
  tick();
})();
</script>
</body>
</html>
