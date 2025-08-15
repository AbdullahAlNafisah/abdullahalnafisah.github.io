(function(){
  const canvas = document.getElementById("scope");
  const ctx = canvas.getContext("2d");
  const freqInput = document.getElementById("freq");
  const dutyInput = document.getElementById("duty");

  function params(){
    return {
      f: parseFloat(freqInput.value) || 50,
      duty: (parseFloat(dutyInput.value) || 10) / 100,
      span: 0.02 // seconds across the canvas
    };
  }

  function sample(p, t){
    const T = 1 / p.f; // period in seconds
    const x = t % T;
    return x < p.duty * T ? 1 : 0;
  }

  function render(){
    const p = params();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "#0f0";
    ctx.lineWidth = 2;
    ctx.beginPath();
    for(let i=0; i<canvas.width; i++){
      const t = (i/canvas.width) * p.span;
      const v = sample(p, t);
      const y = v ? 50 : 150; // vertical position for high/low
      if(i === 0) ctx.moveTo(i, y);
      else ctx.lineTo(i, y);
    }
    ctx.stroke();
    requestAnimationFrame(render);
  }

  freqInput.addEventListener("input", render);
  dutyInput.addEventListener("input", render);

  render();
})();
